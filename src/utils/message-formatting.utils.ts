export type MessageFormat = 'bold' | 'italic' | 'strikethrough' | 'monospace';

const MESSAGE_FORMAT_MARKERS: Record<MessageFormat, readonly [string, string]> = {
  bold: ['*', '*'],
  italic: ['_', '_'],
  strikethrough: ['~', '~'],
  monospace: ['```', '```'],
};

export function applyMessageFormat(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  format: MessageFormat
) {
  const selectedText = value.slice(selectionStart, selectionEnd);
  const leadingWhitespace = selectedText.match(/^\s*/)?.[0] ?? '';
  const trailingWhitespace = selectedText.match(/\s*$/)?.[0] ?? '';
  const contentStart = selectionStart + leadingWhitespace.length;
  const contentEnd = selectionEnd - trailingWhitespace.length;

  if (contentStart >= contentEnd) {
    return {
      value,
      selectionStart,
      selectionEnd,
    };
  }

  const [prefix, suffix] = MESSAGE_FORMAT_MARKERS[format];
  const content = value.slice(contentStart, contentEnd);
  const formattedContent = `${prefix}${content}${suffix}`;
  const formattedValue = `${value.slice(0, contentStart)}${formattedContent}${value.slice(
    contentEnd
  )}`;

  return {
    value: formattedValue,
    selectionStart: contentStart,
    selectionEnd: contentStart + formattedContent.length,
  };
}

function getMessageFormatContentRange(
  value: string,
  selectionStart: number,
  selectionEnd: number
) {
  const selectedText = value.slice(selectionStart, selectionEnd);
  const leadingWhitespace = selectedText.match(/^\s*/)?.[0] ?? '';
  const trailingWhitespace = selectedText.match(/\s*$/)?.[0] ?? '';

  return {
    contentStart: selectionStart + leadingWhitespace.length,
    contentEnd: selectionEnd - trailingWhitespace.length,
  };
}

export function clearMessageFormat(value: string, selectionStart: number, selectionEnd: number) {
  const { contentStart, contentEnd } = getMessageFormatContentRange(
    value,
    selectionStart,
    selectionEnd
  );

  if (contentStart >= contentEnd) {
    return {
      value,
      selectionStart,
      selectionEnd,
    };
  }

  const content = value
    .slice(contentStart, contentEnd)
    .replace(/```([^`]+)```/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/_([^_\n]+)_/g, '$1')
    .replace(/~([^~\n]+)~/g, '$1');
  const formattedValue = `${value.slice(0, contentStart)}${content}${value.slice(contentEnd)}`;

  return {
    value: formattedValue,
    selectionStart: contentStart,
    selectionEnd: contentStart + content.length,
  };
}
