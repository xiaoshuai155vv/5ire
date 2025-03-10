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
import { getProvider } from 'providers';
import { IChatModel } from 'providers/types';
import useProvider from 'hooks/useProvider';
import ToolStatusIndicator from './ToolStatusIndicator';
import { set } from 'lodash';

export default function FolderSettingsDialog({
  open,
  setOpen,
  onConfirm,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}) {
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

  const curModelLabel = useMemo(() => {
    return models.find((m) => m.name === folderModel)?.label || '';
  }, [folderModel, models]);

  const { t } = useTranslation();
  const confirm = useCallback(() => {
    async function confirmAndClose() {
      await onConfirm();
      setOpen(false);
    }
    confirmAndClose();
  }, [setOpen, onConfirm]);

  useEffect(() => {
    if (open) {
      setFolderModel(api.model);
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
            <div className="flex flex-col gap-4">
              <div>
                {models.length > 0 ? (
                  <Field>
                    <Dropdown
                      placeholder="Select an model"
                      value={curModelLabel}
                      onOptionSelect={(
                        event: SelectionEvents,
                        data: OptionOnSelectData,
                      ) => {
                        console.log(data.optionValue )
                        setFolderModel(data.optionValue as string);
                      }}
                    >
                      {models.map((model: IChatModel) => (
                        <Option
                          key={model.name}
                          value={model.name}
                          text={model.label || model.name}
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
              <Button appearance="primary" onClick={() => confirm()}>
                {t('Common.Save')}
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
