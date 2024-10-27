import Debug from 'debug';
import BaseChatService from './BaseChatService';
import IChatService from './IChatService';
import Baidu from '../../providers/Baidu';
import {
  IChatContext,
  IChatMessage,
  IChatRequestMessage,
  IChatRequestPayload,
  IChatResponseMessage,
} from '../types';
import { date2unix } from 'utils/util';
import { isBlank } from 'utils/validators';

const debug = Debug('5ire:intellichat:BaiduChatService');

export interface IBaiduToken {
  accessToken: string;
  expiresIn: number;
  createdAt: number;
}

export default class BaiduChatService extends BaseChatService implements IChatService {
  constructor(context: IChatContext) {
    super({
      context,
      provider: Baidu,
    });
  }

  private composeMessages(message: string): IChatRequestMessage[] {
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
    result.push({ role: 'user', content: message });
    return result as IChatRequestMessage[];
  }

  protected async makePayload(message: string): Promise<IChatRequestPayload> {
    const payload: IChatRequestPayload = {
      messages: this.composeMessages(message),
      temperature: this.context.getTemperature(),
      stream: true,
    };
    const systemMessage = this.context.getSystemMessage();
    if (!isBlank(systemMessage)) {
      payload.system = systemMessage as string;
    }
    debug('makePayload: ', payload);
    return Promise.resolve(payload);
  }

  protected onMessageError(chunk: string) {
    console.error(chunk);
  }

  private async getAccessToken(): Promise<string> {
    const token = localStorage.getItem('baidu-token');
    if (!token) {
      debug('No access token found, requesting...');
      return (await this.requestAccessToken()).accessToken;
    }
    const { expiresIn, createdAt, accessToken } = JSON.parse(token);
    if (date2unix(new Date()) - createdAt > expiresIn) {
      debug('Access token expired, requesting...');
      return (await this.requestAccessToken()).accessToken;
    }
    return accessToken;
  }

  private async requestAccessToken(): Promise<IBaiduToken> {
    const { base, key, secret } = this.apiSettings;
    const response = await fetch(
      `${base}/oauth/2.0/token?grant_type=client_credentials&client_id=${key}&client_secret=${secret}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const result = await response.json();
    debug('Got access token: ', result);
    const token = {
      accessToken: result.access_token,
      expiresIn: result.expires_in,
      createdAt: date2unix(new Date()),
    };
    localStorage.setItem('baidu-token', JSON.stringify(token));
    return token;
  }

  protected parseReplyMessage(chunk: string): IChatResponseMessage[] {
    if (chunk.startsWith('data:')) {
      const lines = chunk
        .split('\n')
        .map((i) => i.trim())
        .filter((i) => i !== '');
      return lines.map((line: string) => {
        const data = JSON.parse(line.substring(5).trim());
        return {
          content: data.result as string,
          isEnd: data.is_end as boolean,
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
        };
      });
    } else {
      debug('Error occurred while generating: ', chunk);
      // {error_code:'', error_msg:''}
      const error = JSON.parse(chunk);
      throw { code: error.error_code, message: error.error_msg };
    }
  }

  protected async makeRequest(message: string): Promise<Response> {
    const payload = await this.makePayload(message);
    debug('About to make a request, payload:\r\n', payload);
    const { base, key } = this.apiSettings;

    const accessToken = await this.getAccessToken();
    const model = this.context.getModel()

    // TODO 有些 model 的 endpoint 是申请的时候用户自己填写的，这种情况需要用户自己在设置的时候填写
    const url = `${base}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${model.endpoint}?access_token=${accessToken}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: this.abortController.signal,
    });
    return response;
  }
}
