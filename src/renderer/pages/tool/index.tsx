import { Button } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import Empty from 'renderer/components/Empty';
import TooltipIcon from 'renderer/components/TooltipIcon';

export default function Tools() {
  const { t } = useTranslation();
  return (
    <div className="page h-full">
      <div className="page-top-bar"></div>
      <div className="page-header w-full">
        <div className="flex flex-col items-start w-full">
          <div className="flex justify-between items-baseline w-full">
            <h1 className="text-2xl flex-shrink-0 mr-6">{t('Common.Tools')}</h1>
            <div className="flex justify-end w-full items-center gap-2">
              <Button appearance="primary">{t('Common.New')}</Button>
            </div>
          </div>
          <div className="tips flex justify-start items-center">
            {t('Common.MCPServers')}
            <TooltipIcon
              tip={t('Tools.Description') + '\n' + t('Common.MCPDescription')}
            />
          </div>
        </div>
      </div>
      <div className="mt-2.5 pb-12 h-full -mr-5 overflow-y-auto">
        <Empty image="tools" text={t('Tool.Info.Empty')} />
      </div>
    </div>
  );
}
