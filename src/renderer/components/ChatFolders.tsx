import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Button,
  AccordionToggleEventHandler,
} from '@fluentui/react-components';
import { FolderOpenFilled, FolderRegular } from '@fluentui/react-icons';
import { IChat } from 'intellichat/types';
import { useCallback, useMemo, useState } from 'react';
import useChatStore from 'stores/useChatStore';
import ChatIcon from './ChatIcon';
import useNav from 'hooks/useNav';

export default function ChatFolders({
  chats,
  collapsed,
}: {
  chats: IChat[];
  collapsed: boolean;
}) {
  const folders = useChatStore((state) => state.folders);
  const curChat = useChatStore((state) => state.chat);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const navigate = useNav();
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
    <Accordion multiple collapsible className="mb-2" onToggle={handleToggle}>
      {Object.keys(chatsGroupByFolder).map((folderId) => {
        const folder = folders[folderId];
        const chatsInFolder = chatsGroupByFolder[folderId];
        return (
          <AccordionItem key={folderId} value={folderId}>
            <AccordionHeader
              style={{ height: 30 }}
              className="px-1"
              expandIcon={
                openItems.includes(folderId) ? (
                  <FolderOpenFilled />
                ) : (
                  <FolderRegular />
                )
              }
            >
              {folder.name}
            </AccordionHeader>
            <AccordionPanel>
              <div
                className="border-l border-base ml-3 pt-2"
                style={{ paddingLeft: 7 }}
              >
                {chatsInFolder.map((chat) => (
                  <div key={chat.id}>
                    <Button
                      icon={
                        <ChatIcon
                          chat={chat}
                          isActive={curChat && curChat.id === chat.id}
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
                ))}
              </div>
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
