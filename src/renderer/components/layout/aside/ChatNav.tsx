import { useEffect } from 'react';
import useNav from 'hooks/useNav';
import { Button } from '@fluentui/react-components';
import useChatStore from 'stores/useChatStore';
import { IChat } from 'intellichat/types';
import Mousetrap from 'mousetrap';
import { findIndex } from 'lodash';
import ChatIcon from 'renderer/components/ChatIcon';
import ChatFolders from 'renderer/components/ChatFolders';
import ChatItem from 'renderer/components/ChatItem';

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
        <div className={`-mt-2 mb-3 ${collapsed ? 'mx-auto' : ''}`}>
          <ChatFolders chats={chatsWithFolder} collapsed={collapsed} />
        </div>
        {chatsWithoutFolder.map((chat: IChat) => {
          return (
            <div className={collapsed ? ' mx-auto' : 'px-0.5'} key={chat.id}>
              <ChatItem key={chat.id} chat={chat} collapsed={collapsed} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
