import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Textarea,
} from '@fluentui/react-components';
import useToast from 'hooks/useToast';
import { t } from 'i18next';
import { useMemo, useState } from 'react';
import useSettingsStore from 'stores/useSettingsStore';

export default function ModelMappingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifyError, notifySuccess } = useToast();
  const { modelMapping, setModelMapping } = useSettingsStore();
  const [modelMappingText, setModelMappingText] = useState(
    JSON.stringify(modelMapping, null, 2)
  );
  const numOfMapping = useMemo(() => {
    return Object.keys(modelMapping).length;
  }, [modelMapping]);
  const onSave = () => {
    try {
      let mapping = modelMappingText.replace(/,(\s*[}\]])/g, '$1'); // remove comma before closing brace
      if (mapping.trim() === '') {
        mapping = '{}';
      }
      const newModelMapping = JSON.parse(mapping);
      setModelMappingText(JSON.stringify(newModelMapping, null, 2));
      setModelMapping(newModelMapping);
      notifySuccess(t('settings.modelMappingSaved'));
      setIsOpen(false);
    } catch (_) {
      notifyError(t('Common.InvalidJson'));
    }
  };
  return (
    <div>
      <Dialog open={isOpen} onOpenChange={(_, data) => setIsOpen(data.open)}>
        <DialogTrigger disableButtonEnhancement>
          <Button onClick={() => setIsOpen(true)}>
            {t('settings.modelMapping')} ({numOfMapping})
          </Button>
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t('settings.modelMapping')}</DialogTitle>
            <DialogContent>
              <p>{t('settings.modelMappingDescription')}</p>
              <div className="w-full mt-2">
                <Field>
                  <Textarea
                    className="w-ful"
                    rows={10}
                    value={modelMappingText}
                    onChange={(e) =>
                      setModelMappingText(
                        e.target.value
                          .replace(/，/g, ',') // 全角逗号替换为半角
                          .replace(/：/g, ':') // 全角冒号替换为半角
                          .replace(/｛/g, '{') // 全角大括号替换为半角
                          .replace(/｝/g, '}') // 全角大括号替换为半角
                          .replace(/"/g, '"') // 全角引号替换为半角
                          .replace(/"/g, '"') // 全角引号替换为半角
                      )
                    }
                  />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">{t('Common.Cancel')}</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={onSave}>
                {t('Common.Save')}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
