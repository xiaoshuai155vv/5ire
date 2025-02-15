import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogBody,
  Button,
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from '@fluentui/react-components';
import Mousetrap from 'mousetrap';
import { useTranslation } from 'react-i18next';
import {
  Dismiss24Regular,
  Radar20Regular,
  Radar20Filled,
  bundleIcon,
} from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import useMarkdown from 'hooks/useMarkdown';

import 'highlight.js/styles/atom-one-light.css'

const RadarIcon = bundleIcon(Radar20Filled, Radar20Regular);

export default function ToolDetailDialog(args: { tool: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const [tools, setTools] = useState<any[]>([]);
  const { render } = useMarkdown();
  useEffect(() => {
    if (open) {
      Mousetrap.bind('esc', () => setOpen(false));
      window.electron.mcp.listTools(args.tool).then((_tools) => {
        setTools(_tools);
      });
    }
    return () => {
      Mousetrap.unbind('esc');
    };
  }, [open, args.tool]);

  return (
    <Dialog open={open}>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          onClick={() => setOpen(true)}
          icon={<RadarIcon />}
        />
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  onClick={() => setOpen(false)}
                  appearance="subtle"
                  aria-label="close"
                  icon={<Dismiss24Regular />}
                />
              </DialogTrigger>
            }
          >
            {args.tool}&nbsp;{t('Common.Tools')}
          </DialogTitle>
          <DialogContent>
            <Accordion multiple collapsible>
              {tools.map((tool: any) => (
                <AccordionItem value={tool.name} key={tool.name}>
                  <AccordionHeader>
                    <div className='text-gray-500 dark:text-gray-300 font-bold'>{tool.name.split('--')[1]}</div>
                  </AccordionHeader>
                  <AccordionPanel>
                    <div className="border-l border-dotted border-stone-300 dark:border-gray-500 ml-2 pl-2">
                      <div className="text-sm text-gray-500 dark:text-gray-300 ml-3">
                        {tool.description}
                      </div>
                      <div className="mt-2 ml-2">
                        <fieldset className="border border-stone-300 dark:border-stone-600 rounded bg-stone-50 dark:bg-stone-800">
                          <legend className="text-sm px-1 ml-2 text-gray-500 dark:text-gray-300">
                            inputSchema
                          </legend>
                          <div
                            className='-mt-3'
                            dangerouslySetInnerHTML={{
                              __html: render(
                                `\`\`\`json\n${JSON.stringify(tool.inputSchema, null, 2)}\n\`\`\``,
                              ),
                            }}
                          />
                        </fieldset>
                      </div>
                    </div>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
