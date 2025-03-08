import { Button } from '@fluentui/react-components';
import { IChat } from 'intellichat/types';
import useChatStore from 'stores/useChatStore';
import ChatIcon from './ChatIcon';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export default function ChatItem({
  chat,
  collapsed,
}: {
  chat: IChat;
  collapsed: boolean;
}) {
  const curChat = useChatStore((state) => state.chat);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: chat.id,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div key={chat.id}>
      <Button
        style={style}
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        icon={
          <ChatIcon chat={chat} isActive={curChat && curChat.id === chat.id} />
        }
        appearance="subtle"
        className="w-full justify-start latin"
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
