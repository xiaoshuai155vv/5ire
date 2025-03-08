import { Tooltip } from '@fluentui/react-components';
import { Chat20Filled, Chat20Regular } from '@fluentui/react-icons';
import { IChat } from 'intellichat/types';

export default function ChatIcon({
  chat,
  isActive,
}: {
  chat: IChat;
  isActive: boolean;
}) {
  return (
    <Tooltip
      withArrow
      content={chat.summary?.substring(0, 200)}
      relationship="label"
      positioning="above-start"
    >
      {isActive ? <Chat20Filled /> : <Chat20Regular />}
    </Tooltip>
  );
}
