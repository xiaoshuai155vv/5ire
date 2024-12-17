import Debug from 'debug';
import {
  IChatContext,
  IChatRequestMessage,
  IChatResponseMessage,
} from 'intellichat/types';

import OpenAIChatService from './OpenAIChatService';
import Fire from 'providers/Fire';
import useAuthStore from 'stores/useAuthStore';
import INextChatService from './INextCharService';
import FireReader from 'intellichat/readers/FireReader';

const debug = Debug('5ire:intellichat:FireChatService');

export default class FireChatService
  extends OpenAIChatService
  implements INextChatService
{
  constructor(context: IChatContext) {
    super(context);
    this.provider = Fire;
  }

  protected getReaderType() {
    return FireReader;
  }

  private getUserId() {
    const { session } = useAuthStore.getState();
    return session?.user.id;
  }

  protected async makeRequest(
    messages: IChatRequestMessage[]
  ): Promise<Response> {
    const payload = await this.makePayload(messages);
    debug('About to make a request, payload:\r\n', payload);
    const { base } = this.apiSettings;
    const key = this.getUserId();
    if (!key) {
      throw new Error('User is not authenticated');
    }
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
