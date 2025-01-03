import {
  Dropdown,
  Input,
  Label,
  Option,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import useSettingsStore from '../../../stores/useSettingsStore';
import { useEffect, useMemo } from 'react';
import { IChatModel, IServiceProvider } from '../../../providers/types';
import useProvider from 'hooks/useProvider';
import { Info16Regular, Wand16Regular } from '@fluentui/react-icons';
import TooltipIcon from 'renderer/components/TooltipIcon';

export default function ModelField({
  provider,
}: {
  provider: IServiceProvider;
}) {
  const { t } = useTranslation();
  const model = useSettingsStore((state) => state.api.model);
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

  return (
    <div className="my-3.5">
      <div className="flex justify-start items-center mb-1.5">
        <Label htmlFor="model">{t('Common.Model')}</Label>
        <TooltipIcon tip={t(provider.chat.docs?.model || '')} />
      </div>
      {}
      <div>
        {models.length > 0 ? (
          models.length === 1 ? (
            <div className="flex flex-row justify-start items-center gap-1">
              <span className="latin">{models[0].label}</span>
              {models[0].toolEnabled && <Wand16Regular />}
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
                    <div className="flex justify-start items-center gap-1">
                      <span className="latin">{model.label as string}</span>
                      {model.toolEnabled && <Wand16Regular />}
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
          provider.chat.options.modelCustomizable && (
            <Input
              value={model}
              placeholder={t(provider.chat.placeholders?.deploymentId || '')}
              onInput={onInput}
              className="w-4/5 min-w-fit"
            />
          )
        )}
      </div>
    </div>
  );
}
