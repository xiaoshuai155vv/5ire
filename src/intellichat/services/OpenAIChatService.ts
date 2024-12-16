import Debug from 'debug';
import {
  IChatContext,
  IChatResponseMessage,
  IChatRequestMessage,
  IChatRequestPayload,
  IChatMessage,
  IChatRequestMessageContent,
} from 'intellichat/types';
import OpenAI from '../../providers/OpenAI';
import { isBlank } from 'utils/validators';
import { splitByImg, stripHtmlTags } from 'utils/util';
import NextChatService, { ITool } from './NextChatService';
import INextChatService from './INextCharService';
import { merge } from 'lodash';

const debug = Debug('5ire:intellichat:OpenAIChatService');
const MAX_SPLICE = 3;

export default class OpenAIChatService
  extends NextChatService
  implements INextChatService
{
  constructor(context: IChatContext) {
    super({
      context,
      provider: OpenAI,
    });
  }

  protected async convertPromptContent(
    content: string
  ): Promise<string | IChatRequestMessageContent[]> {
    if (this.context.getModel().vision?.enabled) {
      const items = splitByImg(content);
      const result: IChatRequestMessageContent[] = [];
      items.forEach((item: any) => {
        if (item.type === 'image') {
          result.push({
            type: 'image_url',
            image_url: {
              url: item.data,
            },
          });
        } else if (item.type === 'text') {
          result.push({
            type: 'text',
            text: item.data,
          });
        } else {
          console.error('Unknown message type', item);
          throw new Error('Unknown message type');
        }
      });
      return result
    }
    return stripHtmlTags(content)
  }

  protected async makeMessages(
    messages: IChatRequestMessage[]
  ): Promise<IChatRequestMessage[]> {
    const result = [];
    const systemMessage = this.context.getSystemMessage();
    if (!isBlank(systemMessage)) {
      result.push({
        role: 'system',
        content: systemMessage,
      });
    }
    this.context.getCtxMessages().forEach((msg: IChatMessage) => {
      result.push({
        role: 'user',
        content: msg.prompt,
      });
      result.push({
        role: 'assistant',
        content: msg.reply,
      });
    });
    for (const msg of messages) {
      if (msg.role === 'tool') {
        result.push({
          role: 'tool',
          content: JSON.stringify(msg.content),
          name: msg.name,
          tool_call_id: msg.tool_call_id,
        });
      } else if (msg.role === 'assistant' && msg.tool_calls) {
        result.push(msg);
      } else {
        result.push({
          role: 'user',
          content: await this.convertPromptContent(msg.content as string),
        });
      }
    }
    return result as IChatRequestMessage[]
  }

  protected async makePayload(
    message: IChatRequestMessage[]
  ): Promise<IChatRequestPayload> {
    const model = this.context.getModel();
    const payload: IChatRequestPayload = {
      model: model.name,
      messages: await this.makeMessages(message),
      temperature: this.context.getTemperature(),
      stream: true,
    };
    if (model.toolEnabled) {
      const tools = await window.electron.mcp.listTools();
      debug('tools', tools);
      if (tools) {
        const _tools = tools
          .filter((tool: any) => !this.usedToolNames.includes(tool.name))
          .map((tool: any) => {
            return {
              type: 'function',
              function: {
                name: tool.name,
                description: tool.description,
                parameters: {
                  type: tool.inputSchema.type,
                  properties: tool.inputSchema.properties,
                  required: tool.inputSchema.required,
                  additionalProperties: tool.inputSchema.additionalProperties,
                },
              },
            };
          });
        if (_tools.length > 0) {
          payload.tools = _tools;
          payload.tool_choice = 'auto';
        }
      }
    }
    if (this.context.getMaxTokens()) {
      payload.max_tokens = this.context.getMaxTokens();
    }
    return payload;
  }

  protected parseTools(respMsg: IChatResponseMessage): ITool | null {
    if (respMsg.toolCalls) {
      return {
        id: respMsg.toolCalls[0].id,
        name: respMsg.toolCalls[0].function.name,
      };
    }
    return null;
  }

  protected parseToolArgs(respMsg: IChatResponseMessage): {
    index: number;
    args: string;
  } {
    debug('parseToolArgs', JSON.stringify(respMsg));
    try {
      if (respMsg.isEnd || !respMsg.toolCalls) {
        return { index: -1, args: '' };
      }
      const toolCalls = respMsg.toolCalls[0];
      return {
        index: toolCalls.index,
        args: toolCalls.function.arguments,
      };
    } catch (err) {
      console.error('parseToolArgs', err);
    }
    return { index: -1, args: '' };
  }

  protected parseReply(chunk: string): IChatResponseMessage {
    if (chunk === '[DONE]') {
      return {
        content: '',
        isEnd: true,
      };
    }
    const choice = JSON.parse(chunk).choices[0];
    return {
      content: choice.delta.content || '',
      isEnd: false,
      toolCalls: choice.delta.tool_calls,
    };
  }

  protected async read(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    status: number,
    decoder: TextDecoder,
    onProgress: (content: string) => void
  ): Promise<{ reply: string; context: any }> {
    let reply = '';
    let context: any = null;
    let isFunction = false;
    let functionArgs: string[] = [];
    let prevChunk = '';
    let chunk = '';
    let splices = 0;
    let response = null;
    let index = 0;
    let done = false;
    try {
      while (!done) {
        if (this.aborted) {
          break;
        }
        /* eslint-disable no-await-in-loop */
        const data = await reader.read();
        done = data.done || false;
        const value = decoder.decode(data.value);
        if (status !== 200) {
          this.onReadingError(value);
        }
        const lines = value
          .split('\n')
          .map((i) => i.trim())
          .filter((i) => i !== '');

        for (const line of lines) {
          const chunks = line
            .split('data:')
            .filter((i) => i !== '')
            .map((i) => i.trim());
          for (let curChunk of chunks) {
            if (curChunk === '[DONE]') {
              done = true;
              break;
            }
            chunk = prevChunk + curChunk;
            try {
              response = this.parseReply(chunk);
              prevChunk = '';
              splices = 0;
            } catch (error) {
              if (splices > MAX_SPLICE) {
                console.error(
                  'JSON parse failed:',
                  prevChunk,
                  '\n\n',
                  curChunk
                );
                prevChunk = '';
                splices = 0;
              } else {
                prevChunk += curChunk;
                splices++;
              }
              continue;
            }
            if (response.content === null && !response.toolCalls) {
              continue;
            }
            if (index === 0) {
              const tool = this.parseTools(response);
              if (tool) {
                this.tool = {
                  id: tool.id,
                  name: tool.name,
                };
                this.onToolCallingCallback(this.tool.name);
                isFunction = true;
              }
            }
            if (isFunction) {
              const { index: argIndex, args } = this.parseToolArgs(response);
              if (index >= 0 && functionArgs[argIndex] === undefined) {
                functionArgs[argIndex] = '';
              }
              functionArgs[argIndex] += args;
            } else {
              this.tool = null;
              reply += response.content;
              onProgress(response.content || '');
              this.onReadingCallback(response.content || '');
              if (response.outputTokens) {
                this.outputTokens += response.outputTokens;
              }
              if (response.isEnd) {
                // inputToken will not change, so only the last value is taken
                if (response.inputTokens) {
                  this.inputTokens = response.inputTokens;
                }
                done = true;
              }
            }
            index++;
          }
        }
      }
      if (this.tool) {
        const args = functionArgs.map((arg) => JSON.parse(arg));
        this.tool.args = merge({}, ...args);
        this.usedToolNames.push(this.tool.name);
      }
    } catch (err) {
      console.error('OpenAIChatService read error:', err);
    }
    return { reply, context };
  }

  protected async makeRequest(
    messages: IChatRequestMessage[]
  ): Promise<Response> {
    const payload = await this.makePayload(messages);
    debug('About to make a request, payload:\r\n', payload);
    const { base, key } = this.apiSettings;
    const response = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
      signal: this.abortController.signal,
    });
    return response;
  }
}
