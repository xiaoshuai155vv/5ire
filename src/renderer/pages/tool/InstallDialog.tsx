import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogBody,
  Button,
  Field,
  Input,
  DialogActions,
} from '@fluentui/react-components';
import Mousetrap from 'mousetrap';
import { useTranslation } from 'react-i18next';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import * as mcpUtils from 'utils/mcp';
import { IMCPServer, IMCPServerParameter } from 'types/mcp';

export default function ToolInstallDialog(options: {
  server: IMCPServer;
  open: boolean;
  setOpen: Function;
}) {
  const { server, open, setOpen } = options;
  const { t } = useTranslation();
  const [params, setParams] = useState<IMCPServerParameter[]>([]);

  const activateServerWithParams = async (params: {
    [key: string]: string;
  }) => {
    const args = mcpUtils.setParameters(server.args, params);
    const env = mcpUtils.setEnv(server.env, params);
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      Mousetrap.bind('esc', () => setOpen(false));
      setParams([
        ...mcpUtils.getParameters(server.args),
        ...mcpUtils.getParameters(Object.values(server.env || {})),
      ]);
    }
    return () => {
      Mousetrap.unbind('esc');
    };
  }, [open]);

  return (
    <Dialog open={open}>
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
            {server.name || server.key}
          </DialogTitle>
          <DialogContent>
            {params.length > 0 ? (
              <div className="flex flex-col gap-2">
                {params.map((param: IMCPServerParameter) => {
                  return (
                    <div>
                      <Field label={param.name} hint={param.description}>
                        <Input className="w-full" />
                      </Field>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <span>
                  {server.description || t('Tools.InstallConfirmation')}
                </span>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="subtle" onClick={() => setOpen(false)}>
                {t('Common.Cancel')}
              </Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary" onClick={() => confirm()}>
                {t('Common.Action.Install')}
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
