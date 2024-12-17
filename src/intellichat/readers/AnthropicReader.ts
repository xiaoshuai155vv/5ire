import Debug from 'debug';
import { IChatResponseMessage } from 'intellichat/types';
import BaseReader, { ITool } from './BaseReader';

const debug = Debug('5ire:intellichat:AnthropicReader');

export default class AnthropicReader extends BaseReader {

  protected parseReply(chunk: string): IChatResponseMessage {
    const data = JSON.parse(chunk);
    if (data.type === 'content_block_start') {
      if (data.content_block.type === 'tool_use') {
        return {
          toolCalls: [
            {
              id: data.content_block.id,
              name: data.content_block.name,
              args:'',
            },
          ],
          isEnd: false,
        };
      }
      return {
        content: data.content_block.text,
        isEnd: false,
      };
    } else if (data.type === 'content_block_delta') {
      if (data.delta.type === 'input_json_delta') {
        return {
          content: '',
          toolCalls: [
            {
              args: data.delta.partial_json,
              index: 0,
            },
          ],
        };
      }
      return {
        content: data.delta.text,
        isEnd: false,
      };
    } else if (data.type === 'message_start') {
      return {
        content: '',
        isEnd: false,
        inputTokens: data.message.usage.input_tokens,
        outputTokens: data.message.usage.output_tokens,
      };
    } else if (data.type === 'message_delta') {
      return {
        content: '',
        isEnd: false,
        outputTokens: data.usage.output_tokens,
      };
    } else if (data.type === 'message_stop') {
      return {
        content: '',
        isEnd: true,
      };
    } else if (data.type === 'error') {
      return {
        content: '',
        error: {
          type: data.delta.type,
          message: data.delta.text,
        },
      };
    } else {
      console.warn('Unknown message type', data);
      return {
        content: '',
        isEnd: false,
      };
    }
  }

  protected parseTools(respMsg: IChatResponseMessage): ITool | null {
    if (respMsg.toolCalls) {
      return {
        id: respMsg.toolCalls[0].id,
        name: respMsg.toolCalls[0].name,
      };
    }
    return null;
  }

  protected parseToolArgs(respMsg: IChatResponseMessage): {
    index: number;
    args: string;
  } | null {
    debug('parseToolArgs', JSON.stringify(respMsg));
    try {
      if (respMsg.isEnd || !respMsg.toolCalls) {
        return null;
      }
      return respMsg.toolCalls[0];
    } catch (err) {
      console.error('parseToolArgs', err);
    }
    return null;
  }
}
