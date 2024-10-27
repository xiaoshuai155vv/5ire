import Debug from 'debug';
import useSettingsStore from 'stores/useSettingsStore';
import useChatContext from './useChatContext';
import createService from '../intellichat/services';

const debug = Debug('5ire:hooks:useService');

export default function useChatService() {
  const context = useChatContext();
  const { provider } = useSettingsStore.getState().api;
  return createService(provider, context);
}
