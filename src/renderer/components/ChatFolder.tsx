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
  Input,
} from '@fluentui/react-components';
import {
  bundleIcon,
  FolderFilled,
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
import { useEffect, useRef, useState } from 'react';
import Mousetrap from 'mousetrap';
import ConfirmDialog from './ConfirmDialog';
import FolderSettingsDialog from './FolderSettingsDialog';
import useNav from 'hooks/useNav';
import { tempChatId } from 'consts';

const MoreVerticalIcon = bundleIcon(MoreVerticalFilled, MoreVerticalRegular);

export default function ChatFolder({
  folder,
  chats,
  collapsed,
}: {
  folder: IChatFolder;
  chats: IChat[];
  collapsed: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: folder.id,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNav();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [name, setName] = useState(folder.name);
  const [editable, setEditable] = useState(false);
  const openFolders = useChatStore((state) => state.openFolders);
  const selectedFolder = useChatStore((state) => state.folder);
  const chat = useChatStore((state) => state.chat);
  const { updateFolder, deleteFolder, markFolderAsOld, selectFolder } =
    useChatStore();
  const [folderSettingsOpen, setFolderSettingsOpen] = useState(false);

  useEffect(() => {
    if (folder.isNew) {
      setEditable(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
    return () => {
      Mousetrap.unbind('esc');
      markFolderAsOld(folder.id);
    };
  }, [folder.isNew]);

  return (
    <div ref={setNodeRef}>
      <AccordionItem value={folder.id} disabled={editable}>
        <div className="flex justify-between items-center">
          <AccordionHeader
            style={{ height: 28 }}
            className={collapsed ? 'collapsed' : 'px-1 flex-grow'}
            onDoubleClick={(e: any) => {
              if (!collapsed) {
                setEditable(true);
                setTimeout(() => {
                  inputRef.current?.focus();
                }, 0);
                Mousetrap.bind('esc', () => {
                  setName(folder.name);
                  setEditable(false);
                });
              }
            }}
            expandIcon={
              openFolders.includes(folder.id) ? (
                folder.id === selectedFolder?.id ? (
                  <FolderOpenFilled />
                ) : (
                  <FolderOpenRegular />
                )
              ) : folder.id === selectedFolder?.id ? (
                <FolderFilled />
              ) : (
                <FolderRegular />
              )
            }
          >
            {editable ? (
              <Input
                ref={inputRef}
                value={name}
                appearance="underline"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditable(false);
                    const folderName = name.trim() || 'New Folder';
                    updateFolder({
                      id: folder.id,
                      name: folderName,
                    });
                    setName(folderName);
                    Mousetrap.unbind('esc');
                  }
                }}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                onBlur={() => {
                  setEditable(false);
                  Mousetrap.unbind('esc');
                }}
              />
            ) : collapsed ? (
              ''
            ) : (
              folder.name
            )}
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
                  <MenuItem onClick={() => setConfirmDialogOpen(true)}>
                    {t('Common.Delete')}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      selectFolder(folder.id);
                      setFolderSettingsOpen(true);
                    }}
                  >
                    {t('Common.Settings')}
                  </MenuItem>
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
      <ConfirmDialog
        title={`${t('Chat.Confirmation.DeleteFolder')} [${folder.name}]`}
        message={t('Chat.DeleteConfirmation.DeleteFolderInfo')}
        open={confirmDialogOpen}
        setOpen={setConfirmDialogOpen}
        onConfirm={async () => {
          await deleteFolder(folder.id);
          // If the current chat is in the folder being deleted, navigate to the temp chat
          if (chat.folderId === folder.id) {
            navigate(`/chats/${tempChatId}`);
          }
        }}
      />
      <FolderSettingsDialog
        open={folderSettingsOpen}
        setOpen={setFolderSettingsOpen}
      />
    </div>
  );
}
