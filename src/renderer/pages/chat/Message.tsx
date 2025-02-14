/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable react/no-danger */
import Debug from 'debug';
import useChatStore from 'stores/useChatStore';
import { useCallback, useEffect, useMemo } from 'react';
import useMarkdown from 'hooks/useMarkdown';
import { IChatMessage } from 'intellichat/types';
import { useTranslation } from 'react-i18next';
import { Divider } from '@fluentui/react-components';
import useKnowledgeStore from 'stores/useKnowledgeStore';
import useToast from 'hooks/useToast';
import ToolSpinner from 'renderer/components/ToolSpinner';
import useSettingsStore from 'stores/useSettingsStore';
import { highlight } from '../../../utils/util';
import MessageToolbar from './MessageToolbar';

const debug = Debug('5ire:pages:chat:Message');

export default function Message({ message }: { message: IChatMessage }) {
  const { t } = useTranslation();
  const { notifyInfo } = useToast();
  const fontSize = useSettingsStore((state) => state.fontSize);
  const keywords = useChatStore((state: any) => state.keywords);
  const states = useChatStore().getCurState();
  const { showCitation } = useKnowledgeStore();
  const keyword = useMemo(
    () => keywords[message.chatId],
    [keywords, message.chatId],
  );
  const citedFiles = useMemo(
    () => JSON.parse(message.citedFiles || '[]'),
    [message.citedFiles],
  );

  const citedChunks = useMemo(() => {
    return JSON.parse(message.citedChunks || '[]');
  }, [message.citedChunks]);

  const { render } = useMarkdown();

  const onCitationClick = useCallback(
    (event: any) => {
      const url = new URL(event.target?.href);
      if (url.pathname === '/citation' || url.protocol.startsWith('file:')) {
        event.preventDefault();
        const chunkId = url.hash.replace('#', '');
        const chunk = citedChunks.find((i: any) => i.id === chunkId);
        if (chunk) {
          showCitation(chunk.content);
        } else {
          notifyInfo(t('Knowledge.Notification.CitationNotFound'));
        }
      }
    },
    [citedChunks, showCitation],
  );

  const registerCitationClick = useCallback(() => {
    const links = document.querySelectorAll(`#${message.id} .msg-reply a`);
    links.forEach((link) => {
      link.addEventListener('click', onCitationClick);
    });
  }, [onCitationClick]);

  const toggleThink = useCallback((evt: React.MouseEvent) => {
    const target = evt.currentTarget as HTMLElement;
    const parent = target?.parentNode as HTMLElement; // div.think
    if (parent) {
      const body = parent.querySelector('div.think-body');
      const iconShow = parent.querySelector('.icon-show');
      const iconHide = parent.querySelector('.icon-hide');
      if (body?.classList.contains('hidden')) {
        parent.classList.remove('collapsed');
        body.classList.remove('hidden');
        iconShow?.classList.add('hidden');
        iconHide?.classList.remove('hidden');
      } else {
        parent.classList.add('collapsed');
        body?.classList.add('hidden');
        iconShow?.classList.remove('hidden');
        iconHide?.classList.add('hidden');
      }
    }
  }, []);


  const registerThinkToggle = useCallback(() => {
    const headers = document.querySelectorAll(`#${message.id} .think-header`);
    headers.forEach((header: any) => {
      header?.addEventListener('click', toggleThink);
    });
  }, [toggleThink]);



  useEffect(() => {
    registerCitationClick();
    registerThinkToggle();
    return () => {
      const links = document.querySelectorAll(`#${message.id} .msg-reply a`);
      links.forEach((link) => {
        link.removeEventListener('click', onCitationClick);
      });
      const headers = document.querySelectorAll(`#${message.id} .think-header`);
      headers.forEach((header: any) => {
        header?.removeEventListener('click', toggleThink);
      });
    };
  }, [
    message.isActive,
    registerCitationClick,
    registerThinkToggle,
  ]);

  const replyNode = useCallback(() => {
    if (message.isActive && states.loading) {
      if (!message.reply || message.reply === '') {
        return (
          <div className="w-full mt-1.5 is-loading">
            {states.runningTool && (
              <div className="flex flex-row justify-start items-center gap-1">
                <ToolSpinner size={20} style={{ marginBottom: '-3px' }} />
                <span>{states.runningTool}</span>
              </div>
            )}
            <span className="skeleton-box" style={{ width: '80%' }} />
            <span className="skeleton-box" style={{ width: '90%' }} />
          </div>
        );
      }
      return (
        <div
          className={`mt-1 break-all is-loading ${
            fontSize === 'large' ? 'font-lg' : ''
          }`}
          dangerouslySetInnerHTML={{
            __html: render(
              `${
                highlight(message.reply, keyword) || ''
              }<span class="blinking-cursor" /></span>`,
            ),
          }}
        />
      );
    }
    return (
      <div
        className={`mt-1 break-all ${fontSize === 'large' ? 'font-lg' : ''}`}
        dangerouslySetInnerHTML={{
          __html: render(`${highlight(message.reply, keyword)}` || ''),
        }}
      />
    );
  }, [message, keyword, states, fontSize]);
  return (
    <div className="leading-6 message" id={message.id}>
      <div>
        <a
          id={`prompt-${message.id}`}
          aria-label={`prompt of message ${message.id}`}
        />

        <div
          className="msg-prompt my-2 flex flex-start"
          style={{ minHeight: '40px' }}
        >
          <div className="avatar flex-shrink-0 mr-2" />
          <div
            className={`mt-1 break-all ${
              fontSize === 'large' ? 'font-lg' : ''
            }`}
            dangerouslySetInnerHTML={{
              __html: render(highlight(message.prompt, keyword) || ''),
            }}
          />
        </div>
      </div>
      <div>
        <a id={`#reply-${message.id}`} aria-label={`Reply ${message.id}`} />
        <div
          className="msg-reply mt-2 flex flex-start"
          style={{ minHeight: '40px' }}
        >
          <div className="avatar flex-shrink-0 mr-2" />
          {replyNode()}
        </div>
        {citedFiles.length > 0 && (
          <div className="message-cited-files mt-2">
            <div className="mt-4 mb-2">
              <Divider>{t('Common.References')}</Divider>
            </div>
            <ul>
              {citedFiles.map((file: string) => (
                <li className="text-gray-500" key={file}>
                  {file}
                </li>
              ))}
            </ul>
          </div>
        )}
        <MessageToolbar message={message} />
      </div>
    </div>
  );
}
