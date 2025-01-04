import Debug from 'debug';
import { produce } from 'immer';
import { IPrompt, IStage } from 'intellichat/types';
import { isNull, isUndefined } from 'lodash';
import { create } from 'zustand';

const debug = Debug('5ire:stores:useStageStore');

export interface IStageStore {
  prompts: { [key: string]: IPrompt | null };
  inputs: { [key: string]: string };
  getPrompt: (chatId: string) => IPrompt | null;
  getInput: (chatId: string) => string;
  editStage: (chatId: string, stage: Partial<IStage>) => void;
  deleteStage: (chatId: string) => void;
  restoreStage: () => Promise<void>;
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
    const { prompts, inputs } = get();
    window.electron.store.set('stage', JSON.stringify({ prompts, inputs }));
  },
  deleteStage: (chatId: string) => {
    set(
      produce((state: IStageStore): void => {
        delete state.prompts[chatId];
        delete state.inputs[chatId];
      })
    );
    window.electron.store.set(
      'stage',
      JSON.stringify({
        prompts: {},
        inputs: {},
      })
    );
  },
  restoreStage: async () => {
    const state = await window.electron.store.get('stage');
    if (state) {
      try {
        const { prompts, inputs } = JSON.parse(state);
        set(
          produce((state: IStageStore): void => {
            state.prompts = prompts;
            state.inputs = inputs;
          })
        );
      } catch (err) {
        debug('🚩 Restore Stage Error:', err);
      }
    }
  },
}));

export default useStageStore;
