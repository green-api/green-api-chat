type TextFormatterOptions = {
  enableMarkdownLinks?: boolean;
  compact?: boolean;
};

type EditorTextFormatterOptions = {
  enableMarkdownLinks?: boolean;
};

export function TextFormatter(text: string, options: TextFormatterOptions = {}) {
  if (!text) {
    return null;
  }

  const escaped = escapeMarkdownInUrl(text);
  const { enableMarkdownLinks = true, compact = false } = options;

  return markdownToText(escaped, enableMarkdownLinks, compact);
}

export const escapeMarkdownInUrl = (url: string) => {
  return url.replace(/[<>"']/g, function (char) {
    return (
      {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[char] || char
    );
  });
};

const MARKDOWN_LINK_REGEX = /\[\s*([^[\]]+?)\s*\]\(\s*((?:https?:\/\/|www\.)[^\s]+)\s*\)/gi;
const PLAIN_URL_REGEX = /(^|\s)((?<!\]\()https?:\/\/(?:www\.)?\S+|(?<!\]\()www\.\S+)/gi;
const HTML_ANCHOR_REGEX = /(<a\b[^>]*>.*?<\/a>)/g;
const TEXTAREA_LINK_CLASS_NAME = 'link link-blue link-hover-underline';
const MESSAGE_LINK_CLASS_NAME = 'link link-blue link-hover-underline';

const stashInlineCode = (
  text: string,
  tokenPrefix: string,
  replacementFactory: (content: string, marker: string) => string
) => {
  const quadrupleBackticks = stashMatches(
    text,
    /````([\s\S]+?)````/g,
    (content) => replacementFactory(content, '````'),
    `${tokenPrefix}QUAD`
  );

  const doubleBackticks = stashMatches(
    quadrupleBackticks.nextText,
    /``([^`\n]+)``/g,
    (content) => replacementFactory(content, '``'),
    `${tokenPrefix}DOUBLE`
  );

  const singleBackticks = stashMatches(
    doubleBackticks.nextText,
    /`([^`\n]+)`/g,
    (content) => replacementFactory(content, '`'),
    `${tokenPrefix}SINGLE`
  );

  return {
    nextText: singleBackticks.nextText,
    restore: (currentText: string) => {
      const withSingles = restoreStashedMatches(
        currentText,
        singleBackticks.chunks,
        `${tokenPrefix}SINGLE`
      );
      const withDoubles = restoreStashedMatches(
        withSingles,
        doubleBackticks.chunks,
        `${tokenPrefix}DOUBLE`
      );

      return restoreStashedMatches(withDoubles, quadrupleBackticks.chunks, `${tokenPrefix}QUAD`);
    },
  };
};

const normalizeLinkUrl = (url: string) => {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const buildAnchorTag = (url: string, label?: string, options: { className?: string } = {}) => {
  const normalizedUrl = normalizeLinkUrl(url);
  const escapedUrl = escapeMarkdownInUrl(normalizedUrl);
  const escapedLabel = escapeMarkdownInUrl(label || url);
  const className = options.className ? ` class="${options.className}"` : '';

  return `<a${className} href="${escapedUrl}" title="${escapedUrl}" target="_blank" rel="noreferrer">${escapedLabel}</a>`;
};

const buildEditorMarkdownLinkTag = (url: string, content: string) => {
  const normalizedUrl = normalizeLinkUrl(url);
  const escapedUrl = escapeMarkdownInUrl(normalizedUrl);
  const escapedContent = escapeMarkdownInUrl(content);

  return `<a class="${TEXTAREA_LINK_CLASS_NAME}" href="${escapedUrl}" title="${escapedUrl}" target="_blank" rel="noreferrer" data-md-link="true" data-md-url="${escapedUrl}">${escapedContent}</a>`;
};

const stashMatches = (
  text: string,
  pattern: RegExp,
  replacementFactory: (...captures: string[]) => string,
  tokenPrefix: string
) => {
  const chunks: string[] = [];

  const nextText = text.replace(pattern, (...args) => {
    const maybeNamedGroups = typeof args[args.length - 1] === 'object' ? 3 : 2;
    const captures = args.slice(1, args.length - maybeNamedGroups) as string[];
    const index = chunks.length;
    const token = `@@${tokenPrefix}${index}@@`;

    chunks.push(replacementFactory(...captures));

    return token;
  });

  return { nextText, chunks };
};

const stashMarkdownLinks = (
  text: string,
  tokenPrefix: string,
  replacementFactory: (url: string, content: string) => string = (url, content) =>
    buildAnchorTag(url, content, { className: MESSAGE_LINK_CLASS_NAME })
) => {
  const chunks: string[] = [];

  const nextText = text.replace(MARKDOWN_LINK_REGEX, (_, content: string, url: string) => {
    const index = chunks.length;
    const token = `@@${tokenPrefix}${index}@@`;

    chunks.push(replacementFactory(url, content));

    return token;
  });

  return { nextText, chunks };
};

const restoreStashedMatches = (text: string, chunks: string[], tokenPrefix: string) => {
  if (!chunks.length) {
    return text;
  }

  const tokenPattern = new RegExp(`@@${tokenPrefix}(\\d+)@@`, 'g');

  return text.replace(tokenPattern, (_, index) => chunks[Number(index)] ?? '');
};

const markdownToText = (textInput: string, enableMarkdownLinks: boolean, compact: boolean) => {
  const stashedMarkdownLinks = enableMarkdownLinks
    ? stashMarkdownLinks(textInput, 'MDLINK', compact ? (_url, content) => content : undefined)
    : { nextText: textInput, chunks: [] };
  const processedText = compact
    ? stashedMarkdownLinks.nextText
    : stashedMarkdownLinks.nextText.replace(PLAIN_URL_REGEX, (_, prefix, url) => {
        return `${prefix}${buildAnchorTag(url, undefined, { className: MESSAGE_LINK_CLASS_NAME })}`;
      });

  const parts = processedText.split(HTML_ANCHOR_REGEX);
  for (let i = 0; i < parts.length; i += 1) {
    if (!/^<a\b/i.test(parts[i])) {
      parts[i] = transformMarkdown(parts[i], compact);
    }
  }

  return restoreStashedMatches(parts.join(''), stashedMarkdownLinks.chunks, 'MDLINK');
};

const transformMarkdown = (markdownText: string, compact = false) => {
  let transformedText = markdownText;

  // Protect code fragments from other regex transforms.
  const stashedCodeBlocks = stashMatches(
    transformedText,
    /```(?:([a-zA-Z0-9_+-]+)\n)?([\s\S]+?)```/g,
    (_language, content) =>
      compact
        ? `<code>${content.replace(/\s*\n+\s*/g, ' ')}</code>`
        : '<div class="message-code-block">' +
          '<button type="button" class="message-code-block__copy copy-massage-code-button" data-code-copy="true" aria-label="Copy code"></button>' +
          `<pre class="message-code-block__pre"><code>${content}</code></pre>` +
          '</div>',
    'MDCODEBLOCK'
  );

  transformedText = stashedCodeBlocks.nextText;

  const stashedInlineCode = stashInlineCode(
    transformedText,
    'MDINLINECODE',
    (content) => `<code>${content}</code>`
  );

  transformedText = stashedInlineCode.nextText;

  // Bold: *text* — recursively process inner content
  transformedText = transformedText.replace(
    /(?<!\w)\*((?:[^*\n])+)\*(?!\w)/g,
    (_, inner) => `<b>${transformMarkdown(inner, compact)}</b>`
  );

  // Italic: _text_ — recursively process inner content
  transformedText = transformedText.replace(
    /(?<!\w)_((?:[^_\n])+)_(?!\w)/g,
    (_, inner) => `<i>${transformMarkdown(inner, compact)}</i>`
  );

  // Strikethrough: ~text~ — recursively process inner content
  transformedText = transformedText.replace(
    /(?<!\w)~((?:[^~\n])+)~(?!\w)/g,
    (_, inner) => `<s>${transformMarkdown(inner, compact)}</s>`
  );

  // Bulleted list: * text or - text (only if there is a space after * or -)
  transformedText = transformedText.replace(/^(?:\s*[*-]\s+)(.+)$/gm, '<ul><li>$1</li></ul>');
  // Quote block: > text
  transformedText = transformedText.replace(/^\s*>\s*(.+)$/gm, '<blockquote>$1</blockquote>');
  // Replace newline characters with <br> tags
  // Replace newline characters with <br> tags
  transformedText = transformedText.replace(/(\n)(?!<\/?(ul|li)>)/g, compact ? ' ' : '<br>');

  transformedText = stashedInlineCode.restore(transformedText);
  transformedText = restoreStashedMatches(transformedText, stashedCodeBlocks.chunks, 'MDCODEBLOCK');

  return transformedText;
};

const transformMarkdownForEditor = (markdownText: string) => {
  let transformedText = markdownText;

  // Protect code fragments from other regex transforms.
  const stashedCodeBlocks = stashMatches(
    transformedText,
    /```([\s\S]+?)```/g,
    (content) =>
      '<samp><span class="message-format-marker">```</span>' +
      content +
      '<span class="message-format-marker">```</span></samp>',
    'EDITORCODEBLOCK'
  );

  transformedText = stashedCodeBlocks.nextText;

  const stashedInlineCode = stashInlineCode(
    transformedText,
    'EDITORINLINECODE',
    (content, marker) => {
    return (
      `<code><span class="message-format-marker">${marker}</span>` +
      content +
      `<span class="message-format-marker">${marker}</span></code>`
    );
    }
  );

  transformedText = stashedInlineCode.nextText;

  // Bold
  transformedText = transformedText.replace(
    /(?<!\w)\*((?:[^*\n])+)\*(?!\w)/g,
    (_, inner) =>
      `<b><span class="message-format-marker">*</span>${transformMarkdownForEditor(
        inner
      )}<span class="message-format-marker">*</span></b>`
  );

  // Italic
  transformedText = transformedText.replace(
    /(?<!\w)_((?:[^_\n])+)_(?!\w)/g,
    (_, inner) =>
      `<i><span class="message-format-marker">_</span>${transformMarkdownForEditor(
        inner
      )}<span class="message-format-marker">_</span></i>`
  );

  // Strikethrough
  transformedText = transformedText.replace(
    /(?<!\w)~((?:[^~\n])+)~(?!\w)/g,
    (_, inner) =>
      `<s><span class="message-format-marker">~</span>${transformMarkdownForEditor(
        inner
      )}<span class="message-format-marker">~</span></s>`
  );

  // Bulleted list and blockquote left as is for now since they are full line formats
  transformedText = transformedText.replace(/^(?:\s*[*-]\s+)(.+)$/gm, '<ul><li>$1</li></ul>');
  transformedText = transformedText.replace(/^\s*>\s*(.+)$/gm, '<blockquote>$1</blockquote>');

  // Replace newline characters with <br> tags
  transformedText = transformedText.replace(/(\n)(?!<\/?(ul|li)>)/g, '<br>');

  transformedText = stashedInlineCode.restore(transformedText);
  transformedText = restoreStashedMatches(
    transformedText,
    stashedCodeBlocks.chunks,
    'EDITORCODEBLOCK'
  );

  return transformedText;
};

const markdownToEditorText = (textInput: string, enableMarkdownLinks: boolean) => {
  const stashedMarkdownLinks = enableMarkdownLinks
    ? stashMarkdownLinks(textInput, 'EDITORMDLINK', (url, content) =>
        buildEditorMarkdownLinkTag(url, content)
      )
    : { nextText: textInput, chunks: [] };

  const processedText = stashedMarkdownLinks.nextText.replace(PLAIN_URL_REGEX, (_, prefix, url) => {
    return `${prefix}${buildAnchorTag(url, undefined, { className: TEXTAREA_LINK_CLASS_NAME })}`;
  });

  const parts = processedText.split(HTML_ANCHOR_REGEX);
  for (let i = 0; i < parts.length; i += 1) {
    if (!/^<a\b/i.test(parts[i])) {
      parts[i] = transformMarkdownForEditor(parts[i]);
    }
  }

  return restoreStashedMatches(parts.join(''), stashedMarkdownLinks.chunks, 'EDITORMDLINK');
};

export function EditorTextFormatter(text: string, options: EditorTextFormatterOptions = {}) {
  if (!text) {
    return null;
  }

  const escaped = escapeMarkdownInUrl(text);
  const { enableMarkdownLinks = true } = options;

  return markdownToEditorText(escaped, enableMarkdownLinks);
}
