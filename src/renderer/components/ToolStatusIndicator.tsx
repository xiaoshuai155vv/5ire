import { Tooltip } from '@fluentui/react-components';
import useProvider from 'hooks/useProvider';
import { isUndefined } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSettingsStore from 'stores/useSettingsStore';

export default function ToolStatusIndicator(
  props: {
    provider: string;
    model: string;
    withTooltip?: boolean;
  } & any,
) {
  const { provider, model, withTooltip, ...rest } = props;
  const { getToolState } = useSettingsStore();
  const { getChatModel } = useProvider();

  const originalSupport = useMemo(
    () => getChatModel(provider, model).toolEnabled || false,
    [provider, model],
  );

  const actualSupport = useMemo(() => {
    let toolEnabled = getToolState(provider, model);
    if (isUndefined(toolEnabled)) {
      toolEnabled = originalSupport;
    }
    return toolEnabled;
  }, [provider, model, originalSupport]);

  const { t } = useTranslation();
  const tip = t(actualSupport ? 'Tool.Supported' : 'Tool.NotSupported');

  const indicator = () => {
    return (
      <div
        className={`flex text-center justify-center items-center rounded-full border ${originalSupport ? ' border-green-400 dark:border-green-800' : 'border-gray-300 dark:border-neutral-600'}`}
        style={{ width: 14, height: 14, borderStyle:'dashed' }}
      >
        {actualSupport ? (
          <div
            className="rounded-full bg-green-400 dark:bg-green-600"
            style={{ width: 10, height: 10 }}
            {...rest}
          ></div>
        ) : (
          <div
            className="rounded-full bg-neutral-300  dark:bg-neutral-600"
            style={{ width: 10, height: 10 }}
            {...rest}
          ></div>
        )}
      </div>
    );
  };

  return withTooltip ? (
    <Tooltip
      content={{
        children: tip,
      }}
      positioning="above-start"
      withArrow
      relationship="label"
    >
      {indicator()}
    </Tooltip>
  ) : (
    indicator()
  );
}
