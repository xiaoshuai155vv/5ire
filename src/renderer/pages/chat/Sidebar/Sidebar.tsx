import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from '@fluentui/react-components';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useAppearanceStore from 'stores/useAppearanceStore';
import useInspectorStore, { ITraceMessage } from 'stores/useInspectorStore';

export default function Sidebar({ chatId }: { chatId: string }) {
  const { t } = useTranslation();
  const theme = useAppearanceStore((state) => state.theme);
  const chatSidebar = useAppearanceStore((state) => state.chatSidebar);
  const messages = useInspectorStore((state) => state.messages);
  const trace = useMemo(() => messages[chatId] || [], [messages, chatId]);

  const labelClasses: { [key: string]: string } = useMemo(() => {
    if (theme === 'dark') {
      return {
        error: 'text-red-500 bg-red-900',
        run: 'text-gray-500 bg-gray-900',
        arguments: 'text-blue-400 bg-blue-900 ',
        resp: 'text-green-500 bg-green-900',
      };
    }
    return {
      error: 'text-red-500 bg-red-100',
      run: 'text-gray-500 bg-gray-100',
      arguments: 'text-blue-500 bg-blue-100',
      resp: 'text-green-500 bg-green-100',
    };
  }, [theme]);

  return (
    <aside
      className={`right-sidebar ml-5 -mr-5 z-20 pt-2.5 flex-shrink-0 border-l w-64 ${
        chatSidebar.hidden ? 'hidden' : 'hidden sm:flex'
      }  inset-y-0 top-0 flex-col duration-300 md:relative pl-2`}
    >
      <div className="text-gray-300 dark:text-gray-600 font-bold text-lg">
        {t('Common.Inspector')}
      </div>
      <div className="h-full overflow-x-hidden overflow-y-auto  break-all -ml-2.5">
        <Accordion multiple collapsible>
          {trace?.map((item: ITraceMessage, idx: number) => {
            return item.message === '' ? (
              <div className="pl-4 mt-2">
                <span className="-ml-1 inline-block pt-0 py-0.5 rounded truncate text-ellipsis overflow-hidden w-52 font-bold text-gray-400 dark:text-gray-400">
                  {item.label}
                </span>
              </div>
            ) : (
              <AccordionItem value={idx} key={`${chatId}-trace-${idx}`}>
                <AccordionHeader size="small">
                  <span
                    className={`-ml-1 px-1 inline-block pt-0 py-0.5 rounded ${labelClasses[item.label] || ''}`}
                  >
                    {item.label}
                  </span>
                </AccordionHeader>
                <AccordionPanel>
                  <pre className="ghost">
                    <code className="text-gray-500 dark:text-gray-300 text-left pl-1">
                      {item.message}
                    </code>
                  </pre>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </aside>
  );
}
