import Debug from 'debug';
import {
  IChatContext,
  IChatResponseMessage,
  IChatRequestMessage,
  IChatRequestPayload,
  IChatMessage,
  IChatRequestMessageContent,
} from 'intellichat/types';
import Anthropic from '../../providers/Anthropic';
import { isBlank } from 'utils/validators';
import { getBase64, splitByImg, stripHtmlTags } from 'utils/util';
import INextChatService from './INextCharService';
import NextChatService, { ITool } from './NextChatService';
import OpenAIChatService from './OpenAIChatService';

const debug = Debug('5ire:intellichat:AnthropicChatService');

export default class AnthropicChatService
  extends OpenAIChatService
  implements INextChatService
{
  constructor(context: IChatContext) {
    super(context);
    this.provider = Anthropic;
  }

  protected parseTools(respMsg: IChatResponseMessage): ITool | null {
    console.warn('parseTools is not implemented');
    return null;
  }

  protected parseToolArgs(respMsg: IChatResponseMessage): {
    index: number;
    args: string;
  } {
    console.warn('parseToolArgs is not implemented');
    return { index: -1, args: '' };
  }

  protected async convertPromptContent(
    content: string
  ): Promise<string | IChatRequestMessageContent[]> {
    if (this.context.getModel().vision?.enabled) {
      const items = splitByImg(content);
      const result: IChatRequestMessageContent[] = [];
      for (let item of items) {
        if (item.type === 'image') {
          let data = '';
          if (item.dataType === 'URL') {
            data = await getBase64(item.data);
          } else {
            data = item.data.split(',')[1]; // remove data:image/png;base64,
          }
          result.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: item.mimeType as string,
              data,
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
      }
      return result;
    }
    return Promise.resolve(stripHtmlTags(content));
  }

  protected async makeMessages(
    messages: IChatRequestMessage[]
  ): Promise<IChatRequestMessage[]> {
    const result = [];
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
    return result as IChatRequestMessage[];
  }

  protected async makePayload(
    messages: IChatRequestMessage[]
  ): Promise<IChatRequestPayload> {
    const payload: IChatRequestPayload = {
      model: this.context.getModel().name,
      messages: await this.makeMessages(messages),
      temperature: this.context.getTemperature(),
      stream: true,
    };
    const systemMessage = this.context.getSystemMessage();
    if (!isBlank(systemMessage)) {
      payload.system = systemMessage as string;
    }
    if (this.context.getMaxTokens()) {
      payload.max_tokens = this.context.getMaxTokens();
    }
    debug('payload', payload);
    return Promise.resolve(payload);
  }

  protected parseReply(chunk: string): IChatResponseMessage {
    const data = JSON.parse(chunk);
    if (data.type === 'content_block_delta') {
      return {
        content: data.delta.text,
        isEnd: false,
      };
    } else if (data.type === 'message_start') {
      this.inputTokens = data.message.usage.input_tokens;
      this.outputTokens = data.message.usage.output_tokens;
      return {
        content: '',
        isEnd: false,
      };
    } else if (data.type === 'message_delta') {
      this.outputTokens += data.usage.output_tokens;
      return {
        content: '',
        isEnd: false,
      };
    } else if (data.type === 'message_stop') {
      return {
        content: '',
        inputTokens: this.inputTokens,
        outputTokens: this.outputTokens,
        isEnd: true,
      };
    } else if (data.type === 'error') {
      return {
        content: '',
        error: {
          type: data.delta.type,
          message: data.delta.text,
        },
      };
    } else {
      console.warn('Unknown message type', data);
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
    const response = await fetch(`${base}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': key,
      },
      body: JSON.stringify(payload),
      signal: this.abortController.signal,
    });
    return response;
  }
}
