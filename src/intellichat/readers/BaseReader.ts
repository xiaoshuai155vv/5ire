/**
 * BaseReader provides base functionality for reading and parsing streaming chat responses.
 * It handles stream decoding and content aggregation, while leaving specific message
 * parsing logic to child classes.
 */
import { IChatResponseMessage } from 'intellichat/types';
import { merge } from 'lodash';
import IChatReader, { IReadResult, ITool } from './IChatReader';

export default abstract class BaseReader implements IChatReader {
  protected streamReader: ReadableStreamDefaultReader<Uint8Array>;

  constructor(reader: ReadableStreamDefaultReader<Uint8Array>) {
    this.streamReader = reader;
  }

  /**
   * Parse tool calls from a response message.
   * Base implementation looks for tool_calls array and returns the first tool call if found.
   * Override this method for different tool call formats.
   */
  protected parseTools(respMsg: IChatResponseMessage): ITool | null {
    if (!respMsg.toolCalls || respMsg.toolCalls.length === 0) {
      return null;
    }

    const toolCall = respMsg.toolCalls[0];
    return {
      id: toolCall.id || '',
      name: toolCall.function?.name || '',
      args: toolCall.function?.arguments || '',
    };
  }

  /**
   * Parse tool arguments from a response message.
   * Base implementation assumes arguments are JSON strings that can be concatenated.
   * Override this method for different argument formats.
   */
  protected parseToolArgs(respMsg: IChatResponseMessage): {
    index: number;
    args: string;
  } | null {
    if (!respMsg.toolCalls || respMsg.toolCalls.length === 0) {
      return null;
    }

    const toolCall = respMsg.toolCalls[0];
    return {
      index: 0, // Default to first argument position
      args: toolCall.function?.arguments || '',
    };
  }

  /**
   * Parse a raw chunk into a structured message.
   * Base implementation assumes chunks are JSON strings.
   * Override this method for different message formats.
   */
  protected parseReply(chunk: string): IChatResponseMessage {
    try {
      return JSON.parse(chunk);
    } catch (e) {
      // If parsing fails, treat the chunk as plain text content
      return {
        content: chunk,
        toolCalls: [],
        inputTokens: 0,
        outputTokens: chunk.length, // Rough estimate
      };
    }
  }

  /**
   * Process a chunk of data and determine if it completes a message.
   * Base implementation treats each chunk as a complete message.
   * Override this method for streaming or multi-part messages.
   */
  protected processChunk(chunk: string): IChatResponseMessage | null {
    if (!chunk || chunk.trim() === '') {
      return null;
    }
    return this.parseReply(chunk);
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
    const state = {
      content: '',
      inputTokens: 0,
      outputTokens: 0,
      currentTool: null as any,
      toolArguments: [] as string[],
      messageIndex: 0,
    };

    try {
      await this.processStreamData(decoder, state, { onProgress, onToolCalls });

      // Finalize tool arguments if a tool was being processed
      if (state.currentTool) {
        state.currentTool.args = this.finalizeToolArguments(state.toolArguments);
      }

      return {
        content: state.content,
        tool: state.currentTool,
        inputTokens: state.inputTokens,
        outputTokens: state.outputTokens,
      };
    } catch (error) {
      console.error('Stream reading error:', error);
      onError(error);
      return {
        content: state.content,
        tool: state.currentTool,
        inputTokens: state.inputTokens,
        outputTokens: state.outputTokens,
      };
    }
  }

  private async processStreamData(
    decoder: TextDecoder,
    state: {
      content: string;
      inputTokens: number;
      outputTokens: number;
      currentTool: any;
      toolArguments: string[];
      messageIndex: number;
    },
    callbacks: {
      onProgress: (chunk: string) => void;
      onToolCalls: (toolCalls: any) => void;
    }
  ): Promise<void> {
    let isStreamDone = false;

    while (!isStreamDone) {
      const { value, done } = await this.streamReader.read();
      if (done) break;

      const decodedValue = decoder.decode(value);
      const lines = this.splitIntoLines(decodedValue);

      for (const line of lines) {
        const chunks = this.extractDataChunks(line);
        
        for (const chunk of chunks) {
          if (chunk === '[DONE]') {
            isStreamDone = true;
            break;
          }

          // Let the child class process the chunk and determine if it completes a message
          const completeMessage = this.processChunk(chunk);
          if (completeMessage) {
            await this.processResponse(completeMessage, state, callbacks);
          }
        }
      }
    }
  }

  private splitIntoLines(value: string): string[] {
    return value
      .split('\n')
      .filter(line => line.includes('data:'))
      .map(line => line.trim())
      .filter(line => line !== '');
  }

  private extractDataChunks(line: string): string[] {
    return line
      .split('data:')
      .filter(chunk => chunk !== '')
      .map(chunk => chunk.trim());
  }

  private async processResponse(
    response: IChatResponseMessage,
    state: {
      content: string;
      inputTokens: number;
      outputTokens: number;
      currentTool: any;
      toolArguments: string[];
      messageIndex: number;
    },
    callbacks: {
      onProgress: (chunk: string) => void;
      onToolCalls: (toolCalls: any) => void;
    }
  ): Promise<void> {
    if (response.content === null && !response.toolCalls) return;

    if (state.currentTool === null) {
      const tool = this.parseTools(response);
      if (tool) {
        state.currentTool = tool;
        callbacks.onToolCalls(tool.name);
        return;
      }
    }

    if (state.currentTool) {
      this.processToolArguments(response, state);
    } else {
      this.processContentResponse(response, state, callbacks);
    }

    this.updateTokenCounts(response, state);
    state.messageIndex++;
  }

  private processToolArguments(
    response: IChatResponseMessage,
    state: {
      toolArguments: string[];
      messageIndex: number;
    }
  ): void {
    const argument = this.parseToolArgs(response);
    if (argument) {
      if (state.messageIndex >= 0 && !state.toolArguments[argument.index]) {
        state.toolArguments[argument.index] = '';
      }
      state.toolArguments[argument.index] += argument.args;
    }
  }

  private processContentResponse(
    response: IChatResponseMessage,
    state: { content: string },
    callbacks: { onProgress: (chunk: string) => void }
  ): void {
    state.content += response.content;
    callbacks.onProgress(response.content || '');
  }

  private updateTokenCounts(
    response: IChatResponseMessage,
    state: { inputTokens: number; outputTokens: number }
  ): void {
    if (response.outputTokens) {
      state.outputTokens += response.outputTokens;
    }
    if (response.inputTokens) {
      state.inputTokens = response.inputTokens;
    }
  }

  private finalizeToolArguments(toolArguments: string[]): any {
    const parsedArgs = toolArguments.map(arg => JSON.parse(arg));
    return merge({}, ...parsedArgs);
  }
}
