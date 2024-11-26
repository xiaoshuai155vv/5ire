import {
  Field,
  Label,
  Button,
  Input,
  Textarea,
  Slider,
  Divider,
  SliderOnChangeData,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
} from '@fluentui/react-components';
import { Search24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import Debug from 'debug';
import {
  useState,
  ChangeEvent,
  KeyboardEvent,
  useMemo,
  useEffect,
} from 'react';
import useChatStore from 'stores/useChatStore';
import { useTranslation } from 'react-i18next';
import { MIN_CTX_MESSAGES, MAX_CTX_MESSAGES, NUM_CTX_MESSAGES } from 'consts';
import useChatContext from 'hooks/useChatContext';
import { debounce, isNumber } from 'lodash';

const debug = Debug('5ire:pages:chat:ChatSettingsDrawer');

export default function ChatSettingsDrawer({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const activeChat = useChatContext().getActiveChat();
  const [ctxMessages, setCtxMessages] = useState<number>(NUM_CTX_MESSAGES);
  useEffect(() => {
    setSystemMessage(activeChat.systemMessage || '');
    setCtxMessages(
      isNumber(activeChat.maxCtxMessages)
        ? activeChat.maxCtxMessages
        : NUM_CTX_MESSAGES
    );
  }, [activeChat?.id]);

  const setKeyword = useChatStore((state) => state.setKeyword);
  const keywords = useChatStore((state) => state.keywords);

  const keyword = useMemo(
    () => keywords[activeChat?.id] || '',
    [keywords, activeChat?.id]
  );

  const [systemMessage, setSystemMessage] = useState<string>();

  const updateChat = useChatStore((state) => state.updateChat);
  const editChat = useChatStore((state) => state.editChat);

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!event.shiftKey && event.key === 'Enter') {
      event.preventDefault();
      setOpen(false);
    }
  };

  const updateCtxMessages = (
    ev: ChangeEvent<HTMLInputElement>,
    data: SliderOnChangeData
  ) => {
    const maxCtxMessages = data.value;
    setCtxMessages(maxCtxMessages);
    if (activeChat.isPersisted) {
      updateChat({ id: activeChat.id, maxCtxMessages });
      debug('Update CtxMessages of Chat', maxCtxMessages);
    } else {
      editChat({ maxCtxMessages });
      debug('Edit CtxMessages of Chat', maxCtxMessages);
    }
    window.electron.ingestEvent([
      { app: 'modify-max-ctx-messages' },
      { 'max-ctx-messages': maxCtxMessages },
    ]);
  };

  const onSystemMessageChange = (ev: ChangeEvent<HTMLTextAreaElement>) => {
    setSystemMessage(ev.target.value);
    updateSystemMessage(ev);
  };

  const updateSystemMessage = useMemo(
    () =>
      debounce((ev: ChangeEvent<HTMLTextAreaElement>) => {
        const systemMessage = ev.target.value;
        if (activeChat.isPersisted) {
          updateChat({ id: activeChat.id, systemMessage });
          debug('Update SystemMessage of Chat', systemMessage);
        } else {
          editChat({ systemMessage });
          debug('Edit SystemMessage of Chat', systemMessage);
        }
      }, 1000),
    [activeChat?.id]
  );

  return (
    <div>
      <Drawer
        position="end"
        open={open}
        onOpenChange={(_, { open }) => setOpen(open)}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close"
                icon={<Dismiss24Regular />}
                onClick={() => setOpen(false)}
              />
            }
          >
            &nbsp;
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody className="mt-2.5 flex flex-col gap-2 relative">
          {activeChat.isPersisted ? (
            <div className="mb-2.5">
              <Input
                id="inchat-search"
                contentBefore={<Search24Regular />}
                placeholder={t('Chat.InConversationSearch')}
                className="w-full"
                value={keyword}
                onKeyDown={onSearchKeyDown}
                onChange={(e, data) => {
                  setKeyword(activeChat?.id, data.value);
                }}
              />
            </div>
          ) : null}
          <div className="mb-1.5">
            <Divider>{t('Common.Settings')}</Divider>
          </div>
          <div className="mb-4">
            <Field label={t('Common.SystemMessage')}>
              <Textarea
                size="large"
                rows={20}
                value={systemMessage}
                onChange={onSystemMessageChange}
                resize="vertical"
              />
            </Field>
          </div>
          <div>
            <Field
              label={`${t('Common.MaxNumOfContextMessages')} (${ctxMessages})`}
            >
              <div className="flex items-center p-1.5">
                <Label aria-hidden>{MIN_CTX_MESSAGES}</Label>
                <Slider
                  id="chat-max-context"
                  step={1}
                  min={MIN_CTX_MESSAGES}
                  max={MAX_CTX_MESSAGES}
                  value={ctxMessages}
                  className="flex-grow"
                  onChange={updateCtxMessages}
                />
                <Label aria-hidden>{MAX_CTX_MESSAGES}</Label>
              </div>
            </Field>
          </div>
          <div className="flex-grow" />
        </DrawerBody>
      </Drawer>
    </div>
  );
}
