import { useEffect } from 'react';
import useNav from 'hooks/useNav';
import { Button, Tooltip } from '@fluentui/react-components';
import { Chat20Regular, Chat20Filled } from '@fluentui/react-icons';
import useChatStore from 'stores/useChatStore';
import { IChat } from 'intellichat/types';
import Mousetrap from 'mousetrap';
import { findIndex } from 'lodash';
import ChatIcon from 'renderer/components/ChatIcon';
import ChatFolders from 'renderer/components/ChatFolders';

export default function ChatNav({ collapsed }: { collapsed: boolean }) {
  const chats = useChatStore((state) => state.chats);
  const currentChat = useChatStore((state) => state.chat);
  const fetchFolder = useChatStore((state) => state.fetchFolder);
  const fetchChat = useChatStore((state: any) => state.fetchChat);
  const navigate = useNav();

  const chatsWithFolder = chats.filter((chat: IChat) => chat.folderId);
  const chatsWithoutFolder = chats.filter((chat: IChat) => !chat.folderId);

  useEffect(() => {
    Mousetrap.bind('mod+shift+up', () => {
      let index = 0;
      if (chats.length) {
        if (currentChat) {
          const curIdx = findIndex(
            chats,
            (item: IChat) => item.id === currentChat.id,
          );
          index = Math.max(curIdx - 1, 0);
        }
        navigate(`/chats/${chats[index].id}`);
      }
    });
    Mousetrap.bind('mod+shift+down', () => {
      let index = 0;
      if (chats.length) {
        if (currentChat) {
          const curIdx = findIndex(
            chats,
            (item: IChat) => item.id === currentChat.id,
          );
          index = Math.min(curIdx + 1, chats.length - 1);
        }
        navigate(`/chats/${chats[index].id}`);
      }
    });
    Promise.all([fetchFolder(), fetchChat()]);
    return () => {
      Mousetrap.unbind('mod+up');
      Mousetrap.unbind('mod+down');
    };
  }, [fetchChat, chats.length, currentChat?.id]);

  return (
    <div className="h-full overflow-y-auto bg-brand-sidebar">
      <div
        className={`flex flex-col pt-2 ${collapsed ? 'content-center' : ''}`}
      >
        <ChatFolders chats={chatsWithFolder} collapsed={collapsed} />
        {chatsWithoutFolder.map((chat: IChat) => {
          return (
            <div
              className={`px-0.5 ${collapsed ? 'mx-auto' : ''} ${
                currentChat && currentChat.id === chat.id ? 'active' : ''
              }`}
              key={chat.id}
            >
              <Button
                icon={
                  <ChatIcon
                    chat={chat}
                    isActive={currentChat && currentChat.id === chat.id}
                  />
                }
                appearance="subtle"
                className="w-full justify-start latin"
                onClick={() => navigate(`/chats/${chat.id}`)}
              >
                {collapsed ? null : (
                  <div className="text-sm truncate ...">
                    {chat.summary?.substring(0, 40)}
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
