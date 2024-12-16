import Debug from 'debug';
import useSettingsStore from 'stores/useSettingsStore';
import useChatContext from './useChatContext';
import createService from '../intellichat/services';
import INextChatService from 'intellichat/services/INextCharService';

const debug = Debug('5ire:hooks:useService');

export default function useChatService():INextChatService {
  const context = useChatContext();
  const { provider } = useSettingsStore.getState().api;
  return createService(provider, context);
}
