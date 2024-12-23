import { useEffect } from 'react';
import useNav from 'hooks/useNav';
import { Button, Tooltip } from '@fluentui/react-components';
import { Chat20Regular, Chat20Filled } from '@fluentui/react-icons';
import useChatStore from 'stores/useChatStore';
import { IChat } from 'intellichat/types';

export default function ChatNav({ collapsed }: { collapsed: boolean }) {
  const chats = useChatStore((state) => state.chats);
  const currentChat = useChatStore((state) => state.chat);
  const fetchChat = useChatStore((state: any) => state.fetchChat);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  const navigate = useNav();

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
