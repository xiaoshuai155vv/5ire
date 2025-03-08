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
  const folders = useChatStore((state) => state.folders);

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

  const handleToggle = useCallback<AccordionToggleEventHandler>((_, data) => {
    setOpenItems(data.openItems as string[]);
  }, []);

  return (
    <Accordion multiple collapsible onToggle={handleToggle}>
      {Object.keys(chatsGroupByFolder).map((folderId) => {
        const folder = folders[folderId];
        const chatsInFolder = chatsGroupByFolder[folderId];
        return (
          <ChatFolder
            key={folderId}
            chats={chatsInFolder}
            collapsed={collapsed}
            folder={folder}
            openItems={openItems}
          />
        );
      })}
    </Accordion>
  );
}
