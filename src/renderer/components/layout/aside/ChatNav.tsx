import { useEffect } from 'react';
import useNav from 'hooks/useNav';
import { Button, Tooltip } from '@fluentui/react-components';
import { Chat20Regular, Chat20Filled } from '@fluentui/react-icons';
import useChatStore from 'stores/useChatStore';
import { IChat } from 'intellichat/types';
import Mousetrap from 'mousetrap';
import { findIndex } from 'lodash';

export default function ChatNav({ collapsed }: { collapsed: boolean }) {
  const chats = useChatStore((state) => state.chats);
  const currentChat = useChatStore((state) => state.chat);
  const fetchChat = useChatStore((state: any) => state.fetchChat);
  const navigate = useNav();

  useEffect(() => {
    Mousetrap.bind('mod+up', () => {
      let index = 0;
      if (chats.length) {
        if (currentChat) {
          const curIdx = findIndex(
            chats,
            (item: IChat) => item.id === currentChat.id
          );
          index = Math.max(curIdx - 1, 0);
        }
        navigate(`/chats/${chats[index].id}`);
      }
    });
    Mousetrap.bind('mod+down', () => {
      let index = 0;
      if (chats.length) {
        if (currentChat) {
          const curIdx = findIndex(
            chats,
            (item: IChat) => item.id === currentChat.id
          );
          index = Math.min(curIdx + 1, chats.length - 1);
        }
        navigate(`/chats/${chats[index].id}`);
      }
    });
    fetchChat();
    return () => {
      Mousetrap.unbind('mod+up');
      Mousetrap.unbind('mod+down');
    };
  }, [fetchChat,chats.length, currentChat?.id]);

  const renderIconWithTooltip = (isActiveChat: boolean, summary: string) => {
    return (
      <Tooltip
        withArrow
        content={summary.substring(0, 200)}
        relationship="label"
        positioning="above-start"
      >
        {isActiveChat ? <Chat20Filled /> : <Chat20Regular />}
      </Tooltip>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-brand-sidebar">
      <div
        className={`flex flex-col pt-2.5 ${collapsed ? 'content-center' : ''}`}
      >
        {chats.map((chat: IChat) => {
          return (
            <div
              className={`px-2 ${collapsed ? 'mx-auto' : ''} ${
                currentChat && currentChat.id === chat.id ? 'active' : ''
              }`}
              key={chat.id}
            >
              <Button
                icon={renderIconWithTooltip(
                  currentChat && currentChat.id === chat.id,
                  chat.summary
                )}
                appearance="subtle"
                className="w-full justify-start latin"
                onClick={() => navigate(`/chats/${chat.id}`)}
              >
                {collapsed ? null : (
                  <div className="text-sm truncate ...">
                    {chat.summary.substring(0, 40)}
                  </div>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
