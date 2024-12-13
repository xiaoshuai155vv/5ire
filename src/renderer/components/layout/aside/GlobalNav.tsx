import { Button } from '@fluentui/react-components';
import {
  Apps24Regular,
  Apps24Filled,
  ChatAdd24Regular,
  ChatAdd24Filled,
  BookmarkMultiple24Regular,
  BookmarkMultiple24Filled,
  EmojiSparkle24Regular,
  EmojiSparkle24Filled,
  Library24Regular,
  Library24Filled,
  bundleIcon,
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import useNav from 'hooks/useNav';
import { tempChatId } from 'consts';
import WorkspaceMenu from './WorkspaceMenu';

const AppsIcon = bundleIcon(Apps24Filled, Apps24Regular);
const BookmarkMultipleIcon = bundleIcon(
  BookmarkMultiple24Filled,
  BookmarkMultiple24Regular
);
const EmojiSparkleIcon = bundleIcon(
  EmojiSparkle24Filled,
  EmojiSparkle24Regular
);
const ChatAddIcon = bundleIcon(ChatAdd24Filled, ChatAdd24Regular);
const KnowledgeIcon = bundleIcon(Library24Filled, Library24Regular);

const IS_ASSISTANTS_ENABLED = false;

export default function GlobalNav({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation();
  const navigate = useNav();
  return (
    <div
      className={`relative ${
        collapsed ? 'text-center' : ''
      } border-b border-base py-2`}
    >
      <div className={`px-2 my-1 ${collapsed ? 'mx-auto' : ''}`}>
        <WorkspaceMenu collapsed={collapsed} />
      </div>
      {IS_ASSISTANTS_ENABLED && (
        <div className={`px-2  my-1 ${collapsed ? 'mx-auto' : ''}`}>
          <Button
            appearance="subtle"
            icon={<EmojiSparkleIcon />}
            className="w-full justify-start"
          >
            {collapsed ? null : t('Common.Assistants')}
          </Button>
        </div>
      )}
      {false && (
        <div className={`px-2  my-1 ${collapsed ? 'mx-auto' : ''}`}>
          <Button
            appearance="subtle"
            icon={<AppsIcon />}
            className="w-full justify-start"
            onClick={() => navigate('/apps')}
          >
            {collapsed ? null : t('Common.Apps')}
          </Button>
        </div>
      )}
      {false && (
        <div className={`px-2  my-1 ${collapsed ? 'mx-auto' : ''}`}>
          <Button
            appearance="subtle"
            icon={<KnowledgeIcon />}
            className="w-full justify-start"
            onClick={() => navigate('/knowledge')}
          >
            {collapsed ? null : t('Common.MCPServers')}
          </Button>
        </div>
      )}
      <div className={`px-2  my-1 ${collapsed ? 'mx-auto' : ''}`}>
        <Button
          appearance="subtle"
          icon={<KnowledgeIcon />}
          className="w-full justify-start"
          onClick={() => navigate('/knowledge')}
        >
          {collapsed ? null : t('Common.Knowledge')}
        </Button>
      </div>
      <div className={`px-2  my-1 ${collapsed ? 'mx-auto' : ''}`}>
        <Button
          appearance="subtle"
          icon={<BookmarkMultipleIcon />}
          className="w-full justify-start"
          onClick={() => {
            navigate('/bookmarks');
          }}
        >
          {collapsed ? null : t('Common.Bookmarks')}
        </Button>
      </div>
      <div className={`px-2  my-1 ${collapsed ? 'mx-auto' : ''}`}>
        <Button
          appearance="subtle"
          icon={<ChatAddIcon />}
          className="w-full justify-start"
          onClick={async () => navigate(`/chats/${tempChatId}`)}
        >
          {collapsed ? null : t('Chat.New')}
        </Button>
      </div>
    </div>
  );
}
