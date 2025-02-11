import Debug from 'debug';
import { IChatResponseMessage } from 'intellichat/types';
import BaseReader from './BaseReader';
import IChatReader, { ITool, IReadResult } from './IChatReader';
import OpenAIReader from './OpenAIReader';

const debug = Debug('5ire:intellichat:FireReader');

export default class FireReader extends OpenAIReader implements IChatReader {
  protected parseReply(chunk: string): IChatResponseMessage {
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
        const data = await this.streamReader.read();
        done = data.done || false;
        const value = decoder.decode(data.value);
        const chunks = value
          .split('data:')
          .map((i) => i.replace('\r\n', ''))
          .filter((i) => i !== '');
        for (let curChunk of chunks) {
          if (curChunk === '[DONE]') {
            done = true;
            break;
          }
          const message = this.parseReply(curChunk);
          content += message.content;
          onProgress(message.content || '');
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
