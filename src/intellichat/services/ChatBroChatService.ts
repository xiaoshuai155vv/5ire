import Debug from 'debug';
import {
  IChatContext,
  IChatRequestMessage,
  IChatRequestPayload,
  IChatResponseMessage,
} from 'intellichat/types';
import ChatBro from '../../providers/ChatBro';
import INextChatService from './INextCharService';
import OpenAIChatService from './OpenAIChatService';
import { on } from 'events';

const debug = Debug('5ire:intellichat:ChatBroChatService');

export default class ChatBroChatService
  extends OpenAIChatService
  implements INextChatService
{
  constructor(context: IChatContext) {
    super(context);
    this.provider = ChatBro;
  }

  protected parseReply(chunk: string): IChatResponseMessage {
    if (chunk === '[DONE]') {
      return {
        content: '',
        isEnd: true,
      };
    }
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
      const lines = value
        .split('\n')
        .map((i) => i.trim())
        .filter((i) => i !== '');

      for (const line of lines) {
        const chunks = line
          .split('data:')
          .filter((i) => i !== '')
          .map((i) => i.trim());
        for (let curChunk of chunks) {
          let chunk = decodeURIComponent(curChunk);
          if (chunk === '[DONE]') {
            done = true;
            break;
          }
          const message = this.parseReply(chunk);
          reply += message.content;
          onProgress(message.content || '');
          this.onReadingCallback(message.content || '');
        }
      }
    }
    return { reply, context };
  }

  protected async makePayload(
    messages: IChatRequestMessage[]
  ): Promise<IChatRequestPayload> {
    const payload: IChatRequestPayload = {
      model: this.context.getModel().name,
      messages: this.composeMessages(messages),
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
