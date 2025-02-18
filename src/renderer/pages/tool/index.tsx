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
import useToast from 'hooks/useToast';
import ConfirmDialog from 'renderer/components/ConfirmDialog';
import DetailDialog from './DetailDialog';
import ToolMarketDialog from './MarketDialog';

export default function Tools() {
  const { t } = useTranslation();
  const { notifySuccess, notifyError } = useToast();
  const [loading, setLoading] = useState(false);
  const [server, setServer] = useState<IMCPServer | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [delConfirmDialogOpen, setDelConfirmDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { config, loadConfig, deleteServer } = useMCPStore();

  const editServer = useCallback((server: IMCPServer) => {
    setServer(server);
    setEditDialogOpen(true);
  }, []);

  const newServer = useCallback(() => {
    setServer(null);
    setEditDialogOpen(true);
  }, []);

  const inspectServer = useCallback((server: IMCPServer) => {
    setServer(server);
    setDetailDialogOpen(true);
  }, []);

  const toDeleteServer = useCallback((server: IMCPServer) => {
    setServer(server);
    setDelConfirmDialogOpen(true);
  }, []);

  const onDeleteServer = useCallback(async () => {
    if (server) {
      const ok = await deleteServer(server.key);
      if (ok) {
        notifySuccess('Server deleted successfully');
      } else {
        notifyError('Failed to delete server');
      }
    }
  }, [server]);

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
    loadMCPConfig(false, true);
  }, []);

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
              <ToolMarketDialog />
            </div>
          </div>
          <div className="tips flex justify-start items-center">
            {t('Common.MCPServers')}
            <TooltipIcon tip={t('Tools.PrerequisiteDescription')} />
          </div>
        </div>
      </div>
      <div className="mt-2.5 pb-12 h-full -mr-5 overflow-y-auto">
        {config.servers.length == 0 ? (
          <Empty image="tools" text={t('Tool.Info.Empty')} />
        ) : (
          <Grid
            servers={config.servers}
            onEdit={editServer}
            onDelete={toDeleteServer}
            onInspect={inspectServer}
          />
        )}
      </div>
      <ToolEditDialog
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        server={server}
      />
      <ConfirmDialog
        open={delConfirmDialogOpen}
        setOpen={setDelConfirmDialogOpen}
        title={t('Tools.DeleteConfirmation')}
        message={t('Tools.DeleteConfirmationInfo')}
        onConfirm={onDeleteServer}
      />
      {server && (
        <DetailDialog
          open={detailDialogOpen}
          setOpen={setDetailDialogOpen}
          server={server}
        />
      )}
    </div>
  );
}
