import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Button,
} from '@fluentui/react-components';
import { FolderRegular } from '@fluentui/react-icons';
import { IChat } from 'intellichat/types';
import { useMemo } from 'react';
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
  const curChat = useChatStore((state) => state.chat);
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

  return (
    <Accordion multiple collapsible className="mb-2">
      {Object.keys(chatsGroupByFolder).map((folderId) => {
        const chatsInFolder = chatsGroupByFolder[folderId];
        return (
          <AccordionItem key={folderId} value={folderId}>
            <AccordionHeader
              style={{ height: 30 }}
              className="px-1"
              expandIcon={<FolderRegular />}
            >
              {folderId}
            </AccordionHeader>
            <AccordionPanel>
              <div
                className="border-l border-base ml-3 pt-1"
                style={{ paddingLeft: 17 }}
              >
                {chatsInFolder.map((chat) => (
                  <div key={chat.id} className="py-1">
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
