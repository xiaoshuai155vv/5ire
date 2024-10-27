import * as Sentry from '@sentry/electron/renderer';
import { init as reactInit } from '@sentry/react';
import Debug from 'debug';
import FluentApp from './components/FluentApp';
import './App.scss';
import './fluentui.scss';
import useAuthStore from 'stores/useAuthStore';
import { useEffect } from 'react';
import useToast from 'hooks/useToast';
import { useTranslation } from 'react-i18next';
import useKnowledgeStore from 'stores/useKnowledgeStore';

if (process.env.NODE_ENV === 'development') {
  Debug.enable('5ire:*');
}

const debug = Debug('5ire:App');

Sentry.init(
  {
    dsn: 'https://fd227cb30ce44d3e9ca51bbb815b509c@o4505482377363456.ingest.sentry.io/4505482393157632',
  },
  reactInit
);

export default function App() {
  const loadAuthData = useAuthStore((state) => state.load);
  const setSession = useAuthStore((state) => state.setSession);
  const onAuthStateChange = useAuthStore((state) => state.onAuthStateChange);
  const { notifyError } = useToast();
  const { t } = useTranslation();
  const { createFile } = useKnowledgeStore();

  useEffect(() => {
    loadAuthData();
    const subscription = onAuthStateChange();

    window.electron.ipcRenderer.on('sign-in', async (authData: any) => {
      if (authData.accessToken && authData.refreshToken) {
        const { error } = await setSession(authData);
        if (error) {
          notifyError(error.message);
        }
      } else {
        debug('🚩 Invalid Auth Data:', authData);
        notifyError(t('Auth.Notification.LoginCallbackFailed'));
      }
    });

    /**
     * 当知识库导入任务完成时触发
     * 放這是为了避免组件卸载后无法接收到事件
     */
    window.electron.ipcRenderer.on(
      'knowledge-import-success',
      (data: unknown) => {
        const { collectionId, file, numOfChunks } = data as any;
        createFile({
          id: file.id,
          collectionId: collectionId,
          name: file.name,
          size: file.size,
          numOfChunks,
        });
      }
    );

    return () => {
      window.electron.ipcRenderer.unsubscribeAll('sign-in');
      window.electron.ipcRenderer.unsubscribeAll('knowledge-import-success');
      subscription.unsubscribe()
    };
  }, []);
  return <FluentApp />;
}
