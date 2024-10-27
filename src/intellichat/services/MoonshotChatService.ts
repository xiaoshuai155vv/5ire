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
import { isBlank } from 'utils/validators';
import Moonshot from 'providers/Moonshot';

const debug = Debug('5ire:intellichat:MoonshotChatService');
const MAX_CONCAT_TIMES = 2;

export default class MoonshotChatService
  extends BaseChatService
  implements IChatService
{
  constructor(context: IChatContext) {
    super({
      context,
      provider: Moonshot,
    });
  }

  private composeMessages(message: string): IChatRequestMessage[] {
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
    let concats = 0;
    return lines.map((line: string) => {
      msg += line;
      concats += 1;
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
        concats = 0;
        return {
          content: result,
          isEnd: false,
        };
      } catch (err) {
        if (concats >= MAX_CONCAT_TIMES) {
          msg = '';
          concats = 0;
          debug(err);
          debug(`concats:${concats},data:${data}`);
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
