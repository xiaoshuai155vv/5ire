import { Button } from '@fluentui/react-components';
import useNav from 'hooks/useNav';
import { IChat } from 'intellichat/types';
import useChatStore from 'stores/useChatStore';
import ChatIcon from './ChatIcon';

export default function ChatItem({
  chat,
  collapsed,
}: {
  chat: IChat;
  collapsed: boolean;
}) {
  const curChat = useChatStore((state) => state.chat);
  const navigate = useNav();

  return (
    <div key={chat.id}>
      <Button
        icon={
          <ChatIcon chat={chat} isActive={curChat && curChat.id === chat.id} />
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
  );
}
