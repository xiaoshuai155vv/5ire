import merge from 'lodash/merge';

let clipboard: any = null;
try {
  // Node js will throw an error
  this === window;

  const Clipboard = require('clipboard');
  clipboard = new Clipboard('.markdown-it-code-copy');
} catch (_err) {}

const defaultOptions = {
  iconStyle: 'font-size: 21px; opacity: 0.4;',
  iconClass: 'mdi mdi-content-copy',
  buttonStyle:
    'position: absolute; top: 7.5px; right: 6px; cursor: pointer; outline: none;',
  buttonClass: '',
  element: '',
};

function renderCode(
  origRule: (...args: [any, any]) => any,
  options: {
    buttonClass: any;
    buttonStyle: any;
    iconStyle: any;
    iconClass: any;
    element: any;
  },
) {
  options = merge(defaultOptions, options);
  return (...args: [any, any]) => {
    const [tokens, idx] = args;
    const content = tokens[idx].content
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
    const origRendered = origRule(...args);
    if (content.length === 0) return origRendered;

    return `
<div style="position: relative">
	${origRendered}
	<button class="markdown-it-code-copy ${options.buttonClass}" data-clipboard-text="${content}" style="${options.buttonStyle}" title="Copy">
		<span style="${options.iconStyle}" class="${options.iconClass}">${options.element}</span>
	</button>
</div>
`;
  };
}

export default function MarkdownItCodeCopy(md: any, options: any) {
  if (clipboard) {
    clipboard.off('success');
    if (options.onSuccess) {
      clipboard.on('success', options.onSuccess);
    }
    clipboard.off('onError');
    if (options.onError) {
      clipboard.on('error', options.onError);
    }
  }
  md.renderer.rules.code_block = renderCode(
    md.renderer.rules.code_block,
    options,
  );
  md.renderer.rules.fence = renderCode(md.renderer.rules.fence, options);
}
