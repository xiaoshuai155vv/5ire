import { Button } from '@fluentui/react-components';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Empty from 'renderer/components/Empty';
import TooltipIcon from 'renderer/components/TooltipIcon';
import useMCPStore, { IMCPServer } from 'stores/useMCPStore';
import Grid from './Grid';

export default function Tools() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const  remoteConfig = useMCPStore((state) => state.remoteConfig);
  const config = useMCPStore((state) => state.config);

  const loadConfig = async () => {
    setLoading(true);
    try {
      await Promise.all([
        useMCPStore.getState().fetchConfig(),
        useMCPStore.getState().getConfig(),
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const servers = useMemo(() => {
    const mergedServers = [...remoteConfig.servers];
    config.servers.forEach((configServer) => {
      const index = mergedServers.findIndex(
        (remoteServer) => remoteServer.key === configServer.key
      );
      if (index !== -1) {
        mergedServers[index] = configServer;
      } else {
        mergedServers.push(configServer);
      }
    });
    return mergedServers;
  }, [remoteConfig, config]);

  useEffect(() => {
    loadConfig();
  }, []);

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
        {servers.length === 0 ? (
          <Empty image="tools" text={t('Tool.Info.Empty')} />
        ) : (
          <Grid servers={servers} />
        )}
      </div>
    </div>
  );
}
