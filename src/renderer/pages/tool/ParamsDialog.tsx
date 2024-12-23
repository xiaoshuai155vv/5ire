import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
  Input,
  Label,
  makeStyles,
} from '@fluentui/react-components';
import useToast from 'hooks/useToast';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ParamsDialog({
  title,
  open,
  setOpen,
  params,
  onSubmit,
}: {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  params: string[];
  onSubmit: (values: { [key: string]: string }) => void;
}) {
  const { t } = useTranslation();
  const { notifyInfo } = useToast();
  const [paramValues, setParamValues] = useState<{ [key: string]: string }>({});

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    for (const param of params) {
      if (!paramValues[param]) {
        notifyInfo(`${params} ${t('Common.Required')}`);
        return false;
      }
    }
    onSubmit(paramValues);
    setParamValues({});
    setOpen(false);
  };

  const setValue = (key: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogSurface aria-describedby={undefined}>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
              <div className='mb-6'>
                <div className="mb-6">{t('MCP.EditParamsTip')}</div>
                {params.map((param) => (
                  <div key={param} className="my-1.5">
                    <div className="mb-1">
                      <Label>{param}</Label>
                    </div>
                    <Input
                      onInput={(ev: any) =>
                        setValue(param, ev.target?.value || '')
                      }
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">{t('Common.Cancel')}</Button>
              </DialogTrigger>
              <Button type="submit" appearance="primary">
                {t('Common.Save')}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
