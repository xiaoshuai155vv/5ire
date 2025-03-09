import {
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import {
  bundleIcon,
  FolderOpenFilled,
  FolderOpenRegular,
  FolderRegular,
  MoreVerticalFilled,
  MoreVerticalRegular,
} from '@fluentui/react-icons';
import { IChat, IChatFolder } from 'intellichat/types';
import { useDroppable } from '@dnd-kit/core';
import ChatItem from './ChatItem';
import useChatStore from 'stores/useChatStore';
import { t } from 'i18next';

const MoreVerticalIcon = bundleIcon(MoreVerticalFilled, MoreVerticalRegular);

export default function ChatFolder({
  folder,
  chats,
  collapsed,
  openItems,
}: {
  folder: IChatFolder;
  chats: IChat[];
  collapsed: boolean;
  openItems: string[];
}) {
  const { setNodeRef } = useDroppable({
    id: folder.id,
  });
  const selectedFolder = useChatStore((state) => state.folder);
  return (
    <div ref={setNodeRef}>
      <AccordionItem value={folder.id}>
        <div className="flex justify-between items-center">
          <AccordionHeader
            style={{ height: 28 }}
            className={collapsed ? 'collapsed' : 'px-1 flex-grow'}
            expandIcon={
              openItems.includes(folder.id) ? (
                folder.id === selectedFolder?.id ? (
                  <FolderOpenFilled />
                ) : (
                  <FolderOpenRegular />
                )
              ) : (
                <FolderRegular />
              )
            }
          >
            {collapsed ? '' : folder.name}
          </AccordionHeader>
          {!collapsed && (
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <MenuButton
                  icon={<MoreVerticalIcon />}
                  appearance="transparent"
                  size="small"
                />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem>{t('Common.Delete')}</MenuItem>
                  <MenuItem>{t('Common.Settings')}</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          )}
        </div>
        <AccordionPanel>
          {chats.length > 0 && (
            <div
              className={`pt-0.5 ${collapsed ? 'ml-0' : 'border-l border-base ml-3'}`}
              style={{ paddingLeft: collapsed ? 0 : 4 }}
            >
              {chats.map((chat) => (
                <ChatItem key={chat.id} chat={chat} collapsed={collapsed} />
              ))}
            </div>
          )}
        </AccordionPanel>
      </AccordionItem>
    </div>
  );
}
