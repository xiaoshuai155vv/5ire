import { useEffect } from 'react';
import useNav from 'hooks/useNav';
import useChatStore from 'stores/useChatStore';
import { IChat } from 'intellichat/types';
import Mousetrap from 'mousetrap';
import { findIndex } from 'lodash';
import { DndContext } from '@dnd-kit/core';
import ChatFolders from 'renderer/components/ChatFolders';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import ChatItem from 'renderer/components/ChatItem';

export default function ChatNav({ collapsed }: { collapsed: boolean }) {
  const chats = useChatStore((state) => state.chats);
  const curChat = useChatStore((state) => state.chat);
  const { updateChat, fetchFolder, fetchChat } = useChatStore();
  const navigate = useNav();

  const chatsWithFolder = chats.filter((chat: IChat) => chat.folderId);
  const chatsWithoutFolder = chats.filter((chat: IChat) => !chat.folderId);

  useEffect(() => {
    Mousetrap.bind('mod+shift+up', () => {
      let index = 0;
      if (chats.length) {
        if (curChat) {
          const curIdx = findIndex(
            chats,
            (item: IChat) => item.id === curChat.id,
          );
          index = Math.max(curIdx - 1, 0);
        }
        navigate(`/chats/${chats[index].id}`);
      }
    });
    Mousetrap.bind('mod+shift+down', () => {
      let index = 0;
      if (chats.length) {
        if (curChat) {
          const curIdx = findIndex(
            chats,
            (item: IChat) => item.id === curChat.id,
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
  }, [fetchChat, chats.length, curChat?.id]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over) {
      updateChat({ id: active.id, folderId: over.id });
    } else {
      updateChat({ id: active.id, folderId: null });
    }
    navigate(`/chats/${active.id}`);
  };

  return (
    <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
      <div className="h-full overflow-y-auto overflow-x-hidden bg-brand-sidebar chat-nav">
        <div
          className={`flex flex-col pt-2 ${collapsed ? 'content-center' : ''}`}
        >
          <div className={`mb-1 ${collapsed ? 'mx-auto' : ''}`}>
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
    </DndContext>
  );
}
