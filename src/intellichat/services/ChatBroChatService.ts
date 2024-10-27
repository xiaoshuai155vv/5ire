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
import ChatBro from '../../providers/ChatBro';
import { isBlank } from 'utils/validators';

const debug = Debug('5ire:intellichat:ChatBroChatService');
const MAX_CONCATS = 2;

export default class ChatBroChatService
  extends BaseChatService
  implements IChatService
{
  constructor(context: IChatContext) {
    super({
      context,
      provider: ChatBro,
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

  protected async makePayload(message: string): Promise<IChatRequestPayload> {
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
    return Promise.resolve(payload);
  }

  protected parseReplyMessage(chunk: string): IChatResponseMessage[] {
    const lines = chunk
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i !== '');
    return lines.map((line: string) => {
      if (line === 'data: [DONE]') {
        return {
          content: '',
          isEnd: true,
        };
      }
      return {
        content: decodeURIComponent(line.substring(5).trim()),
        isEnd: false,
      };
    });
  }

  protected async makeRequest(message: string): Promise<Response> {
    const payload = await this.makePayload(message);
    debug('About to make a request, payload:\r\n', payload);
    const { base, key } = this.apiSettings;
    const postResp = await fetch(`${base}/v1/open/azure/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
      },
      body: JSON.stringify(payload),
    });
    const data: any = await postResp.json();
    const response = await fetch(
      `${base}/v1/open/azure/stream/chat/${data.key}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        signal: this.abortController.signal,
      }
    );
    return response;
  }
}
