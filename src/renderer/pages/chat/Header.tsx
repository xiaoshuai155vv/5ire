import { useEffect, useMemo, useState } from 'react';
import { Button, Tooltip } from '@fluentui/react-components';
import Mousetrap from 'mousetrap';
import {
  MoreHorizontal24Regular,
  MoreHorizontal24Filled,
  FilterDismiss24Regular,
  PanelRight24Regular,
  PanelRight24Filled,
  Delete24Regular,
  Delete24Filled,
  bundleIcon,
} from '@fluentui/react-icons';
import useAppearanceStore from 'stores/useAppearanceStore';
import useChatStore from 'stores/useChatStore';
import { useTranslation } from 'react-i18next';
import useChatContext from 'hooks/useChatContext';
import ConfirmDialog from 'renderer/components/ConfirmDialog';

import { tempChatId } from 'consts';
import useNav from 'hooks/useNav';
import useToast from 'hooks/useToast';
import { IChatFolder } from 'intellichat/types';
import { isPersistedChat } from 'utils/util';
import ChatSettingsDrawer from './ChatSettingsDrawer';

const DeleteIcon = bundleIcon(Delete24Filled, Delete24Regular);
const MoreHorizontalIcon = bundleIcon(
  MoreHorizontal24Filled,
  MoreHorizontal24Regular,
);
const PanelRightShowIcon = bundleIcon(PanelRight24Filled, PanelRight24Regular);
const PanelRightHideIcon = bundleIcon(PanelRight24Regular, PanelRight24Filled);

export default function Header() {
  const { t } = useTranslation();
  const { notifySuccess } = useToast();
  const navigate = useNav();
  const folder = useChatStore((state) => state.folder);
  const folders = useChatStore((state) => state.folders);
  const activeChat = useChatStore((state) => state.chat);
  const collapsed = useAppearanceStore((state) => state.sidebar.collapsed);
  const chatSidebarHidden = useAppearanceStore(
    (state) => state.chatSidebar.show,
  );
  const toggleChatSidebarVisibility = useAppearanceStore(
    (state) => state.toggleChatSidebarVisibility,
  );
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const chatFolder: Partial<IChatFolder> = useMemo(() => {
    if (activeChat.id !== tempChatId) {
      if (activeChat.folderId) {
        return folders[activeChat.folderId] || {};
      }
      return {};
    }
    return folder || {};
  }, [folder, activeChat.id, activeChat.folderId, folders]);

  const [delConfirmDialogOpen, setDelConfirmDialogOpen] =
    useState<boolean>(false);
  const deleteChat = useChatStore((state) => state.deleteChat);

  const onDeleteChat = async () => {
    await deleteChat();
    navigate(`/chats/${tempChatId}`);
    notifySuccess(t('Chat.Notification.Deleted'));
  };

  const getKeyword = useChatStore((state) => state.getKeyword);
  const setKeyword = useChatStore((state) => state.setKeyword);

  const keyword = isPersistedChat(activeChat)
    ? getKeyword(activeChat?.id)
    : null;

  useEffect(() => {
    Mousetrap.bind('mod+d', () => {
      if (activeChat?.id !== tempChatId) {
        setDelConfirmDialogOpen(true);
      }
    });
    Mousetrap.bind('mod+shift+r', toggleChatSidebarVisibility);
    return () => {
      Mousetrap.unbind('mod+d');
    };
  }, [activeChat?.id]);

  return (
    <div
      className={`chat-header absolute p-2.5 -mx-2.5 flex justify-between items-center ${
        collapsed
          ? 'left-[12rem] md:left-[5rem]'
          : 'left-[12rem] md:left-0 lg:left-0'
      }`}
    >
      <div className="flex-grow text-sm text-gray-300 dark:text-gray-600">
        {chatFolder.name}
      </div>
      <div className="flex justify-end items-center gap-1">
        {activeChat?.id && activeChat.id !== tempChatId ? (
          <>
            <Button
              icon={<DeleteIcon className="text-color-tertiary" />}
              appearance="transparent"
              title="Mod+d"
              onClick={() => setDelConfirmDialogOpen(true)}
            />
            {keyword ? (
              <Tooltip content={t('Common.ClearFilter')} relationship="label">
                <Button
                  icon={<FilterDismiss24Regular />}
                  appearance="subtle"
                  onClick={() => setKeyword(activeChat?.id, '')}
                />
              </Tooltip>
            ) : null}
          </>
        ) : null}
        <div className="hidden sm:block">
          <Button
            icon={
              chatSidebarHidden ? (
                <PanelRightHideIcon className="text-color-tertiary" />
              ) : (
                <PanelRightShowIcon className="text-color-tertiary" />
              )
            }
            appearance="transparent"
            title="Mod+shift+r"
            onClick={toggleChatSidebarVisibility}
          />
        </div>
        <Button
          icon={<MoreHorizontalIcon className="text-color-tertiary" />}
          appearance="subtle"
          onClick={() => setDrawerOpen(true)}
        />
      </div>
      <ChatSettingsDrawer open={drawerOpen} setOpen={setDrawerOpen} />
      <ConfirmDialog
        open={delConfirmDialogOpen}
        setOpen={setDelConfirmDialogOpen}
        title={t('Chat.DeleteConfirmation')}
        message={t('Chat.DeleteConfirmationInfo')}
        onConfirm={onDeleteChat}
      />
    </div>
  );
}
