import { captureException } from '@sentry/react';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RadioGroup,
  Radio,
  RadioGroupOnChangeData,
} from '@fluentui/react-components';
import { ThemeType } from '../../../types/appearance.d';
import useSettingsStore from '../../../stores/useSettingsStore';
import useAppearanceStore from '../../../stores/useAppearanceStore';

export default function AppearanceSettings() {
  const { t } = useTranslation();
  const { setTheme } = useAppearanceStore();
  const themeSetting = useSettingsStore((state) => state.theme);
  const setThemeSetting = useSettingsStore((state) => state.setTheme);

  const onThemeChange = (
    ev: FormEvent<HTMLDivElement>,
    data: RadioGroupOnChangeData
  ) => {
    setThemeSetting(data.value as ThemeType);
    if (data.value === 'system') {
      window.electron
        .getNativeTheme()
        .then((_theme) => {
          return setTheme(_theme as ThemeType);
        })
        .catch(captureException);
    } else {
      setTheme(data.value as ThemeType);
    }
  };
  return (
    <div className="settings-section">
      <div className="settings-section--header">{t('Common.Appearance')}</div>
      <div className="py-4 flex-grow">
        <RadioGroup
          aria-labelledby={t('Common.Appearance')}
          value={themeSetting}
          onChange={onThemeChange}
        >
          <Radio name="appearance" value="light" label={t('Common.Light')} />
          <Radio name="appearance" value="dark" label={t('Common.Dark')} />
          <Radio name="appearance" value="system" label={t('Apperance.System')} />
        </RadioGroup>
      </div>
    </div>
  );
}
