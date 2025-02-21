/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable react/no-danger */
import Debug from 'debug';
import useChatStore from 'stores/useChatStore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import {
  ChevronDown16Regular,
  ChevronUp16Regular,
} from '@fluentui/react-icons';

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

  useEffect(() => {
    registerCitationClick();
    return () => {
      const links = document.querySelectorAll(`#${message.id} .msg-reply a`);
      links.forEach((link) => {
        link.removeEventListener('click', onCitationClick);
      });
    };
  }, [message.isActive, keywords, registerCitationClick]);

  const thoughts = useMemo(() => {
    const parts = message.reply.split('<think>');

    // 如果没有 <think> 标签，返回空数组
    if (parts.length <= 1) {
      return '';
    }

    // 处理有 <think> 标签的情况
    const thinkParts = parts
      .slice(1) // 从第一个部分开始处理
      .map((part) => {
        const [content] = part.split('</think>');
        return content; // 返回每个部分的内容
      })
      .filter(Boolean); // 过滤掉空字符串

    return thinkParts.join(''); // 返回所有的 thoughts
  }, [message.reply]);

  const reply = useMemo(() => {
    const parts = message.reply.split('<think>');

    // 如果没有 <think> 标签，返回整个内容
    if (parts.length === 1) {
      return message.reply; // 返回整个内容
    }

    // 处理有 <think> 标签的情况
    const replyParts = parts
      .map((part) => part.split('</think>')[1]) // 获取结束标签后的内容
      .filter(Boolean); // 过滤掉空字符串

    return replyParts.join(''); // 将所有非空部分连接起来
  }, [message.reply]);

  const [isThinking, setIsThinking] = useState(true);
  const [thinkSeconds, setThinkSeconds] = useState(0);
  const [isThinkShow, setIsThinkShow] = useState(false);
  const messageRef = useRef(message);
  const isThinkingRef = useRef(isThinking);
  const thinkInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    isThinkingRef.current = isThinking;
  }, [isThinking]);

  function monitorThinkStatus() {
    // 清除之前的计时器
    if (thinkInterval.current) {
      clearInterval(thinkInterval.current);
    }

    thinkInterval.current = setInterval(() => {
      const { reply } = messageRef.current;

      if (
        reply.includes('<think>') &&
        !isThinkingRef.current &&
        messageRef.current.isActive
      ) {
        setIsThinking(true);
        setThinkSeconds(0); // 重置计时
        console.log('Think started');
      }

      if (isThinkingRef.current && messageRef.current.isActive) {
        setThinkSeconds((prev) => prev + 1); // 每秒增加
      }

      if (
        (reply.includes('</think>') && isThinkingRef.current) ||
        !messageRef.current.isActive
      ) {
        clearInterval(thinkInterval.current as NodeJS.Timeout); // 停止计时
        setIsThinking(false);
        console.log('Think ended');
        console.log(`Total thinking time: ${thinkSeconds} seconds`);
      }
    }, 1000);
  }

  useEffect(() => {
    if (message.isActive) {
      setIsThinkShow(true);
      monitorThinkStatus();
    } else {
      setIsThinking(false);
    }
    return () => {
      clearInterval(thinkInterval.current as NodeJS.Timeout);
    };
  }, [message.isActive]);



  const toggleThink = useCallback(() => {
    setIsThinkShow(!isThinkShow);
  }, [isThinkShow]);

  const replyNode = useCallback(() => {
    const isLoading = message.isActive && states.loading;
    const isEmpty = !message.reply || message.reply === '';
    const thinkTitle =
      (isThinking ? t('Reasoning.Thinking') : t('Reasoning.Thought')) +
      `${thinkSeconds > 0 ? ` ${thinkSeconds}s` : ''}`;
    return (
      <div className={`w-full mt-1.5 ${isLoading ? 'is-loading' : ''}`}>
        {message.isActive && states.runningTool ? (
          <div className="flex flex-row justify-start items-center gap-1">
            <ToolSpinner size={20} style={{ marginBottom: '-3px' }} />
            <span>{states.runningTool}</span>
          </div>
        ) : null}
        {isLoading && isEmpty ? (
          <>
            <span className="skeleton-box" style={{ width: '80%' }} />
            <span className="skeleton-box" style={{ width: '90%' }} />
          </>
        ) : (
          <div className="-mt-1">
            {thoughts.trim() ? (
              <div className="think">
                <div className="think-header" onClick={toggleThink}>
                  <span className="font-bold text-gray-400 ">{thinkTitle}</span>
                  <div className="text-gray-400 -mb-0.5">
                    {isThinkShow ? (
                      <ChevronUp16Regular />
                    ) : (
                      <ChevronDown16Regular />
                    )}
                  </div>
                </div>
                <div
                  className="think-body"
                  style={{ display: isThinkShow ? 'block' : 'none' }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: render(
                        `${
                          highlight(thoughts, keyword) || ''
                        }${isThinking && thoughts ? '<span class="blinking-cursor" /></span>' : ''}`,
                      ),
                    }}
                  />
                </div>
              </div>
            ) : null}
            <div
              className={`mt-1 break-all ${
                fontSize === 'large' ? 'font-lg' : ''
              }`}
              dangerouslySetInnerHTML={{
                __html: render(
                  `${
                    highlight(reply, keyword) || ''
                  }${isLoading && reply ? '<span class="blinking-cursor" /></span>' : ''}`,
                ),
              }}
            />
          </div>
        )}
      </div>
    );
  }, [
    message.reply,
    keyword,
    states,
    fontSize,
    isThinking,
    thinkSeconds,
    isThinkShow,
  ]);

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
