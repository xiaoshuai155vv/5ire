import {
  Dropdown,
  Input,
  Label,
  Option,
  Button,
  Tooltip,
  Switch,
  SwitchOnChangeData,
  Field,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import useSettingsStore from '../../../stores/useSettingsStore';
import { ChangeEvent, useEffect, useMemo } from 'react';
import { IChatModel, IServiceProvider } from '../../../providers/types';
import useProvider from 'hooks/useProvider';
import { Info16Regular } from '@fluentui/react-icons';
import TooltipIcon from 'renderer/components/TooltipIcon';
import ToolStatusIndicator from 'renderer/components/ToolStatusIndicator';
import OllamaModelPicker from './OllamaModelPicker';

export default function ModelField({
  provider,
}: {
  provider: IServiceProvider;
}) {
  const { t } = useTranslation();
  const model = useSettingsStore((state) => state.api.model);
  const toolEnabled = useSettingsStore((state) => state.api.toolEnabled);
  const baseUrl = useSettingsStore((state) => state.api.base);
  const { getChatModels } = useProvider();
  const setAPI = useSettingsStore((state) => state.setAPI);
  const { getDefaultChatModel } = useProvider();

  const models = useMemo(() => {
    return getChatModels(provider.name);
  }, [provider]);

  useEffect(() => {
    setAPI({ model: model || getDefaultChatModel(provider.name).name || '' });
  }, [provider]);

  const onOptionSelect = (ev: any, data: any) => {
    setAPI({ model: data.optionValue });
  };

  const onInput = (evt: any) => {
    setAPI({ model: evt.target.value });
  };

  const setModel = (model: string) => {
    setAPI({ model });
  };

  const setToolEnabled = (
    _: ChangeEvent<HTMLInputElement>,
    data: SwitchOnChangeData,
  ) => {
    setAPI({ toolEnabled: data.checked });
  };

  return (
    <div className="my-3.5">
      <div className="flex justify-start items-center mb-1.5">
        <Label htmlFor="model">{t('Common.Model')}</Label>
        <TooltipIcon tip={t(provider.chat.docs?.model || '')} />
      </div>
      <div>
        {models.length > 0 ? (
          models.length === 1 ? (
            <div className="flex flex-row justify-start items-center gap-1">
              <ToolStatusIndicator
                enabled={models[0].toolEnabled}
                withTooltip={true}
              />
              <span className="latin">{models[0].label}</span>
              {models[0].description && (
                <Tooltip
                  content={models[0].description as string}
                  relationship="label"
                >
                  <Button
                    icon={<Info16Regular />}
                    size="small"
                    appearance="subtle"
                  />
                </Tooltip>
              )}
            </div>
          ) : (
            <Dropdown
              aria-labelledby="model"
              value={model}
              selectedOptions={[model]}
              onOptionSelect={onOptionSelect}
            >
              {models.map((model: IChatModel) => (
                <Option
                  key={model.label as string}
                  text={model.label as string}
                >
                  <div className="flex justify-start items-center latin">
                    <div className="flex justify-start items-baseline gap-1">
                      <ToolStatusIndicator enabled={model.toolEnabled} />
                      <span className="latin">{model.label as string}</span>
                    </div>
                    {model.description && (
                      <Tooltip
                        content={model.description as string}
                        relationship="label"
                      >
                        <Button
                          icon={<Info16Regular />}
                          size="small"
                          appearance="subtle"
                        />
                      </Tooltip>
                    )}
                  </div>
                </Option>
              ))}
            </Dropdown>
          )
        ) : (
          <div className="flex justify-start items-center gap-1 w-4/5 min-w-fit relative">
            {provider.chat.options.modelCustomizable && (
              <Input
                value={model}
                placeholder={t(provider.chat.placeholders?.deploymentId || '')}
                onInput={onInput}
                className="w-full"
              />
            )}
            {provider.name === 'Ollama' && (
              <div className="absolute right-1 top-1">
                <OllamaModelPicker baseUrl={baseUrl} onConfirm={setModel} />
              </div>
            )}
          </div>
        )}
      </div>
      {provider.name === 'Ollama' && (
        <div className="my-3.5">
          <div className="flex justify-start items-center mb-1.5">
            <Label>{t('Common.SupportTools')}</Label>
            <TooltipIcon tip={t('Common.SupportToolsTip')} />
          </div>
          <div className="flex justify-start items-center gap-1 -mt-1">
            <Switch checked={toolEnabled || false} onChange={setToolEnabled} />
          </div>
        </div>
      )}
    </div>
  );
}
