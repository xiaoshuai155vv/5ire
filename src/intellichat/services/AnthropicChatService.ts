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
import BaseChatService from './BaseChatService';
import Anthropic from '../../providers/Anthropic';
import { isBlank } from 'utils/validators';
import { getBase64, splitByImg, stripHtmlTags } from 'utils/util';

const debug = Debug('5ire:intellichat:AnthropicChatService');

export default class AnthropicChatService
  extends BaseChatService
  implements IChatService
{
  protected inputTokens: number;
  protected outputTokens: number;

  constructor(context: IChatContext) {
    super({
      context,
      provider: Anthropic,
    });
    this.inputTokens = 0;
    this.outputTokens = 0;
  }

  protected async composePromptMessage(
    content: string
  ): Promise<string | IChatRequestMessageContent[]> {
    if (this.context.getModel().vision?.enabled) {
      const items = splitByImg(content);
      const result: IChatRequestMessageContent[] = [];
      for(let item of items){
        if (item.type === 'image') {
          let data = '';
          if(item.dataType === 'URL'){
            data = await getBase64(item.data)
          }else{
            data = item.data.split(',')[1] // remove data:image/png;base64,
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

  private async  composeMessages(message: string): Promise<IChatRequestMessage[]> {
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
    result.push({ role: 'user', content: await this.composePromptMessage(message) });
    return result as IChatRequestMessage[];
  }

  protected async makePayload(message: string): Promise<IChatRequestPayload> {
    const payload: IChatRequestPayload = {
      model: this.context.getModel().name,
      messages: await this.composeMessages(message),
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

  protected parseReplyMessage(chunk: string): IChatResponseMessage[] {
    const lines = chunk
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i !== '');

    return lines
      .filter((line: string) => line.startsWith('data:'))
      .map((line: string) => {
        const data = JSON.parse(line.substring(5).trim());
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
      });
  }

  protected async makeRequest(message: string): Promise<Response> {
    this.inputTokens = 0;
    this.outputTokens = 0;
    const payload = await this.makePayload(message);
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
