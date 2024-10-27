import Debug from 'debug';
import IChatService from './IChatService';
import { IChatContext, IChatResponseMessage } from 'intellichat/types';

import OpenAIChatService from './OpenAIChatService';
import Fire from 'providers/Fire';
import useAuthStore from 'stores/useAuthStore';

const debug = Debug('5ire:intellichat:FireChatService');

export default class FireChatService
  extends OpenAIChatService
  implements IChatService
{
  constructor(context: IChatContext) {
    super(context);
    this.provider = Fire;
  }

  protected parseReplyMessage(chunk: string): IChatResponseMessage[] {
    const lines = chunk.split('\r\n');
    return lines.map((line) => {
      let data = line.startsWith('data:')? line.slice(5): line;
      const isEnd = '[DONE]' === data;
      return {
        content: isEnd? '': data,
        isEnd
      };
    });
  }

  private getUserId(){
    const {session} = useAuthStore.getState();
    return session?.user.id;
  }

  protected async makeRequest(message: string): Promise<Response> {
    const payload = await this.makePayload(message);
    debug('About to make a request, payload:\r\n', payload);
    const { base } = this.apiSettings;
    const key = this.getUserId()
    if(!key){
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
