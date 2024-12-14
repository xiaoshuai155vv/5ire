/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable react/no-danger */
// @ts-ignore
import useChatStore from 'stores/useChatStore';
import { useCallback, useEffect, useMemo } from 'react';
import useMarkdown from 'hooks/useMarkdown';
import MessageToolbar from './MessageToolbar';
import { highlight } from '../../../utils/util';
import { IChatMessage } from 'intellichat/types';
import { useTranslation } from 'react-i18next';
import { Divider } from '@fluentui/react-components';
import useKnowledgeStore from 'stores/useKnowledgeStore';
import useToast from 'hooks/useToast';
import Spinner from 'renderer/components/Spinner';
import ToolSpinner from 'renderer/components/ToolSpinner';

export default function Message({ message }: { message: IChatMessage }) {
  const { t } = useTranslation();
  const { notifyInfo } = useToast();
  const keywords = useChatStore((state: any) => state.keywords);
  const states = useChatStore().getCurState();
  const { showCitation } = useKnowledgeStore();
  const keyword = useMemo(
    () => keywords[message.chatId],
    [keywords, message.chatId]
  );
  const citedFiles = useMemo(
    () => JSON.parse(message.citedFiles || '[]'),
    [message.citedFiles]
  );
  const { render } = useMarkdown();
  const onCitationClick = async (event: any) => {
    const url = new URL(event.target?.href);
    if (url.pathname === '/citation' || url.protocol.startsWith('file:')) {
      event.preventDefault();
      const chunkId = url.hash.replace('#', '');
      const chunk = JSON.parse(message.citedChunks || '[]').find(
        (chunk: any) => chunk.id === chunkId
      );
      if (chunk) {
        showCitation(chunk.content);
      } else {
        notifyInfo(t('Knowledge.Notification.CitationNotFound'));
      }
    }
  };

  useEffect(() => {
    const links = document.querySelectorAll('.msg-reply a');
    links.forEach((link) => {
      link.addEventListener('click', onCitationClick);
    });
    return () => {
      links.forEach((link) => {
        link.removeEventListener('click', onCitationClick);
      });
    };
  }, []);

  const replyNode = useCallback(() => {
    if (message.isActive && states.loading) {
      if (!message.reply || message.reply === '') {
        return (
          <div className="w-full mt-1.5">
            {states.runningTool && (
              <div className="flex flex-row justify-start items-center gap-1">
                <ToolSpinner size={20} />
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
          className="mt-1"
          dangerouslySetInnerHTML={{
            __html: render(
              `${
                highlight(message.reply, keyword) || ''
              }<span class="blinking-cursor" /></span>`
            ),
          }}
        />
      );
    }
    return (
      <div className="mt-1">
        <div
          dangerouslySetInnerHTML={{
            __html: render(`${highlight(message.reply, keyword)}` || ''),
          }}
        />
      </div>
    );
  }, [message, keyword, states]);

  return (
    <div className="leading-6 message">
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
            className="mt-1 break-all"
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
