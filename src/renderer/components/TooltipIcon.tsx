import { Tooltip } from '@fluentui/react-components';
import { Info16Regular } from '@fluentui/react-icons';

export default function TooltipIcon({
  tip,
}: {
  tip: string | undefined | null;
}) {
  return tip ? (
    <Tooltip
      content={{
        children: tip,
      }}
      positioning="above-start"
      withArrow
      relationship="label"
    >
      <Info16Regular tabIndex={0} className="inline-block ml-1.5" />
    </Tooltip>
  ) : null;
}
