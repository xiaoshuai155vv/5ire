import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogBody,
  Button,
  List,
  ListItem,
} from '@fluentui/react-components';
import Mousetrap from 'mousetrap';
import { useTranslation } from 'react-i18next';
import {
  BuildingShopFilled,
  BuildingShopRegular,
  bundleIcon,
  Dismiss24Regular,
  Home16Regular,
} from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import useMCPServerMarketStore from 'stores/useMCPServerMarketStore';
import Spinner from 'renderer/components/Spinner';
const BuildingShopIcon = bundleIcon(BuildingShopFilled, BuildingShopRegular);

export default function ToolMarketDialog() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { fetchServers, servers } = useMCPServerMarketStore();

  const loadServers = async () => {
    setLoading(true);
    try {
      await fetchServers(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      Mousetrap.bind('esc', () => setOpen(false));
      loadServers();
    }
    return () => {
      Mousetrap.unbind('esc');
    };
  }, [open]);

  return (
    <Dialog open={open}>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="outline"
          icon={<BuildingShopIcon />}
          onClick={() => setOpen(true)}
        >
          {t('Tools.Market')}
        </Button>
      </DialogTrigger>
      <DialogSurface mountNode={document.body.querySelector('#portal')}>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  onClick={() => setOpen(false)}
                  appearance="subtle"
                  aria-label="close"
                  icon={<Dismiss24Regular />}
                />
              </DialogTrigger>
            }
          >
            {t('Tools.Market')}
          </DialogTitle>
          <DialogContent>
            {loading ? (
              <div className="h-32 flex flex-col items-center justify-center">
                <Spinner size={48} />
                <p className="mt-4 text-gray-400 dark:text-neutral-800">
                  {t('Common.Loading')}
                </p>
              </div>
            ) : servers.length > 0 ? (
              <div className="max-h-[600px] overflow-y-auto -mr-5 pr-5">
                <List navigationMode="items">
                  {servers.map((server) => (
                    <ListItem key={server.key}>
                      <div className="py-2 my-x [&:not(:last-child)]:border-b border-base w-full">
                        <div className="text-lg font-bold">
                          {server.name || server.key}
                        </div>
                        <p className='text-gray-700 dark:text-gray-400'>{server.description}</p>
                        {server.homepage && (
                          <div
                            className="text-gray-400 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-300 inline-block"
                            onClick={() =>
                              window.electron.openExternal(
                                server.homepage as string,
                              )
                            }
                          >
                            {server.homepage}
                          </div>
                        )}
                      </div>
                    </ListItem>
                  ))}
                </List>
              </div>
            ) : (
              <div>Empty</div>
            )}
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
