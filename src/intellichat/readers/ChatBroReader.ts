import { IChatResponseMessage } from 'intellichat/types';

import IChatReader, { IReadResult, ITool } from './IChatReader';
import OpenAIReader from './OpenAIReader';

export default class ChatBroReader extends OpenAIReader implements IChatReader {
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

  protected parseTools(respMsg: IChatResponseMessage): ITool | null {
    console.warn('parseTools not implemented');
    return null;
  }

  protected parseToolArgs(respMsg: IChatResponseMessage): {
    index: number;
    args: string;
  } | null {
    console.warn('parseToolArgs not implemented');
    return null;
  }

  public async read({
    onError,
    onProgress,
    onToolCalls,
  }: {
    onError: (error: any) => void;
    onProgress: (chunk: string) => void;
    onToolCalls: (toolCalls: any) => void;
  }): Promise<IReadResult> {
    const decoder = new TextDecoder('utf-8');
    let content = '';
    let done = false;
    try {
      while (!done) {
        /* eslint-disable no-await-in-loop */
        const data = await this.reader.read();
        done = data.done || false;
        const value = decoder.decode(data.value);
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
            content += message.content;
            onProgress(message.content || '');
          }
        }
      }
    } catch (err) {
      console.error('Read error:', err);
      onError(err);
    } finally {
      return {
        content,
      };
    }
  }
}
