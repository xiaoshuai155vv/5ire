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
import OpenAI from '../../providers/OpenAI';
import { isBlank } from 'utils/validators';
import { splitByImg, stripHtmlTags } from 'utils/util';

const debug = Debug('5ire:intellichat:OpenAIChatService');
const MAX_CONCAT_TIMES = 2;

export default class OpenAIChatService
  extends BaseChatService
  implements IChatService
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
    if(this.context.getModel().vision?.enabled){
      const items = splitByImg(content);
      const result: IChatRequestMessageContent[] = [];
      items.forEach((item: any) => {
        if (item.type==='image') {
          result.push({
            type: 'image_url',
            image_url: {
              url: item.data
            },
          })

        }else if(item.type === 'text'){
          result.push({
            type: 'text',
            text: item.data,
          });
        }else{
          console.error('Unknown message type', item);
          throw new Error('Unknown message type');
        }
      });
      return result;
    }
    return stripHtmlTags(content)
  }

  protected composeMessages(message: string): IChatRequestMessage[] {
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
    result.push({ role: 'user', content: this.composePromptMessage(message) });
    return result as IChatRequestMessage[];
  }

  protected async makePayload(message: string):  Promise<IChatRequestPayload> {
    const payload: IChatRequestPayload = {
      model: this.context.getModel().name,
      messages: this.composeMessages(message),
      temperature: this.context.getTemperature(),
      stream: true,
    };
    if (this.context.getMaxTokens()) {
      payload.max_tokens = this.context.getMaxTokens();
    }
    debug('payload', payload);
    return Promise.resolve(payload);;
  }

  protected parseReplyMessage(chunk: string): IChatResponseMessage[] {
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
        result = choice.delta.content;
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
          debug(`concats:${concatTimes},data:${data}`);
        }
        return {
          content: '',
          isEnd: false,
        };
      }
    });
  }

  protected async makeRequest(message: string): Promise<Response> {
    const payload = await this.makePayload(message);
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
