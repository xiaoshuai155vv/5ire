import { produce } from 'immer';
import { IPrompt, IStage } from 'intellichat/types';
import { isNull, isUndefined, pickBy } from 'lodash';
import { create } from 'zustand';

export interface IStageStore {
  prompts: { [key: string]: IPrompt | null };
  inputs: { [key: string]: string };
  getPrompt: (chatId: string) => IPrompt | null;
  getInput: (chatId: string) => string;
  editStage: (chatId: string, stage: Partial<IStage>) => void;
  deleteStage: (chatId: string) => void;
}

const useStageStore = create<IStageStore>((set, get) => ({
  prompts: {},
  inputs: {},
  getPrompt: (chatId: string) => {
    return get().prompts[chatId];
  },
  getInput: (chatId: string) => {
    return get().inputs[chatId];
  },
  editStage: (chatId: string, stage: Partial<IStage>) => {
    set(
      produce((state: IStageStore): void => {
        if (!isUndefined(stage.prompt)) {
          if (isNull(stage.prompt)) {
            state.prompts[chatId] = null;
          } else {
            state.prompts[chatId] = stage.prompt;
          }
        }
        if (!isUndefined(stage.input)) {
          state.inputs[chatId] = stage.input || '';
        }
      })
    );
  },
  deleteStage: (chatId: string) => {
    set(
      produce((state: IStageStore): void => {
        delete state.prompts[chatId];
        delete state.inputs[chatId];
      })
    );
  },
}));

export default useStageStore;
