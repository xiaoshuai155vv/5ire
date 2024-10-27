import {
  useToastController,
  Toast,
  ToastTitle,
  ToastBody,
  ToastIntent,
} from '@fluentui/react-components';

export default function useToast() {
  const { dispatchToast } = useToastController('toaster');
  const $notify = ({
    title,
    message,
    intent,
  }: {
    title: string;
    message: string;
    intent: ToastIntent;
  }) => {
    dispatchToast(
      <Toast>
        <ToastTitle>
          <strong>{title}</strong>
        </ToastTitle>
        <ToastBody>
          <div style={{ width: '95%' }} className="toast-content">{message}</div>
        </ToastBody>
      </Toast>,
      { intent, pauseOnHover: true, position: 'top-end' }
    );
  };
  const notifyError = (message: string) =>
    $notify({ title: 'Error', message, intent: 'error' });
  const notifyWarning = (message: string) =>
    $notify({ title: 'Warning', message, intent: 'warning' });
  const notifyInfo = (message: string) =>
    $notify({ title: 'Info', message, intent: 'info' });
  const notifySuccess = (message: string) =>
    $notify({ title: 'Success', message, intent: 'success' });
  return { notifyError, notifyWarning, notifyInfo, notifySuccess };
}
