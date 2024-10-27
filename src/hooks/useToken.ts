import { isGPT, isGemini, isMoonshot, isLlama } from 'utils/util';
import {
  countGPTTokens,
  countTokensOfGemini,
  countTokensOfMoonshot,
  countTokenOfLlama,
} from 'utils/token';
import { captureException } from '@sentry/react';
import useChatContext from './useChatContext';
import { IChatMessage, IChatRequestMessage } from 'intellichat/types';
import useSettingsStore from 'stores/useSettingsStore';

export default function useToken() {
  const { api } = useSettingsStore();
  const ctx = useChatContext();
  const modelName = ctx.getModel().name
  return {
    countInput: async (prompt: string): Promise<number> => {
      if (isGPT(modelName)) {
        const messages = [];
        ctx.getCtxMessages().forEach((msg: IChatMessage) => {
          messages.push({ role: 'user', content: msg.prompt });
          messages.push({ role: 'assistant', content: msg.reply });
        });
        messages.push({ role: 'user', content: prompt });
        return Promise.resolve(countGPTTokens(messages, modelName));
      }

      if (isGemini(modelName)) {
        const messages = [];
        ctx.getCtxMessages().forEach((msg: IChatMessage) => {
          messages.push({ role: 'user', parts: [{ text: msg.prompt }] });
          messages.push({ role: 'model', parts: [{ text: msg.reply }] });
        });
        messages.push({ role: 'user', parts: [{ text: prompt }] });
        return await countTokensOfGemini(
          messages,
          api.base,
          api.key,
          ctx.model
        );
      }

      if (isMoonshot(modelName)) {
        const messages = [];
        ctx.getCtxMessages().forEach((msg: IChatMessage) => {
          messages.push({ role: 'user', content: msg.prompt });
          messages.push({ role: 'assistant', content: msg.reply });
        });
        messages.push({ role: 'user', content: prompt });
        return await countTokensOfMoonshot(
          messages,
          api.base,
          api.key,
          modelName
        );
      }

      if (isLlama(modelName)) {
        const messages = [];
        ctx.getCtxMessages().forEach((msg: IChatMessage) => {
          messages.push({ role: 'user', content: msg.prompt });
          messages.push({ role: 'assistant', content: msg.reply });
        });
        messages.push({ role: 'user', content: prompt });
        return Promise.resolve(countTokenOfLlama(messages, modelName));
      }
      captureException(
        `Can't calculate tokens due to invalid Model: ${modelName}`
      );
      return Promise.resolve(0);
    },
    countOutput: async (reply: string): Promise<number> => {
      if (isGPT(modelName)) {
        return Promise.resolve(
          countGPTTokens([{ role: 'assistant', content: reply }], modelName)
        );
      }
      if (isGemini(modelName)) {
        const messages = [{ role: 'model', parts: [{ text: reply }] }];
        return await countTokensOfGemini(
          messages,
          api.base,
          api.key,
          modelName
        );
      }
      if (isMoonshot(modelName)) {
        return await countTokensOfMoonshot(
          [{ role: 'assistant', content: reply }],
          api.base,
          api.key,
          modelName
        );
      }
      if (isLlama(modelName)) {
        return Promise.resolve(
          countTokenOfLlama([{ role: 'assistant', content: reply }], modelName)
        );
      }
      captureException(
        `Can't calculate output tokens due to invalid Model: ${modelName}`
      );
      return Promise.resolve(0);
    },
  };
}
