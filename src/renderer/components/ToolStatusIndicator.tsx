import { Tooltip } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';

export default function ToolStatusIndicator(
  props: { enabled: boolean; withTooltip?: boolean } & any
) {
  const { enabled, withTooltip, ...rest } = props;
  const { t } = useTranslation();
  const tip = t(enabled ? 'Tool.Supported' : 'Tool.NotSupported');
  return withTooltip ? (
    <Tooltip
      content={{
        children: tip,
      }}
      positioning="above-start"
      withArrow
      relationship="label"
    >
      {enabled ? (
        <span className="text-xs text-green-400 dark:text-green-600" {...rest}>
          ●
        </span>
      ) : (
        <span className="text-xs text-gray-300  dark:text-gray-600" {...rest}>
          ●
        </span>
      )}
    </Tooltip>
  ) : enabled ? (
    <span className="text-xs text-green-400 dark:text-green-600" {...rest}>
      ●
    </span>
  ) : (
    <span className="text-xs text-gray-300  dark:text-gray-600" {...rest}>
      ●
    </span>
  );
}
