import { useEffect, useMemo, useState } from 'react';
import useNav from 'hooks/useNav';
import useChatStore from 'stores/useChatStore';
import { IChat } from 'intellichat/types';
import Mousetrap from 'mousetrap';
import { findIndex, set, uniq } from 'lodash';
import { DndContext } from '@dnd-kit/core';
import ChatFolders from 'renderer/components/ChatFolders';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import ChatItem from 'renderer/components/ChatItem';
import { Skeleton, SkeletonItem } from '@fluentui/react-components';

export default function ChatNav({ collapsed }: { collapsed: boolean }) {
  const [loading, setLoading] = useState(true);
  const chats = useChatStore((state) => state.chats);
  const curChat = useChatStore((state) => state.chat);
  const openFolders = useChatStore((state) => state.openFolders);
  const { updateChat, fetchFolder, selectFolder, fetchChat, setOpenFolders } =
    useChatStore();
  const navigate = useNav();

  const chatsWithFolder = useMemo(
    () => chats.filter((chat: IChat) => chat.folderId),
    [chats],
  );
  const chatsWithoutFolder = useMemo(
    () => chats.filter((chat: IChat) => !chat.folderId),
    [chats],
  );

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchFolder(), fetchChat()]);
    setLoading(false);
  };

  useEffect(() => {
    Mousetrap.bind('mod+shift+up', () => {
      let index = 0;
      if (chatsWithoutFolder.length) {
        if (curChat) {
          const curIdx = findIndex(
            chatsWithoutFolder,
            (item: IChat) => item.id === curChat.id,
          );
          index = Math.max(curIdx - 1, 0);
        }
        navigate(`/chats/${chatsWithoutFolder[index].id}`);
      }
    });
    Mousetrap.bind('mod+shift+down', () => {
      let index = 0;
      if (chatsWithoutFolder.length) {
        if (curChat) {
          const curIdx = findIndex(
            chatsWithoutFolder,
            (item: IChat) => item.id === curChat.id,
          );
          index = Math.min(curIdx + 1, chats.length - 1);
        }
        navigate(`/chats/${chatsWithoutFolder[index].id}`);
      }
    });
    return () => {
      Mousetrap.unbind('mod+up');
      Mousetrap.unbind('mod+down');
    };
  }, [chats.length, curChat?.id]);

  useEffect(() => {
    loadData();
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    navigate(`/chats/${active.id}`);
    setTimeout(() => {
      selectFolder(active.data.current.folderId || null);
      if (active.data.current.folderId !== (over?.id || null)) {
        updateChat({ id: active.id, folderId: over?.id || null });
        selectFolder(over?.id || null);
        if (over?.id) {
          setOpenFolders(uniq([...openFolders, over?.id]));
        }
      }
    }, 0);
  };
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-brand-sidebar chat-nav">
      {loading ? (
        <Skeleton
          aria-label="Loading chats"
          appearance="translucent"
          className="flex flex-col gap-2 pt-3 mx-2"
        >
          <SkeletonItem size={20} />
          <SkeletonItem size={20} style={{ width: 200 }} />
          <SkeletonItem size={20} style={{ width: 120 }} />
          <SkeletonItem size={20} style={{ width: 220 }} />
          <SkeletonItem size={20} style={{ width: 200 }} />
          <SkeletonItem size={20} style={{ width: 200 }} />
        </Skeleton>
      ) : (
        <DndContext
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <div
            className={`flex flex-col pt-2 ${collapsed ? 'content-center' : ''}`}
          >
            <div className={`mb-1 ${collapsed ? 'mx-auto' : ''}`}>
              <ChatFolders chats={chatsWithFolder} collapsed={collapsed} />
            </div>
            {chatsWithoutFolder.map((chat: IChat) => {
              return (
                <div
                  className={collapsed ? ' mx-auto' : 'px-0.5'}
                  key={chat.id}
                >
                  <ChatItem key={chat.id} chat={chat} collapsed={collapsed} />
                </div>
              );
            })}
          </div>
        </DndContext>
      )}
    </div>
  );
}
