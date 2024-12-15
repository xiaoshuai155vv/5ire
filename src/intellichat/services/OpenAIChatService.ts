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

const debug = Debug('5ire:intellichat:OpenAIChatService');

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

  protected composePromptMessage(
    content: string
  ): string | IChatRequestMessageContent[] {
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
      return result;
    }
    return stripHtmlTags(content);
  }

  protected composeMessages(
    messages: IChatRequestMessage[]
  ): IChatRequestMessage[] {
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
          content: this.composePromptMessage(msg.content as string),
        });
      }
    }
    return result as IChatRequestMessage[];
  }

  protected async makePayload(
    message: IChatRequestMessage[]
  ): Promise<IChatRequestPayload> {
    const payload: IChatRequestPayload = {
      model: this.context.getModel().name,
      messages: this.composeMessages(message),
      temperature: this.context.getTemperature(),
      stream: true,
    };
    const tools = await window.electron.mcp.listTools();
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
    if (this.context.getMaxTokens()) {
      payload.max_tokens = this.context.getMaxTokens();
    }
    debug('payload', payload);
    return Promise.resolve(payload);
  }

  protected parseTools(chunk: string): ITool | null {
    let data = chunk;
    if (chunk.startsWith('data:')) {
      data = chunk.substring(5).trim();
    }
    const choice = JSON.parse(data).choices[0];
    let tool = null;
    if (choice.delta.tool_calls) {
      tool = {
        id: choice.delta.tool_calls[0].id,
        name: choice.delta.tool_calls[0].function.name,
      };
    }
    return tool;
  }

  protected parseToolArgs(chunk: string): { index: number; args: string } {
    let data = chunk;
    if (chunk.startsWith('data:')) {
      data = chunk.substring(5).trim();
    }
    try {
      const { choices } = JSON.parse(data);
      if (choices) {
        const choice = choices[0];
        if (choice.finish_reason) {
          return { index: -1, args: '' };
        }
        const toolCalls = choice.delta.tool_calls[0];
        return {
          index: toolCalls.index,
          args: toolCalls.function.arguments,
        };
      }
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
    try {
      let result = '';
      const choice = JSON.parse(chunk).choices[0];
      result = choice.delta.content || '';
      return {
        content: result,
        isEnd: false,
      };
    } catch (err) {
      debug(err);
      return {
        content: '',
        isEnd: false,
      };
    }
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
