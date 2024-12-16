import Debug from 'debug';
import {
  IChatContext,
  IChatRequestMessage,
  IChatRequestPayload,
} from 'intellichat/types';
import Moonshot from 'providers/Moonshot';
import OpenAIChatService from './OpenAIChatService';
import INextChatService from './INextCharService';

const debug = Debug('5ire:intellichat:MoonshotChatService');

export default class MoonshotChatService
  extends OpenAIChatService
  implements INextChatService
{
  constructor(context: IChatContext) {
    super(context);
    this.provider = Moonshot;
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
    if (this.context.getMaxTokens()) {
      payload.max_tokens = this.context.getMaxTokens();
    }
    debug('payload', payload);
    return Promise.resolve(payload);
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
