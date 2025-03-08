import {
  Accordion,
  AccordionToggleEventHandler,
} from '@fluentui/react-components';
import { IChat } from 'intellichat/types';
import { useCallback, useMemo, useState } from 'react';
import useChatStore from 'stores/useChatStore';
import ChatFolder from './ChatFolder';

export default function ChatFolders({
  chats,
  collapsed,
}: {
  chats: IChat[];
  collapsed: boolean;
}) {
  const chat = useChatStore((state) => state.chat);
  const folders = useChatStore((state) => state.folders);
  const { selectFolder } = useChatStore();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const chatsGroupByFolder = useMemo(() => {
    const groups = chats.reduce(
      (acc, chat) => {
        const folderId = chat.folderId as string;
        if (!acc[folderId]) {
          acc[folderId] = [];
        }
        acc[folderId].push(chat);
        return acc;
      },
      {} as Record<string, IChat[]>,
    );
    return groups;
  }, [chats]);

  const handleToggle = useCallback<AccordionToggleEventHandler>(
    (_, data) => {
      if (data.openItems.includes(data.value)) {
        selectFolder(data.value as string);
      } else if (chat?.folderId && data.openItems.includes(chat?.folderId)) {
        selectFolder(chat?.folderId);
      }
      setOpenItems(data.openItems as string[]);
    },
    [chat.id],
  );

  return (
    <Accordion multiple collapsible onToggle={handleToggle}>
      {Object.keys(folders).map((folderId) => {
        const folder = folders[folderId];
        const chatsInFolder = chatsGroupByFolder[folderId];
        return (
          <ChatFolder
            key={folderId}
            chats={chatsInFolder || []}
            collapsed={collapsed}
            folder={folder}
            openItems={openItems}
          />
        );
      })}
    </Accordion>
  );
}
