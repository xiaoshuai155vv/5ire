import { IChatResponseMessage } from 'intellichat/types';
import { merge } from 'lodash';

const MAX_SPLICE = 3;

export interface ITool {
  id: string;
  name: string;
  args?: any;
}

export interface IReadResult {
  content: string;
  tool?: ITool | null;
  inputTokens?: number;
  outputTokens?: number;
}

export default abstract class BaseReader {
  protected reader: ReadableStreamDefaultReader<Uint8Array>;

  constructor(reader: ReadableStreamDefaultReader<Uint8Array>) {
    this.reader = reader;
  }

  protected abstract parseTools(respMsg: IChatResponseMessage): ITool | null;
  protected abstract parseToolArgs(respMsg: IChatResponseMessage): {
    index: number;
    args: string;
  } | null;
  protected abstract parseReply(chunk: string): IChatResponseMessage;

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
    let inputTokens = 0;
    let outputTokens = 0;
    let tool: any = null;
    let functionArgs: string[] = [];
    let prevChunk = '';
    let chunk = '';
    let splices = 0;
    let response = null;
    let index = 0;
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
            if (curChunk === '[DONE]') {
              done = true;
              break;
            }
            chunk = prevChunk + curChunk;
            try {
              response = this.parseReply(chunk);
              prevChunk = '';
              splices = 0;
            } catch (error) {
              if (splices > MAX_SPLICE) {
                console.error(
                  'JSON parse failed:',
                  prevChunk,
                  '\n\n',
                  curChunk
                );
                prevChunk = '';
                splices = 0;
              } else {
                prevChunk += curChunk;
                splices++;
              }
              continue;
            }
            if (response.content === null && !response.toolCalls) {
              continue;
            }
            if (tool === null) {
              tool = this.parseTools(response);
              if (tool) {
                onToolCalls && onToolCalls(tool.name);
                continue;
              }
            }
            if (tool) {
              const argument = this.parseToolArgs(response);
              if (argument) {
                if (index >= 0 && functionArgs[argument.index] === undefined) {
                  functionArgs[argument.index] = '';
                }
                functionArgs[argument.index] += argument.args;
              }
            } else {
              tool = null;
              content += response.content;
              onProgress(response.content || '');
            }
            if (response.outputTokens) {
              outputTokens += response.outputTokens;
            }
            if (response.inputTokens) {
              // inputToken will not change
              inputTokens = response.inputTokens;
            }
            if (response.isEnd) {
              done = true;
            }
            index++;
          }
        }
      }
      if (tool) {
        const args = functionArgs.map((arg) => JSON.parse(arg));
        tool.args = merge({}, ...args);
      }
    } catch (err) {
      console.error('Read error:', err);
      onError(err);
    }
    return { content, tool, inputTokens, outputTokens };
  }
}
