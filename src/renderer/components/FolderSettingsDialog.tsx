import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogTrigger,
  DialogBody,
  Button,
  Field,
  Dropdown,
  Option,
  Input,
  Textarea,
  OptionOnSelectData,
  SelectionEvents,
} from '@fluentui/react-components';
import Mousetrap from 'mousetrap';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useChatStore from 'stores/useChatStore';
import useSettingsStore from 'stores/useSettingsStore';
import useAuthStore from 'stores/useAuthStore';
import { getChatModel, getProvider } from 'providers';
import { IChatModel } from 'providers/types';
import useProvider from 'hooks/useProvider';
import ToolStatusIndicator from './ToolStatusIndicator';

export default function FolderSettingsDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const chats = useChatStore((state) => state.chats);
  const { updateFolder, updateChat } = useChatStore();
  const folder = useChatStore((state) => state.folder);
  const api = useSettingsStore((state) => state.api);
  const session = useAuthStore((state) => state.session);
  const [folderModel, setFolderModel] = useState(api.model);
  const [folderSystemMessage, setFolderSystemMessage] = useState('');
  const { getChatModels } = useProvider();
  const models = useMemo<IChatModel[]>(() => {
    if (!api.provider || api.provider === 'Azure') return [];
    const provider = getProvider(api.provider);
    if (provider.chat.options.modelCustomizable) {
      return getChatModels(provider.name) || [];
    }
    return [];
  }, [api.provider, session]);

  const subChats = useMemo(() => {
    if (!folder) return [];
    return chats.filter((c) => c.folderId === folder.id);
  }, [chats, folder]);

  const curModel = useMemo(() => {
    let curModel = models.find((m) => m.name === folderModel)
    if (!curModel) {
      curModel = getChatModel(api.provider, folderModel);
    }
    return curModel || {};
  }, [folderModel, models]);

  const curModelLabel = useMemo(() => {
    return curModel?.label||curModel?.name || '';
  }, [curModel]);

  const { t } = useTranslation();
  const onConfirm = useCallback(async () => {
    await updateFolder({
      id: folder?.id as string,
      model: folderModel,
      systemMessage: folderSystemMessage,
    });
    await Promise.all(
      subChats.map((chat) => {
        updateChat({
          id: chat.id,
          model: folderModel,
          systemMessage: folderSystemMessage,
        });
      }),
    );
    setOpen(false);
  }, [setOpen, folderModel, folderSystemMessage, folder, subChats]);

  useEffect(() => {
    if (open) {
      const model = getChatModel(api.provider, folder?.model || api.model);
      setFolderModel(model.name || api.model);
      setFolderSystemMessage(folder?.systemMessage || '');
      Mousetrap.bind('esc', () => setOpen(false));
    }
    return () => {
      Mousetrap.unbind('esc');
    };
  }, [open]);

  return (
    <Dialog open={open}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{folder?.name}</DialogTitle>
          <DialogContent>
            <div className="tips mb-4">{t('Folder.Settings.Description')}</div>
            <div className="flex flex-col gap-4">
              <div>
                {models.length > 0 ? (
                  <Field>
                    <Dropdown
                      placeholder="Select an model"
                      value={curModelLabel}
                      onOptionSelect={(
                        _: SelectionEvents,
                        data: OptionOnSelectData,
                      ) => {
                        setFolderModel(data.optionValue as string);
                      }}
                    >
                      {models.map((model: IChatModel) => (
                        <Option
                          key={model.name as string}
                          value={model.name as string}
                          text={model.label || (model.name as string)}
                        >
                          <div className="flex justify-start items-center gap-1">
                            <ToolStatusIndicator
                              provider={api.provider}
                              model={model.name}
                              withTooltip={true}
                            />
                            <span> {model.label || model.name}</span>
                          </div>
                        </Option>
                      ))}
                    </Dropdown>
                  </Field>
                ) : (
                  <div className="flex justify-start items-center gap-2">
                    <ToolStatusIndicator
                      provider={api.provider}
                      model={api.model}
                      withTooltip={true}
                    />
                    <span>{api.model}</span>
                  </div>
                )}
              </div>
              <div>
                <Field label={t('Common.SystemMessage')}>
                  <Textarea
                    value={folderSystemMessage}
                    rows={10}
                    onChange={(e) => setFolderSystemMessage(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="subtle" onClick={() => setOpen(false)}>
                {t('Common.Cancel')}
              </Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary" onClick={() => onConfirm()}>
                {t('Common.Save')}
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
