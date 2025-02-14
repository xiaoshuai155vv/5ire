/* eslint-disable react/no-danger */
import { useTranslation } from 'react-i18next';
// @ts-ignore
import MarkdownIt from 'markdown-it';
// @ts-ignore
import mathjax3 from 'markdown-it-mathjax3'; // @ts-ignore
import hljs from 'highlight.js/lib/common';
import MarkdownItCodeCopy from '../libs/markdownit-plugins/CodeCopy';
import useToast from './useToast';
import { renderThink } from 'utils/util';

const ThinkIcon =
  '<svg class="___1okpztj f1w7gpdv fez10in fg4l7m0 f16hsg94 fwpfdsa f88nxoq f1e2fz10" fill="currentColor" aria-hidden="true" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2c3.31 0 6 2.6 6 5.8 0 1.68-.75 3.22-2.2 4.6a.6.6 0 0 0-.15.2l-.02.09-.94 3.92a1.84 1.84 0 0 1-1.67 1.38l-.15.01H9.13c-.82 0-1.54-.52-1.78-1.26l-.04-.14-.93-3.91a.6.6 0 0 0-.17-.3A6.32 6.32 0 0 1 4 8.04L4 7.8v-.2A5.91 5.91 0 0 1 10 2Zm2.04 13H7.96l.31 1.33.03.1c.1.3.38.52.71.56l.12.01h1.81a.86.86 0 0 0 .75-.53l.03-.1.32-1.37ZM10 3a4.92 4.92 0 0 0-4.98 4.41L5 7.63V8c.06 1.3.68 2.52 1.9 3.67.18.17.32.4.4.64l.05.15.37 1.54h4.57l.38-1.61.05-.16c.09-.21.22-.4.39-.56C14.38 10.47 15 9.18 15 7.8A4.9 4.9 0 0 0 10 3Z" fill="currentColor"></path></svg>';
const ArrowUpIcon =
  '<svg class="___1okpztj f1w7gpdv fez10in fg4l7m0 f16hsg94 fwpfdsa f88nxoq f1e2fz10" fill="currentColor" aria-hidden="true" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M4.15 12.35a.5.5 0 0 1 0-.7L9.6 6.16a.55.55 0 0 1 .78 0l5.46 5.49a.5.5 0 0 1-.7.7L10 7.2l-5.15 5.16a.5.5 0 0 1-.7 0Z" fill="currentColor"></path></svg>';
const ArrowDownIcon =
  '<svg class="___1okpztj f1w7gpdv fez10in fg4l7m0 f16hsg94 fwpfdsa f88nxoq f1e2fz10" fill="currentColor" aria-hidden="true" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.85 7.65c.2.2.2.5 0 .7l-5.46 5.49a.55.55 0 0 1-.78 0L4.15 8.35a.5.5 0 1 1 .7-.7L10 12.8l5.15-5.16c.2-.2.5-.2.7 0Z" fill="currentColor"></path></svg>';

function renderThinkTag(str: string, title: string): string {
  return renderThink(str, {
    header: `<div class="think-header">
<div>
<div class="text-gray-300" style="margin-top:-3px">${ThinkIcon}</div>
<span class="font-bold text-gray-400 ">${title}</span>
</div>
<div>
<div class="icon icon-show hidden">${ArrowDownIcon}</div>
<div class="icon icon-hide">${ArrowUpIcon}</div>
</div>
</div>`,
  });
}

export default function useMarkdown() {
  const { notifySuccess } = useToast();
  const { t } = useTranslation();
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight(str: string, lang: string) {
      // notice: 硬编码解决 ellipsis-loader 被转移为代码显示的问题。
      const loader = '<span class="blinking-cursor" /></span>';
      const isLoading = str.indexOf(loader) > -1;
      let code = str;
      if (isLoading) {
        code = str.replace(loader, '');
      }

      if (lang && hljs.getLanguage(lang)) {
        try {
          return (
            `<pre className="hljs">` +
            `<code>${
              hljs.highlight(code, {
                language: lang,
                ignoreIllegals: true,
              }).value
            }${isLoading ? loader : ''}</code></pre>`
          );
        } catch (__) {
          return (
            `<pre className="hljs">` +
            `<code>${hljs.highlightAuto(code).value}${
              isLoading ? loader : ''
            }</code>` +
            `</pre>`
          );
        }
      }
      return (
        `<pre className="hljs">` +
        `<code>${hljs.highlightAuto(code).value}${
          isLoading ? loader : ''
        }</code>` +
        `</pre>`
      );
    },
  })
    .use(mathjax3)
    .use(MarkdownItCodeCopy, {
      element:
        '<svg class="___1okpztj f1w7gpdv fez10in fg4l7m0 f16hsg94 fwpfdsa f88nxoq f1e2fz10" fill="currentColor" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M4 4.09v6.41A2.5 2.5 0 0 0 6.34 13h4.57c-.2.58-.76 1-1.41 1H6a3 3 0 0 1-3-3V5.5c0-.65.42-1.2 1-1.41ZM11.5 2c.83 0 1.5.67 1.5 1.5v7c0 .83-.67 1.5-1.5 1.5h-5A1.5 1.5 0 0 1 5 10.5v-7C5 2.67 5.67 2 6.5 2h5Zm0 1h-5a.5.5 0 0 0-.5.5v7c0 .28.22.5.5.5h5a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5Z" fill="currentColor"></path></svg>',
      onSuccess: () => {
        notifySuccess(t('Common.Notification.Copied'));
      },
    });
  const defaultRender =
    md.renderer.rules.link_open ||
    function (tokens: any, idx: any, options: any, env: any, self: any) {
      return self.renderToken(tokens, idx, options);
    };
  md.renderer.rules.link_open = function (
    tokens: any,
    idx: any,
    options: any,
    env: any,
    self: any,
  ) {
    // Add a new `target` attribute, or replace the value of the existing one.
    tokens[idx].attrSet('target', '_blank');
    // Pass the token to the default renderer.
    return defaultRender(tokens, idx, options, env, self);
  };
  return {
    render: (str: string): string =>
      md.render(renderThinkTag(str, t('Common.Think'))),
  };
}
