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
  const { contentStart, contentEnd } = getMessageFormatContentRange(value, selectionStart, selectionEnd);

  if (contentStart >= contentEnd) {
    return { value, selectionStart, selectionEnd };
  }

  const [targetPrefix, targetSuffix] = MESSAGE_FORMAT_MARKERS[format];
  const content = value.slice(contentStart, contentEnd);
  const textBefore = value.slice(0, contentStart);
  const textAfter = value.slice(contentEnd);

  type Layer = { format: MessageFormat; prefix: string; suffix: string };

  const insideLayers: Layer[] = [];
  let innerContent = content;
  while (true) {
    let matched = false;
    for (const [fmt, [prefix, suffix]] of Object.entries(MESSAGE_FORMAT_MARKERS)) {
      if (
        innerContent.startsWith(prefix) &&
        innerContent.endsWith(suffix) &&
        innerContent.length >= prefix.length + suffix.length
      ) {
        insideLayers.push({ format: fmt as MessageFormat, prefix, suffix });
        innerContent = innerContent.slice(prefix.length, innerContent.length - suffix.length);
        matched = true;
        break;
      }
    }
    if (!matched) break;
  }

  const outsideLayers: Layer[] = [];
  let before = textBefore;
  let after = textAfter;
  while (true) {
    let matched = false;
    for (const [fmt, [prefix, suffix]] of Object.entries(MESSAGE_FORMAT_MARKERS)) {
      if (before.endsWith(prefix) && after.startsWith(suffix)) {
        outsideLayers.push({ format: fmt as MessageFormat, prefix, suffix });
        before = before.slice(0, -prefix.length);
        after = after.slice(suffix.length);
        matched = true;
        break;
      }
    }
    if (!matched) break;
  }

  const insideIndex = insideLayers.findIndex((l) => l.format === format);
  if (insideIndex !== -1) {
    insideLayers.splice(insideIndex, 1);
    let newContent = innerContent;
    for (let i = insideLayers.length - 1; i >= 0; i--) {
      newContent = `${insideLayers[i].prefix}${newContent}${insideLayers[i].suffix}`;
    }
    const formattedValue = `${textBefore}${newContent}${textAfter}`;
    return {
      value: formattedValue,
      selectionStart: contentStart,
      selectionEnd: contentStart + newContent.length,
    };
  }

  const outsideIndex = outsideLayers.findIndex((l) => l.format === format);
  if (outsideIndex !== -1) {
    outsideLayers.splice(outsideIndex, 1);
    let newBefore = before;
    let newAfter = after;
    for (const layer of outsideLayers) {
      newBefore = `${layer.prefix}${newBefore}`;
      newAfter = `${newAfter}${layer.suffix}`;
    }
    const formattedValue = `${newBefore}${content}${newAfter}`;
    return {
      value: formattedValue,
      selectionStart: newBefore.length,
      selectionEnd: newBefore.length + content.length,
    };
  }

  const formattedContent = `${targetPrefix}${content}${targetSuffix}`;
  const formattedValue = `${textBefore}${formattedContent}${textAfter}`;

  return {
    value: formattedValue,
    selectionStart: contentStart,
    selectionEnd: contentStart + formattedContent.length,
  };
}

function getMessageFormatContentRange(value: string, selectionStart: number, selectionEnd: number) {
  const selectedText = value.slice(selectionStart, selectionEnd);
  const leadingWhitespace = selectedText.match(/^\s*/)?.[0] ?? '';
  const trailingWhitespace = selectedText.match(/\s*$/)?.[0] ?? '';

  return {
    contentStart: selectionStart + leadingWhitespace.length,
    contentEnd: selectionEnd - trailingWhitespace.length,
  };
}

export function getActiveFormats(
  value: string,
  selectionStart: number,
  selectionEnd: number
): MessageFormat[] {
  const { contentStart, contentEnd } = getMessageFormatContentRange(
    value,
    selectionStart,
    selectionEnd
  );

  if (contentStart >= contentEnd) {
    return [];
  }

  const content = value.slice(contentStart, contentEnd);
  const textBefore = value.slice(0, contentStart);
  const textAfter = value.slice(contentEnd);

  const activeFormats = new Set<MessageFormat>();

  let innerContent = content;
  while (true) {
    let matched = false;
    for (const [format, [prefix, suffix]] of Object.entries(MESSAGE_FORMAT_MARKERS)) {
      if (
        innerContent.startsWith(prefix) &&
        innerContent.endsWith(suffix) &&
        innerContent.length >= prefix.length + suffix.length
      ) {
        activeFormats.add(format as MessageFormat);
        innerContent = innerContent.slice(prefix.length, innerContent.length - suffix.length);
        matched = true;
        break;
      }
    }
    if (!matched) break;
  }

  let before = textBefore;
  let after = textAfter;
  while (true) {
    let matched = false;
    for (const [format, [prefix, suffix]] of Object.entries(MESSAGE_FORMAT_MARKERS)) {
      if (before.endsWith(prefix) && after.startsWith(suffix)) {
        activeFormats.add(format as MessageFormat);
        before = before.slice(0, -prefix.length);
        after = after.slice(suffix.length);
        matched = true;
        break;
      }
    }
    if (!matched) break;
  }

  return Array.from(activeFormats);
}

export function clearMessageFormat(value: string, selectionStart: number, selectionEnd: number) {
  const { contentStart, contentEnd } = getMessageFormatContentRange(
    value,
    selectionStart,
    selectionEnd
  );

  if (contentStart >= contentEnd) {
    return { value, selectionStart, selectionEnd };
  }

  const content = value.slice(contentStart, contentEnd);
  const textBefore = value.slice(0, contentStart);
  const textAfter = value.slice(contentEnd);

  let innerContent = content;
  while (true) {
    let matched = false;
    for (const [fmt, [prefix, suffix]] of Object.entries(MESSAGE_FORMAT_MARKERS)) {
      if (
        innerContent.startsWith(prefix) &&
        innerContent.endsWith(suffix) &&
        innerContent.length >= prefix.length + suffix.length
      ) {
        innerContent = innerContent.slice(prefix.length, innerContent.length - suffix.length);
        matched = true;
        break;
      }
    }
    if (!matched) break;
  }

  let before = textBefore;
  let after = textAfter;
  while (true) {
    let matched = false;
    for (const [fmt, [prefix, suffix]] of Object.entries(MESSAGE_FORMAT_MARKERS)) {
      if (before.endsWith(prefix) && after.startsWith(suffix)) {
        before = before.slice(0, -prefix.length);
        after = after.slice(suffix.length);
        matched = true;
        break;
      }
    }
    if (!matched) break;
  }

  const formattedValue = `${before}${innerContent}${after}`;

  return {
    value: formattedValue,
    selectionStart: before.length,
    selectionEnd: before.length + innerContent.length,
  };
}
