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
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { IChatModel, IServiceProvider } from '../../../providers/types';
import useProvider from 'hooks/useProvider';
import { Info16Regular } from '@fluentui/react-icons';
import TooltipIcon from 'renderer/components/TooltipIcon';
import ToolStatusIndicator from 'renderer/components/ToolStatusIndicator';
import OllamaModelPicker from './OllamaModelPicker';
import { get, isUndefined, set } from 'lodash';

export default function ModelField({
  provider,
}: {
  provider: IServiceProvider;
}) {
  const { t } = useTranslation();
  const toolStates = useSettingsStore((state) => state.toolStates);
  const model = useSettingsStore((state) => state.api.model);
  const baseUrl = useSettingsStore((state) => state.api.base);
  const { getChatModels } = useProvider();
  const { setAPI, setToolState, getToolState } = useSettingsStore();
  const { getDefaultChatModel } = useProvider();
  const [toolEnabled, setToolEnabled] = useState(
    getToolState(provider.name, model),
  );

  const models = useMemo(() => {
    return getChatModels(provider.name);
  }, [provider]);

  useEffect(() => {
    setAPI({
      model: model || getDefaultChatModel(provider.name).name || '',
    });
  }, [provider]);

  useEffect(() => {
    let toolEnabled = getToolState(provider.name, model);
    if (isUndefined(toolEnabled)) {
      const curModel = models.find((m) => m.name === model);
      toolEnabled = curModel?.toolEnabled || false;
    }
    setToolEnabled(toolEnabled);
  }, [provider, model, toolStates]);

  const onOptionSelect = (ev: any, data: any) => {
    setAPI({ model: data.optionValue });
  };

  const onInput = (evt: any) => {
    setAPI({ model: evt.target.value });
  };

  const setModel = (model: string) => {
    setAPI({ model });
  };

  const setToolSetting = (
    _: ChangeEvent<HTMLInputElement>,
    data: SwitchOnChangeData,
  ) => {
    setToolState(provider.name, model, data.checked);
  };

  return (
    <div className="flex justify-start items-center my-3.5 gap-1">
      <div className="w-72">
        <div className="flex justify-start items-center mb-1.5 w-full">
          <Label htmlFor="model">{t('Common.Model')}</Label>
          <TooltipIcon tip={t(provider.chat.docs?.model || '')} />
        </div>
        <div className="w-full">
          {models.length > 0 ? (
            models.length === 1 ? (
              <div className="flex flex-row justify-start items-center gap-1 w-full">
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
                className="w-full"
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
            <div className="flex flex-grow justify-start items-center gap-1 relative">
              {provider.chat.options.modelCustomizable && (
                <Input
                  value={model}
                  placeholder={t(
                    provider.chat.placeholders?.deploymentId || '',
                  )}
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
      </div>
      <div>
        <div className="flex justify-start items-center">
          <Label>{t('Common.Tools')}</Label>
          <TooltipIcon tip={t('Common.SupportToolsTip')} />
        </div>
        <div className="flex justify-start items-center gap-1 -mb-1.5">
          <Switch checked={toolEnabled || false} onChange={setToolSetting} />
        </div>
      </div>
    </div>
  );
}
