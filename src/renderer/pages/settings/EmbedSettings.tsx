import { Button, Spinner, ProgressBar } from '@fluentui/react-components';
import {
  CheckmarkCircle16Filled,
  CheckmarkCircle20Filled,
} from '@fluentui/react-icons';
import useToast from 'hooks/useToast';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from 'renderer/components/ConfirmDialog';
import Debug from 'debug';

const debug = Debug('5ire:pages:settings:EmbedSettings');

const FILES = [
  {
    name: 'config.json',
    url: 'https://huggingface.co/Xenova/bge-m3/resolve/main/config.json?download=true',
  },
  {
    name: 'tokenizer_config.json',
    url: 'https://huggingface.co/Xenova/bge-m3/resolve/main/tokenizer_config.json?download=true',
  },
  {
    name: 'tokenizer.json',
    url: 'https://huggingface.co/Xenova/bge-m3/resolve/main/tokenizer.json?download=true',
  },
  {
    name: 'model_quantized.onnx',
    url: 'https://huggingface.co/Xenova/bge-m3/resolve/main/onnx/model_quantized.onnx?download=true',
  },
];

export default function EmbedSettings() {
  const model = 'Xenova/bge-m3';
  const { t } = useTranslation();
  const { notifySuccess, notifyError } = useToast();
  const [delConfirmDialogOpen, setDelConfirmDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [fileStatus, setFileStatus] = useState<{ [key: string]: boolean }>({
    'model_quantized.onnx': false,
    'config.json': false,
    'tokenizer_config.json': false,
    'tokenizer.json': false,
  });
  const [downloading, setDownloading] = useState<{ [key: string]: boolean }>({
    'model_quantized.onnx': false,
    'config.json': false,
    'tokenizer_config.json': false,
    'tokenizer.json': false,
  });
  const [progress, setProgress] = useState<{ [key: string]: number }>({
    'model_quantized.onnx': 0,
    'config.json': 0,
    'tokenizer_config.json': 0,
    'tokenizer.json': 0,
  });

  const isDownloading = useMemo(() => {
    return Object.values(downloading).some((item) => item);
  }, [downloading]);

  const isModelReady = useMemo(() => {
    return Object.values(fileStatus).every((item) => item);
  }, [fileStatus]);

  useEffect(() => {
    if (!Object.values(downloading).some((item) => item)) {
      setCancelling(false);
    }
  }, [downloading]);

  useEffect(() => {
    window.electron.embeddings.getModelFileStatus().then((fileStatus: any) => {
      setFileStatus(fileStatus);
    });
    window.electron.ipcRenderer.on('download-started', (fileName: unknown) => {
      setDownloading((prev) => ({ ...prev, [fileName as string]: true }));
    });
    window.electron.ipcRenderer.on(
      'download-progress',
      (fileName: unknown, value: unknown) => {
        debug(`${fileName}:${(value as number).toFixed(2)}`);
        setProgress((prev = {}) => ({
          ...prev,
          [fileName as string]: value as number,
        }));
      }
    );
    window.electron.ipcRenderer.on(
      'download-completed',
      (fileName: unknown, filePath: unknown) => {
        debug(`${fileName}: completed`);
        window.electron.embeddings
          .saveModelFile(fileName as string, filePath as string)
          .then(() => {
            setFileStatus((prev) => ({ ...prev, [fileName as string]: true }));
            setDownloading((prev) => ({
              ...prev,
              [fileName as string]: false,
            }));
          })
          .catch(() => {
            notifyError(t('Settings.Embeddings.Notification.ModelSaveFailedError'));
          });
      }
    );
    window.electron.ipcRenderer.on(
      'download-failed',
      (fileName: unknown, filePath: unknown, state: unknown) => {
        debug(`${fileName}: failed`);
        setDownloading((prev) => ({
          ...prev,
          [fileName as string]: false,
        }));
      }
    );
    return () => {
      window.electron.ipcRenderer.unsubscribeAll('download-started');
      window.electron.ipcRenderer.unsubscribeAll('download-progress');
      window.electron.ipcRenderer.unsubscribeAll('download-completed');
      window.electron.ipcRenderer.unsubscribeAll('download-failed');
    };
  }, []);

  function downloadModel() {
    setProgress({
      'model_quantized.onnx': 0,
      'config.json': 0,
      'tokenizer_config.json': 0,
      'tokenizer.json': 0,
    });
    setDownloading({
      'model_quantized.onnx': true,
      'config.json': true,
      'tokenizer_config.json': true,
      'tokenizer.json': true,
    });
    FILES.forEach((item: any) => {
      window.electron.download(item.name, item.url);
    });
  }

  function cancelDownload() {
    setCancelling(true);
    for (const item of FILES) {
      window.electron.cancelDownload(item.name);
    }
    removeModel();
  }

  function removeModel() {
    window.electron.embeddings.removeModel().then(() => {
      setFileStatus({
        'model_quantized.onnx': false,
        'config.json': false,
        'tokenizer_config.json': false,
        'tokenizer.json': false,
      });
    });
  }

  return (
    <div className="settings-section">
      <div className="settings-section--header">
        {t('Common.Embeddings')}
      </div>
      <div className="py-4 flex-grow mt-1">
        <div className="flex justify-between items-start">
          <div className="mr-2">
            <div className="flex flex-start items-center gap-2">
              <span>{t('Common.Model')}: </span>
              <span>{model}</span>
              {isModelReady && (
                <CheckmarkCircle20Filled className="text-green-500" />
              )}
            </div>
            <div className="tips mt-2 mb-2">
              {isModelReady
                ? t('Settings.Embeddings.Tip.ModelExists')
                : t('Settings.Embeddings.Tip.ModelRequired')}
            </div>
            <div>
              {isModelReady ||
                (isDownloading
                  ? FILES.map((file) => (
                      <div
                        className="flex justify-start items-center gap-2 py-1"
                        key={file.name}
                      >
                        <div>{file.name}</div>
                        {cancelling ? (
                          <span className="text-gray-500">
                            {t('Common.Cancelling')}...
                          </span>
                        ) : downloading[file.name] ? (
                          progress[file.name] ? (
                            <ProgressBar
                              value={progress[file.name]}
                              className="w-32"
                            />
                          ) : (
                            <Spinner
                              size="extra-tiny"
                              className="flex-shrink-0"
                            />
                          )
                        ) : (
                          fileStatus[file.name] && (
                            <CheckmarkCircle16Filled className="text-green-500" />
                          )
                        )}
                      </div>
                    ))
                  : null)}
            </div>
          </div>
          {isModelReady ? (
            <Button
              appearance="subtle"
              size="small"
              onClick={() => setDelConfirmDialogOpen(true)}
            >
              {t('Common.Delete')}
            </Button>
          ) : isDownloading ? (
            <Button
              disabled={cancelling}
              appearance="subtle"
              icon={<Spinner size="extra-tiny" className="flex-shrink-0" />}
              size="small"
              onClick={cancelDownload}
            >
              <span>
                {cancelling ? t('Common.Cancelling') : t('Common.Cancel')}
              </span>
            </Button>
          ) : (
            <Button appearance="primary" size="small" onClick={downloadModel}>
              {t('Common.Download')}
            </Button>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={delConfirmDialogOpen}
        setOpen={setDelConfirmDialogOpen}
        message={t('Settings.Embeddings.Confirmation.DeleteModel')}
        onConfirm={() => {
          removeModel();
          notifySuccess(t('Settings.Embeddings.Notification.ModelDeleted'));
        }}
      />
    </div>
  );
}
