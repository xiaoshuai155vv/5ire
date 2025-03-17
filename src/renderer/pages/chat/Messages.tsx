import { IChatMessage } from 'intellichat/types';
import Message from './Message';

export default function Messages({ messages }: { messages: IChatMessage[] }) {
  return (
    <div id="messages">
      {messages.map((msg: IChatMessage) => {
        return <Message message={msg} key={msg.id} />;
      })}
      <div className="h-10">&nbsp;</div>
    </div>
  );
}
