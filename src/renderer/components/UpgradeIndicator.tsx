import { useEffect, useState } from 'react';
import Spinner from './Spinner';
import { t } from 'i18next';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
} from '@fluentui/react-components';

export default function UpgradeIndicator() {
  const [upgrading, setUpgrading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    window.electron.ipcRenderer.on('app-upgrade-start', (info: any) => {
      setUpgrading(true);
      setVersion(info.version);
    });
    window.electron.ipcRenderer.on('app-upgrade-not-available', (info: any) => {
      console.log('app-upgrade-not-available');
    });
    window.electron.ipcRenderer.on('app-upgrade-end', (info: any) => {
      setUpgrading(false);
    });
    window.electron.ipcRenderer.on('app-upgrade-error', () => {
      setError(true);
    });
  }, []);

  if (error) {
    return (
      <Dialog>
        <DialogTrigger disableButtonEnhancement>
          <button
            className="upgrade-indicator flex justify-center items-center rounded-full px-2 py-0.5 bg-red-200 dark:bg-red-900 text-red-800  dark:text-red-400 text-xs"
            style={{ paddingBottom: 3 }}
          >
            <span>{t('Common.UpgradeFailed')}</span>
          </button>
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t('Common.UpgradeFailed')}</DialogTitle>
            <DialogContent>{t('Common.UpgradeErrorInfo')}</DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">
                  {t('Common.Action.Close')}
                </Button>
              </DialogTrigger>
              <Button
                appearance="primary"
                onClick={() => window.electron.openExternal('https://5ire.app')}
              >
                {t('Common.Action.GoWebsite')}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    );
  }

  return upgrading ? (
    <div className="upgrade-indicator flex justify-center items-center rounded-full pl-1 pr-2 py-0.5 bg-orange-200 text-orange-800 text-xs">
      <Spinner size={14} className="mr-2" />
      <span>{version}</span>
    </div>
  ) : null;
}
