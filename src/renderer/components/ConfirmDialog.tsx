import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogTrigger,
  DialogBody,
  Button,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { useCallback } from 'react';

export default function ConfirmDialog(args: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}) {
  const { open, setOpen, onConfirm, title, message } = args;
  const { t } = useTranslation();
  const confirm = useCallback(() => {
    async function delAndClose() {
      await onConfirm();
      setOpen(false);
    }
    delAndClose();
  }, [setOpen, onConfirm]);

  return (
    <Dialog open={open}>
      <DialogSurface>
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
            {title || t('Common.DeleteConfirmation')}
          </DialogTitle>
          <DialogContent>
            {message || t('Common.DeleteConfirmationInfo')}
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="subtle" onClick={() => setOpen(false)}>
                {t('Common.Cancel')}
              </Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary" onClick={() => confirm()}>
                {t('Common.Delete')}
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
