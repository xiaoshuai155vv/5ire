import { input } from './../../../node_modules/zod/lib/types.d';
import Debug from 'debug';
import IChatService from './IChatService';
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
const MAX_CONCAT_TIMES = 2;

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
        result.push({ role: 'tool', content: JSON.stringify(msg.content) });
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
    await window.electron.mcp.activate({
      name: 'mcp-obsidian',
      command: 'npx',
      args: [
        'mcp-obsidian',
        '/Users/ironben/Library/Mobile Documents/iCloud~md~obsidian/Documents/Ironben/',
      ],
    });
    const tools = await window.electron.mcp.listTools();
    if (tools) {
      payload.tools = tools.map((tool: any) => {
        return {
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: {
              type: tool.inputSchema.type,
              properties: tool.inputSchema.properties,
              required: tool.inputSchema.required,
            },
          },
        };
      });
      payload.tool_choice = 'auto';
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
    console.log('data', data);
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

  protected parseToolArgs(chunk: string): string {
    let data = chunk;
    if (chunk.startsWith('data:')) {
      data = chunk.substring(5).trim();
    }
    try {
      const { choices } = JSON.parse(data);
      if (choices) {
        const choice = choices[0];
        if (choice.finish_reason) {
          return '';
        }
        return choice.delta.tool_calls[0].function.arguments;
      }
    } catch (err) {
      console.error('parseToolArgs', err);
    }
    return '';
  }

  protected parseReply(chunk: string): IChatResponseMessage[] {
    debug('chunk', chunk);
    const lines = chunk
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i !== '');

    let msg = '';
    let concatTimes = 0;
    return lines.map((line: string) => {
      msg += line;
      concatTimes += 1;
      let data = msg;
      if (data.startsWith('data:')) {
        data = data.substring(5).trim();
      }

      if (data === '[DONE]') {
        return {
          content: '',
          isEnd: true,
        };
      }
      try {
        let result = '';
        const choice = JSON.parse(data).choices[0];
        result = choice.delta.content || '';
        msg = '';
        concatTimes = 0;
        return {
          content: result,
          isEnd: false,
        };
      } catch (err) {
        if (concatTimes >= MAX_CONCAT_TIMES) {
          msg = '';
          concatTimes = 0;
          debug(err);
          debug(`Concat:${concatTimes},data:${data}`);
        }
        return {
          content: '',
          isEnd: false,
        };
      }
    });
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
