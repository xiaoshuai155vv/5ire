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

const debug = Debug('5ire:intellichat:FireChatService');

export default class FireChatService
  extends OpenAIChatService
  implements INextChatService
{
  constructor(context: IChatContext) {
    super(context);
    this.provider = Fire;
  }

  protected parseReply(chunk: string): IChatResponseMessage {
    return {
      content: chunk,
      isEnd: false,
    };
  }

  protected async read(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    status: number,
    decoder: TextDecoder,
    onProgress: (content: string) => void
  ): Promise<{ reply: string; context: any }> {
    let reply = '';
    let context: any = null;
    let done = false;
    while (!done) {
      if (this.aborted) {
        break;
      }
      /* eslint-disable no-await-in-loop */
      const data = await reader.read();
      done = data.done || false;
      const value = decoder.decode(data.value);
      if (status !== 200) {
        this.onReadingError(value);
      }

      const chunks = value.split('data:').map(i=>i.replace('\r\n','')).filter((i) => i !== '')
      for (let curChunk of chunks) {
        if (curChunk === '[DONE]') {
          done = true;
          break;
        }
        const message = this.parseReply(curChunk);
        reply += message.content;
        onProgress(message.content||'');
        this.onReadingCallback(message.content || '');
      }
    }
    return { reply, context };
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
