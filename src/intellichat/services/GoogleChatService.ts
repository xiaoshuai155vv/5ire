import { IGeminiChatRequestMessageContent } from '../types';
import Debug from 'debug';
import {
  IChatContext,
  IChatResponseMessage,
  IChatRequestMessage,
  IChatRequestPayload,
} from 'intellichat/types';
import { isBlank } from 'utils/validators';
import Google from 'providers/Google';
import { getBase64, splitByImg, stripHtmlTags } from 'utils/util';
import INextChatService from './INextCharService';
import NextChatService, { ITool } from './NextChatService';

const debug = Debug('5ire:intellichat:GoogleChatService');

const containsImage = (contents: IChatRequestMessage[]): boolean => {
  if (contents?.length) {
    const prompt = contents[contents.length - 1];
    return !!prompt.parts?.some((part) => 'inline_data' in part);
  }
  return false;
};

export default class GoogleChatService
  extends NextChatService
  implements INextChatService
{
  constructor(context: IChatContext) {
    super({
      context,
      provider: Google,
    });
  }

  protected parseTools(respMsg: IChatResponseMessage): ITool | null {
    console.warn('parseTools is not implemented');
    return null;
  }

  protected parseToolArgs(respMsg: IChatResponseMessage): {
    index: number;
    args: string;
  } {
    console.warn('parseToolArgs is not implemented');
    return { index: -1, args: '' };
  }

  protected async convertPromptContent(
    content: string
  ): Promise<IGeminiChatRequestMessageContent[]> {
    if (this.context.getModel().vision?.enabled) {
      const items = splitByImg(content, true);
      const result: IGeminiChatRequestMessageContent[] = [];
      for (let item of items) {
        if (item.type === 'image') {
          if (item.dataType === 'url') {
            result.push({
              inline_data: {
                mimeType: item.mimeType,
                data: await getBase64(item.data),
              },
            });
          } else {
            result.push({
              inline_data: {
                mimeType: item.mimeType as string,
                data: item.data,
              },
            });
          }
        } else if (item.type === 'text') {
          result.push({
            text: item.data,
          });
        } else {
          console.error('Unknown message type', item);
          throw new Error('Unknown message type');
        }
      }
      return result;
    }
    return Promise.resolve([{ text: stripHtmlTags(content) }]);
  }

  /**
   *
   * 由于  gemini-pro-vision  不支持多轮对话，因此如果提示词包含图片，则不包含历史信息。
   */
  protected async makeMessages(
    messages: IChatRequestMessage[]
  ): Promise<IChatRequestMessage[]> {
    let result: IChatRequestMessage[] = [];
    if (!containsImage(messages)) {
      const systemMessage = this.context.getSystemMessage();
      if (!isBlank(systemMessage)) {
        result.push({
          role: 'user',
          parts: [{ text: systemMessage as string }],
        });
      }
      for (let msg of this.context.getCtxMessages()) {
        result.push({
          role: 'user',
          parts: [{ text: msg.prompt }],
        });
        result.push({
          role: 'model',
          parts: [
            {
              text: msg.reply,
            },
          ],
        });
      }
    }
    result = result.concat(messages);
    return result as IChatRequestMessage[];
  }

  protected parseReply(chunk: string): IChatResponseMessage {
    const matches = /"text": "(.*)"/g.exec(chunk);
    if (matches) {
      return { content: matches[1].replace(/\\n/g, '\n') };
    }
    return { content: '' };
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
      const message = this.parseReply(value);
      reply += message.content;
      onProgress(message.content || '');
      this.onReadingCallback(message.content || '');
    }
    return { reply, context };
  }

  protected async makePayload(
    messages: IChatRequestMessage[]
  ): Promise<IChatRequestPayload> {
    const payload: IChatRequestPayload = {
      contents: await this.makeMessages(
        messages.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content as string }],
        }))
      ),
      generationConfig: {
        temperature: this.context.getTemperature(),
      },
    };
    const maxOutputTokens = this.context.getMaxTokens();
    if (payload.generationConfig && maxOutputTokens) {
      payload.generationConfig.maxOutputTokens = maxOutputTokens;
    }
    debug('payload', payload);
    return payload;
  }

  protected async makeRequest(
    messages: IChatRequestMessage[]
  ): Promise<Response> {
    const payload = await this.makePayload(messages);
    const isStream = this.context.isStream();
    debug(
      `About to make a request,stream:${isStream},  payload: ${payload}\r\n`
    );
    const { base, key } = this.apiSettings;
    /**
     * 特殊处理，因为如果选用vision模型，但内容中没有图片会出现异常
     * 所以如果选用 vision 模型，但没有提供图片内容，则调用 gemini-pro
     */
    const model = containsImage(payload.contents as IChatRequestMessage[])
      ? 'gemini-pro-vision'
      : 'gemini-pro';
    const response = await fetch(
      `${base}/v1beta/models/${model}:${
        isStream ? 'streamGenerateContent' : 'generateContent'
      }?key=${key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: this.abortController.signal,
      }
    );
    return response;
  }
}
