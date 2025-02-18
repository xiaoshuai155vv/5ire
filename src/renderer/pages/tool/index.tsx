import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Empty from 'renderer/components/Empty';
import TooltipIcon from 'renderer/components/TooltipIcon';
import useMCPStore from 'stores/useMCPStore';
import Grid from './Grid';
import { Button } from '@fluentui/react-components';
import { ArrowSyncCircleRegular } from '@fluentui/react-icons';
import ToolEditDialog from './EditDialog';
import { IMCPServer } from 'types/mcp';

export default function Tools() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { loadConfig } = useMCPStore();
  const [server, setServer] = useState<IMCPServer | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const config = useMCPStore((state) => state.config);

  const editServer = useCallback((server: IMCPServer) => {
    setServer(server);
    setEditDialogOpen(true);
  }, []);

  const newServer = useCallback(() => {
    setServer(null);
    setEditDialogOpen(true);
  }, []);

  const loadMCPConfig = async (force: boolean, animate: boolean) => {
    try {
      animate && setLoading(true);
      await loadConfig(force);
    } catch (error) {
      console.error(error);
    } finally {
      animate && setLoading(false);
    }
  };

  useEffect(() => {
    console.log('loadConfig');
    loadMCPConfig(false, true);
  }, [config]);

  return (
    <div className="page h-full">
      <div className="page-top-bar"></div>
      <div className="page-header w-full">
        <div className="flex flex-col items-start w-full">
          <div className="flex justify-between items-baseline w-full">
            <h1 className="text-2xl flex-shrink-0 mr-6">{t('Common.Tools')}</h1>
            <div className="flex justify-end w-full items-center gap-2">
              <Button
                icon={
                  <ArrowSyncCircleRegular
                    className={loading ? 'animate-spin' : ''}
                  />
                }
                onClick={() => {
                  setLoading(true);
                  loadMCPConfig(true, false);
                  setTimeout(() => setLoading(false), 1000);
                }}
                appearance="subtle"
                title={t('Common.Action.Reload')}
              />
              <Button appearance="primary" onClick={() => newServer()}>
                {t('Common.New')}
              </Button>
            </div>
          </div>
          <div className="tips flex justify-start items-center">
            {t('Common.MCPServers')}
            <TooltipIcon tip={t('Tools.PrerequisiteDescription')} />
          </div>
        </div>
      </div>
      <div className="mt-2.5 pb-12 h-full -mr-5 overflow-y-auto">
        {config.servers.length === 0 ? (
          <Empty image="tools" text={t('Tool.Info.Empty')} />
        ) : (
          <Grid servers={config.servers} edit={editServer} />
        )}
      </div>
      <ToolEditDialog
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        server={server}
      />
    </div>
  );
}
