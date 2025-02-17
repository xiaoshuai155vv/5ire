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
  InputOnChangeData,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import {
  AddCircleRegular,
  Dismiss24Regular,
  SubtractCircleRegular,
} from '@fluentui/react-icons';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

import 'highlight.js/styles/atom-one-light.css';
import { IMCPServer } from 'types/mcp';
import useMarkdown from 'hooks/useMarkdown';
import { isValidMCPServerKey } from 'utils/validators';
import useMCPStore from 'stores/useMCPStore';
import useToast from 'hooks/useToast';

type EnvItem = {
  name: string | null;
  value: string | null;
};

export default function ToolEditDialog(options: {
  server: IMCPServer | null;
  open: boolean;
  setOpen: Function;
}) {
  const { t } = useTranslation();
  const { render } = useMarkdown();
  const { notifySuccess, notifyError } = useToast();
  const { server, open, setOpen } = options;
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [command, setCommand] = useState('');
  const [envName, setEnvName] = useState('');
  const [envValue, setEnvValue] = useState('');
  const [env, setEnv] = useState<{ [key: string]: string }>({});
  const addServer = useMCPStore((state) => state.addServer);

  const [keyValidationState, setKeyValidationState] = useState<
    'none' | 'error'
  >('none');
  const [commandValidationState, setCommandValidationState] = useState<
    'none' | 'error'
  >('none');

  const cmd = useMemo(() => {
    const arr = command.split(/\s+/).filter((i: string) => i.trim() !== '');
    if (arr.length > 0) {
      return arr[0];
    }
    return '';
  }, [command]);

  const args = useMemo(() => {
    const arr = command.split(/\s+/).filter((i: string) => i.trim() !== '');
    if (arr.length > 1) {
      return arr.slice(1);
    }
    return [];
  }, [command]);

  const preview = useMemo(() => {
    const payload: any = {};
    if (key.trim() !== '') {
      payload.key = key;
    }
    if (description.trim() !== '') {
      payload.description = description;
    }
    if (cmd) {
      payload.command = cmd;
    }
    if (args.length > 0) {
      payload.args = args;
    }
    if (Object.keys(env).length > 0) {
      payload.env = env;
    }
    return JSON.stringify(payload, null, 2);
  }, [key, description, command, env]);

  const addEnv = useCallback(() => {
    if (envName.trim() === '' || envValue.trim() === '') {
      return;
    }
    setEnv({
      ...env,
      [envName.trim()]: envValue.trim(),
    });
    setEnvName('');
    setEnvValue('');
  }, [envName, envValue]);

  const submit = useCallback(async () => {
    let isValid = true;
    if (!isValidMCPServerKey(key)) {
      setKeyValidationState('error');
      isValid = false;
    } else {
      setKeyValidationState('none');
    }
    if (!cmd || args.length === 0) {
      setCommandValidationState('error');
      isValid = false;
    } else {
      setCommandValidationState('none');
    }
    if (!isValid) {
      return;
    }
    const ok = await addServer({
      key,
      description,
      command: cmd,
      args,
      env,
      isActive: false,
    });
    if (ok) {
      setOpen(false);
      notifySuccess('Server added successfully');
    } else {
      notifyError('Server already exists');
    }
  }, [key, cmd, server, args, env]);

  useEffect(() => {}, [open, server]);

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
            {server ? t('Tools.Edit') : t('Tools.New')}
          </DialogTitle>
          <DialogContent className="flex flex-col gap-4">
            <div>
              <Field
                label={t('Tools.Key')}
                validationState={keyValidationState}
                validationMessage={t('Tools.KeyHint')}
              >
                <Input
                  className="w-full min-w-fit"
                  placeholder={t('Common.Required')}
                  onChange={(
                    _: ChangeEvent<HTMLInputElement>,
                    data: InputOnChangeData,
                  ) => {
                    setKey(data.value);
                    if (!data.value || isValidMCPServerKey(data.value)) {
                      setKeyValidationState('none');
                    } else {
                      setKeyValidationState('error');
                    }
                  }}
                />
              </Field>
            </div>
            <div>
              <Field label={t('Common.Description')}>
                <Input
                  className="w-full min-w-fit"
                  placeholder={t('Common.Optional')}
                  onChange={(
                    _: ChangeEvent<HTMLInputElement>,
                    data: InputOnChangeData,
                  ) => {
                    setDescription(data.value);
                  }}
                />
              </Field>
            </div>
            <div>
              <Field
                label={t('Tools.Command')}
                validationMessage={`${t('Tools.Hint.CommandIsRequired')}, like: npx -y @mcp-server"`}
                validationState={commandValidationState}
              >
                <Input
                  className="w-full min-w-fit"
                  placeholder={t('Common.Required')}
                  onChange={(
                    _: ChangeEvent<HTMLInputElement>,
                    data: InputOnChangeData,
                  ) => {
                    setCommand(data.value);
                    if (
                      data.value.trim() !== '' &&
                      (!cmd || args.length === 0)
                    ) {
                      setCommandValidationState('error');
                    } else {
                      setCommandValidationState('none');
                    }
                  }}
                />
              </Field>
            </div>
            <div>
              <Field label={t('Tools.EnvVars')}>
                <div className="bg-gray-50 dark:bg-stone-800 min-h-32 border rounded dark:border-neutral-500">
                  <div className="flex flex-start items-center border-b px-1 py-1">
                    <div className="w-5/12">{t('Common.EnvName')}</div>
                    <div className="w-6/12">{t('Common.EnvValue')}</div>
                    <div></div>
                  </div>
                  <div className="flex flex-start items-center border-b px-1 p-1">
                    <div className="w-5/12 px-1">
                      <Input
                        className="w-full"
                        size="small"
                        value={envName || ''}
                        onChange={(
                          _: ChangeEvent<HTMLInputElement>,
                          data: InputOnChangeData,
                        ) => {
                          setEnvName(data.value);
                        }}
                      />
                    </div>
                    <div className="w-6/12 px-1">
                      <Input
                        className="w-full"
                        size="small"
                        value={envValue || ''}
                        onChange={(
                          _: ChangeEvent<HTMLInputElement>,
                          data: InputOnChangeData,
                        ) => {
                          setEnvValue(data.value);
                        }}
                      />
                    </div>
                    <div>
                      <Button
                        appearance="subtle"
                        onClick={addEnv}
                        icon={<AddCircleRegular />}
                        size="small"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto min-h-20 max-h-40 flex flex-col">
                    {Object.keys(env).map((key: string) => (
                      <div
                        key={key}
                        className="flex flex-start items-center border-b w-full px-1 py-1"
                      >
                        <div className="w-5/12 px-2">{key}</div>
                        <div className="w-6/12 px-2">{env[key]}</div>
                        <div>
                          <Button
                            appearance="subtle"
                            icon={<SubtractCircleRegular />}
                            size="small"
                            onClick={() => {
                              const newEnv = { ...env };
                              delete newEnv[key];
                              setEnv(newEnv);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Field>
            </div>
            <div>
              <Field label={t('Tools.ConfigPreview')} hint="in JSON format">
                <div className="bg-gray-50 dark:bg-stone-800 min-h-32 border rounded dark:border-neutral-500">
                  <div
                    className="-mt-3"
                    dangerouslySetInnerHTML={{
                      __html: render(`\`\`\`json\n${preview}\n\`\`\``),
                    }}
                  />
                </div>
              </Field>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="subtle" onClick={() => setOpen(false)}>
                {t('Common.Cancel')}
              </Button>
            </DialogTrigger>
            <Button type="submit" appearance="primary" onClick={submit}>
              {t('Common.Save')}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
