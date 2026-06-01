export function TextFormatter(text: string) {
  if (!text) {
    return null;
  }

  const escaped = escapeMarkdownInUrl(text);

  return markdownToText(escaped);
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

const stashMatches = (
  text: string,
  pattern: RegExp,
  replacementFactory: (content: string) => string,
  tokenPrefix: string
) => {
  const chunks: string[] = [];

  const nextText = text.replace(pattern, (_, content: string) => {
    const index = chunks.length;
    const token = `@@${tokenPrefix}${index}@@`;

    chunks.push(replacementFactory(content));

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

const markdownToText = (textInput: string) => {
  const processedText = textInput.replace(
    /(^|\s)(https?:\/\/(?:www\.)?\S+|www\.\S+)/gi,
    function (match, p1, p2) {
      return ''
        .concat(p1, '<a href="')
        .concat(escapeMarkdownInUrl(p2), `" title=${p2} target="_blank"">`)
        .concat(escapeMarkdownInUrl(p2), '</a>');
    }
  );

  const parts = processedText.split(/(<a href=".*?<\/a>)/g);
  for (let i = 0; i < parts.length; i += 1) {
    if (!parts[i].startsWith('<a href=')) {
      parts[i] = transformMarkdown(parts[i]);
    }
  }

  return parts.join('');
};

const transformMarkdown = (markdownText: string) => {
  let transformedText = markdownText;

  // Protect code fragments from other regex transforms.
  const stashedCodeBlocks = stashMatches(
    transformedText,
    /```([\s\S]+?)```/g,
    (content) => `<samp>${content}</samp>`,
    'MDCODEBLOCK'
  );

  transformedText = stashedCodeBlocks.nextText;

  const stashedInlineCode = stashMatches(
    transformedText,
    /`([^`\n]+)`/g,
    (content) => `<code>${content}</code>`,
    'MDINLINECODE'
  );

  transformedText = stashedInlineCode.nextText;

  // Bold: *text* — recursively process inner content
  transformedText = transformedText.replace(
    /(?<!\w)\*((?:[^*\n])+)\*(?!\w)/g,
    (_, inner) => `<b>${transformMarkdown(inner)}</b>`
  );

  // Italic: _text_ — recursively process inner content
  transformedText = transformedText.replace(
    /(?<!\w)_((?:[^_\n])+)_(?!\w)/g,
    (_, inner) => `<i>${transformMarkdown(inner)}</i>`
  );

  // Strikethrough: ~text~ — recursively process inner content
  transformedText = transformedText.replace(
    /(?<!\w)~((?:[^~\n])+)~(?!\w)/g,
    (_, inner) => `<s>${transformMarkdown(inner)}</s>`
  );

  // Bulleted list: * text or - text (only if there is a space after * or -)
  transformedText = transformedText.replace(/^(?:\s*[*-]\s+)(.+)$/gm, '<ul><li>$1</li></ul>');
  // Quote block: > text
  transformedText = transformedText.replace(/^\s*>\s*(.+)$/gm, '<blockquote>$1</blockquote>');
  // Replace newline characters with <br> tags
  // Replace newline characters with <br> tags
  transformedText = transformedText.replace(/(\n)(?!<\/?(ul|li)>)/g, '<br>');

  transformedText = restoreStashedMatches(
    transformedText,
    stashedInlineCode.chunks,
    'MDINLINECODE'
  );
  transformedText = restoreStashedMatches(
    transformedText,
    stashedCodeBlocks.chunks,
    'MDCODEBLOCK'
  );

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

  const stashedInlineCode = stashMatches(
    transformedText,
    /`([^`\n]+)`/g,
    (content) =>
      '<code><span class="message-format-marker">`</span>' +
      content +
      '<span class="message-format-marker">`</span></code>',
    'EDITORINLINECODE'
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

  transformedText = restoreStashedMatches(
    transformedText,
    stashedInlineCode.chunks,
    'EDITORINLINECODE'
  );
  transformedText = restoreStashedMatches(
    transformedText,
    stashedCodeBlocks.chunks,
    'EDITORCODEBLOCK'
  );

  return transformedText;
};

const markdownToEditorText = (textInput: string) => {
  const processedText = textInput.replace(
    /(^|\s)(https?:\/\/(?:www\.)?\S+|www\.\S+)/gi,
    function (match, p1, p2) {
      return ''
        .concat(p1, '<a href="')
        .concat(escapeMarkdownInUrl(p2), `" title=${p2} target="_blank"">`)
        .concat(escapeMarkdownInUrl(p2), '</a>');
    }
  );

  const parts = processedText.split(/(<a href=".*?<\/a>)/g);
  for (let i = 0; i < parts.length; i += 1) {
    if (!parts[i].startsWith('<a href=')) {
      parts[i] = transformMarkdownForEditor(parts[i]);
    }
  }

  return parts.join('');
};

export function EditorTextFormatter(text: string) {
  if (!text) {
    return null;
  }

  const escaped = escapeMarkdownInUrl(text);

  return markdownToEditorText(escaped);
}
