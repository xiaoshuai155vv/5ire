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
  SpinButton,
  SpinButtonChangeEvent,
  SpinButtonOnChangeData,
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
import { DEFAULT_TEMPERATURE, tempChatId } from 'consts';
import ToolStatusIndicator from './ToolStatusIndicator';

export default function FolderSettingsDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const chat = useChatStore((state) => state.chat);
  const chats = useChatStore((state) => state.chats);
  const { updateFolder, updateChat, editStage } = useChatStore();
  const folder = useChatStore((state) => state.folder);
  const api = useSettingsStore((state) => state.api);
  const session = useAuthStore((state) => state.session);
  const [folderModel, setFolderModel] = useState(api.model);
  const [folderSystemMessage, setFolderSystemMessage] = useState('');
  const [folderTemperature, setFolderTemperature] = useState(1);
  const { getChatModels } = useProvider();

  const temperatureConfig = useMemo(() => {
    return getProvider(api.provider).chat.temperature;
  }, [api.provider]);

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
    let curModel = models.find((m) => m.name === folderModel);
    if (!curModel) {
      curModel = getChatModel(api.provider, folderModel);
    }
    return curModel || {};
  }, [folderModel, models]);

  const curModelLabel = useMemo(() => {
    return curModel?.label || curModel?.name || '';
  }, [curModel]);

  const { t } = useTranslation();
  const onConfirm = useCallback(async () => {
    await updateFolder({
      id: folder?.id as string,
      model: folderModel,
      temperature: folderTemperature,
      systemMessage: folderSystemMessage,
    });
    if (chat.id === tempChatId) {
      editStage(chat.id, {
        model: folderModel,
        temperature: folderTemperature,
        systemMessage: folderSystemMessage,
      });
    }
    await Promise.all(
      subChats.map((chat) => {
        updateChat({
          id: chat.id,
          model: folderModel,
          temperature: folderTemperature,
          systemMessage: folderSystemMessage,
        });
      }),
    );
    setOpen(false);
  }, [
    setOpen,
    folderModel,
    folderSystemMessage,
    folderTemperature,
    folder?.id,
    subChats,
  ]);

  const onTemperatureChange = useCallback(
    (ev: SpinButtonChangeEvent, data: SpinButtonOnChangeData) => {
      const value = data.value
        ? Math.round(data.value * 10) / 10
        : Math.round(parseFloat(data.displayValue as string) * 10) / 10;
      const $temperature = Math.max(
        Math.min(value as number, temperatureConfig.max),
        temperatureConfig.min,
      );
      setFolderTemperature($temperature);
    },
    [api.provider],
  );

  useEffect(() => {
    if (open) {
      const model = getChatModel(api.provider, folder?.model || api.model);
      setFolderModel(model.name || api.model);
      setFolderSystemMessage(folder?.systemMessage || '');
      let temperature =
        folder?.temperature || temperatureConfig.default || DEFAULT_TEMPERATURE;
      if (
        temperature < temperatureConfig.min ||
        temperature > temperatureConfig.max
      ) {
        temperature = temperatureConfig.default || DEFAULT_TEMPERATURE;
      }
      console.log('temperature', temperature);
      setFolderTemperature(temperature);
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
            <div className="flex flex-col gap-4 w-full">
              <div className="flex justify-evenly gap-2">
                <Field label={t('Common.Model')} className="w-full">
                  {models.length > 0 ? (
                    <Dropdown
                      className="w-full"
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
                          text={(model.label || model.name) as string}
                        >
                          <div className="flex justify-start items-center gap-1">
                            <ToolStatusIndicator
                              provider={api.provider}
                              model={model.name}
                              withTooltip
                            />
                            <span> {model.label || model.name}</span>
                          </div>
                        </Option>
                      ))}
                    </Dropdown>
                  ) : (
                    <div
                      className="flex justify-start items-center gap-2 border border-gray-400 dark:border-gray-500 px-2 rounded flex-grow w-full"
                      style={{ height: 33 }}
                    >
                      <ToolStatusIndicator
                        provider={api.provider}
                        model={api.model}
                        withTooltip
                      />
                      <span>{api.model}</span>
                    </div>
                  )}
                </Field>
                <div className="w-full">
                  <Field
                    label={`${t('Common.Temperature')}[${temperatureConfig.min},${temperatureConfig.max}]`}
                  >
                    <SpinButton
                      precision={1}
                      step={0.1}
                      value={folderTemperature || DEFAULT_TEMPERATURE}
                      max={temperatureConfig.max}
                      min={temperatureConfig.min}
                      onChange={onTemperatureChange}
                      id="temperature"
                    />
                  </Field>
                </div>
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
