import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Field,
  Label,
  Slider,
  SliderOnChangeData,
} from '@fluentui/react-components';
import {
  bundleIcon,
  Temperature20Filled,
  Temperature20Regular,
} from '@fluentui/react-icons';
import { useState, ChangeEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useChatStore from 'stores/useChatStore';
import Debug from 'debug';
import { IChat, IChatContext } from 'intellichat/types';
import useSettingsStore from 'stores/useSettingsStore';

const debug = Debug('5ire:pages:chat:Editor:Toolbar:TemperatureCtrl');

const TemperatureIcon = bundleIcon(Temperature20Filled, Temperature20Regular);

export default function TemperatureCtrl({ ctx, chat }: { ctx: IChatContext, chat:IChat }) {
  const { t } = useTranslation();
  const providerName = useSettingsStore((state) => state.api).provider;
  const updateChat = useChatStore((state) => state.updateChat);
  const editChat = useChatStore((state) => state.editChat);
  const [maxTemperature, setMaxTemperature] = useState<number>(0);
  const [minTemperature, setMinTemperature] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0);

  useEffect(() => {
    const provider = ctx.getProvider()
    setMinTemperature(provider.chat.temperature.min);
    setMaxTemperature(provider.chat.temperature.max);
    setTemperature(ctx.getTemperature());
  }, [providerName, chat.id]);

  const updateTemperature = (
    ev: ChangeEvent<HTMLInputElement>,
    data: SliderOnChangeData
  ) => {
    const $temperature = data.value;
    if (chat.isPersisted) {
      updateChat({ id: chat.id, temperature: $temperature });
      debug('Update CtxMessages', $temperature);
    } else {
      editChat({ temperature: $temperature });
      debug('Edit CtxMessages', $temperature);
    }
    setTemperature($temperature);
    window.electron.ingestEvent([{ app: 'modify-temperature' }]);
  };

  return (
    <Popover trapFocus withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <Button
          size="small"
          aria-label={t('Common.Temperature')}
          appearance="subtle"
          icon={<TemperatureIcon className='mr-0' />}
          className="justify-start text-color-secondary"
          style={{ padding: 1, minWidth: 30 }}
        >
          <span className='latin'>{temperature}</span>
        </Button>
      </PopoverTrigger>
      <PopoverSurface aria-labelledby="temperature">
        <div className="w-80">
          <Field label={`${t('Common.Temperature')} (${temperature})`}>
            <div className="flex items-center p-1.5">
              <Label aria-hidden>{minTemperature}</Label>
              <Slider
                id="chat-max-context"
                step={0.1}
                min={minTemperature}
                max={maxTemperature}
                value={temperature}
                className="flex-grow"
                onChange={updateTemperature}
              />
              {maxTemperature}
            </div>
            <div className='tips text-sm'>
              {t(
                `Higher values like ${
                  maxTemperature - 0.2
                } will make the output more creative and unpredictable, while lower values like ${
                  minTemperature + 0.2
                } will make it more precise.`
              )}
            </div>
          </Field>
        </div>
      </PopoverSurface>
    </Popover>
  );
}
