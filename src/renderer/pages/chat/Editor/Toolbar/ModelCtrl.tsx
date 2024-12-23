import {
  Button,
  Menu,
  MenuCheckedValueChangeData,
  MenuCheckedValueChangeEvent,
  MenuItemRadio,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
} from '@fluentui/react-components';
import { ChevronDown16Regular, Cube16Regular } from '@fluentui/react-icons';
import { IChat, IChatContext } from 'intellichat/types';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useChatStore from 'stores/useChatStore';
import useSettingsStore from 'stores/useSettingsStore';
import { IChatModel, ProviderType } from 'providers/types';
import useProvider from 'hooks/useProvider';
import useAuthStore from 'stores/useAuthStore';

export default function ModelCtrl({
  ctx,
  chat,
}: {
  ctx: IChatContext;
  chat: IChat;
}) {
  const { t } = useTranslation();
  const api = useSettingsStore((state) => state.api);
  const session = useAuthStore((state) => state.session);
  const { getProvider, getChatModel, getChatModels } = useProvider();
  const [providerName, setProviderName] = useState<ProviderType>(api.provider);
  const updateChat = useChatStore((state) => state.updateChat);
  const editChat = useChatStore((state) => state.editChat);

  const models = useMemo<IChatModel[]>(() => {
    if (!api.provider || api.provider === 'Azure') return [];
    const provider = getProvider(api.provider);
    setProviderName(provider.name);
    if (provider.chat.options.modelCustomizable) {
      return getChatModels(provider.name) || [];
    }
    return [];
  }, [api.provider, session]);

  const [modelName, setModelName] = useState<string>('');

  useEffect(() => {
    const model = ctx.getModel();
    setModelName(model.label as string);
  }, [chat]);

  const onModelChange = (
    _: MenuCheckedValueChangeEvent,
    data: MenuCheckedValueChangeData
  ) => {
    const $model = data.checkedItems[0];
    if (chat.isPersisted) {
      updateChat({ id: chat.id, model: $model });
    } else {
      editChat({ model: $model });
    }
    window.electron.ingestEvent([{ app: 'switch-model' }, { model: $model }]);
  };
  return models && models.length ? (
    <Menu
      hasCheckmarks
      onCheckedValueChange={onModelChange}
      checkedValues={{ model: [modelName] }}
    >
      <MenuTrigger disableButtonEnhancement>
        <Button
          aria-label={t('Common.Model')}
          size="small"
          appearance="subtle"
          iconPosition="after"
          icon={<ChevronDown16Regular />}
          className="text-color-secondary flex justify-start items-center"
          style={{ padding: 1 }}
        >
          <Cube16Regular className="mr-1 flex-shrink-0" />{' '}
          <div className="flex-shrink overflow-hidden whitespace-nowrap text-ellipsis min-w-12">
            {providerName} /
            {models.map((mod: IChatModel) => mod.label).includes(modelName) ? (
              <span>{modelName}</span>
            ) : (
              <span className="text-gray-400">{modelName}</span>
            )}
          </div>
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {models.map((item) => (
            <MenuItemRadio
              name="model"
              value={item.label as string}
              key={item.label}
              className="latin"
            >
              {item.label}
            </MenuItemRadio>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  ) : (
    <Text size={200}>
      <span className="latin flex justify-start items-center gap-1">
        <Cube16Regular /> {api.provider} / {modelName}
      </span>
    </Text>
  );
}
