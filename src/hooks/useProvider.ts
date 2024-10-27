import { providers } from '../providers';
import { IChatModel, IServiceProvider, ProviderType } from 'providers/types';
import useAuthStore from 'stores/useAuthStore';

export default function useProvider() {

  const {session} = useAuthStore.getState()

  function getProviders(arg?:{withDisabled:boolean}): { [key: string]: IServiceProvider } {
    return Object.values(providers).reduce(
      (acc: { [key: string]: IServiceProvider }, cur: IServiceProvider) => {
        if(!arg?.withDisabled && cur.disabled) return acc;
        if (!!session || !cur.isPremium) {
          acc[cur.name] = cur;
        }
        return acc;
      },
      {} as { [key: string]: IServiceProvider }
    );
  }

  function getProvider(providerName: ProviderType): IServiceProvider {
    const providers = getProviders();
    let provider = providers[providerName];
    if (!provider) {
      return Object.values(providers)[0];
    }
    return provider;
  }

  function getDefaultChatModel(provider: ProviderType): IChatModel {
    const models = getChatModels(provider)
    if(models.length === 0) return {} as IChatModel;
    const defaultModel = models.filter((m: IChatModel) => m.isDefault)[0];
    return defaultModel || models[0];
  }

  function getChatModels(providerName: ProviderType): IChatModel[] {
    const provider = getProvider(providerName);
    return Object.keys(provider.chat.models).map((modelKey) => {
      const model = provider.chat.models[modelKey];
      model.label = modelKey;
      return model;
    });
  }

  function getChatModel(
    providerName: ProviderType,
    modelLabel: string
  ): IChatModel {
    const _providers = getProviders();
    let provider = _providers[providerName];
    if (!provider) {
      provider = Object.values(_providers)[0];
    }
    let model = provider.chat.models[modelLabel];
    if (!model) {
      model = getDefaultChatModel(providerName);
    }else{
      model.label = modelLabel;
    }
    return model;
  }

  return {
    getProviders,
    getProvider,
    getChatModels,
    getChatModel,
    getDefaultChatModel,
  };
}
