import exp from 'constants';
import { create } from 'zustand';

export interface ITraceMessage {
  label: string;
  message: string;
}

interface IInspectorStore {
  messages: { [key: string]: ITraceMessage[] };
  trace: (chatId: string, label: string, message: string) => void;
  clearTrace: (chatId: string) => void;
}

const useInspectorStore = create<IInspectorStore>((set, get) => ({
  messages: {},
  trace: (chatId: string, label: string, message: string) => {
    console.log('traceTool', chatId, message);
    const { messages } = get();
    if (!messages[chatId]) {
      set({ messages: { ...messages, [chatId]: [{ label, message }] } });
    } else {
      set({
        messages: {
          ...messages,
          [chatId]: messages[chatId].concat({ label, message }),
        },
      });
    }
  },
  clearTrace: (chatId: string) => {
    const { messages } = get();
    delete messages[chatId];
    set({ messages: { ...messages } });
  },
}));

export default useInspectorStore;
