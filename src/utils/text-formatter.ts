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

  // Code block (triple backticks): ```code``` — process first to protect code from other formatting
  transformedText = transformedText.replace(/```([^`]+)```/g, '<samp>$1</samp>');
  // Inline code: `code`
  transformedText = transformedText.replace(/`([^`]+)`/g, '<code>$1</code>');

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

  return transformedText;
};

const transformMarkdownForEditor = (markdownText: string) => {
  let transformedText = markdownText;

  // Code block
  transformedText = transformedText.replace(
    /```([^`]+)```/g,
    '<samp><span class="message-format-marker">```</span>$1<span class="message-format-marker">```</span></samp>'
  );
  // Inline code
  transformedText = transformedText.replace(
    /`([^`]+)`/g,
    '<code><span class="message-format-marker">`</span>$1<span class="message-format-marker">`</span></code>'
  );

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


