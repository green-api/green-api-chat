import {
  ClipboardEvent,
  forwardRef,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import { applyMessageFormat, getActiveFormats, MessageFormat } from 'utils/message-formatting.utils';
import { EditorTextFormatter, TextFormatter } from 'utils/text-formatter';

type SelectionRange = {
  start: number;
  end: number;
};

export type ContentEditableTextAreaRef = {
  focus: () => void;
  getSelectionRange: () => SelectionRange;
  setSelectionRange: (start: number, end: number) => void;
  insertText: (text: string) => string;
  applyFormat: (format: MessageFormat) => string;
  getActiveFormats: () => MessageFormat[];
};

type ContentEditableTextAreaProps = {
  value?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  enableMarkdownLinks?: boolean;
  onChange?: (value: string) => void;
  onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
};

const TRAILING_BREAK_PLACEHOLDER_ATTR = 'data-trailing-break-placeholder';

/**
 * Walks the DOM tree and collects text-bearing nodes along with <br> elements.
 * Each entry carries: the DOM node, offset length it represents in plain text,
 * and whether it is a <br> (which counts as 1 character = '\n').
 */
const getOffsetNodes = (root: Node) => {
  const nodes: { node: Node; length: number; isBr: boolean }[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL);

  let current = walker.nextNode();

  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      const len = current.textContent?.length ?? 0;

      if (len > 0) {
        nodes.push({ node: current, length: len, isBr: false });
      }
    } else if (
      current instanceof HTMLBRElement &&
      current.getAttribute(TRAILING_BREAK_PLACEHOLDER_ATTR) !== 'true'
    ) {
      nodes.push({ node: current, length: 1, isBr: true });
    }

    current = walker.nextNode();
  }

  return nodes;
};

const getSelectionOffset = (root: HTMLElement, container: Node, offset: number) => {
  const range = document.createRange();

  range.setStart(root, 0);
  range.setEnd(container, offset);

  const getFragmentLength = (fragment: DocumentFragment) => {
    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ALL);

    let current = walker.nextNode();
    let length = 0;

    while (current) {
      if (current.nodeType === Node.TEXT_NODE) {
        length += current.textContent?.length ?? 0;
      } else if (
        current instanceof HTMLBRElement &&
        current.getAttribute(TRAILING_BREAK_PLACEHOLDER_ATTR) !== 'true'
      ) {
        length += 1;
      }

      current = walker.nextNode();
    }

    return length;
  };

  // Count length through DOM nodes instead of range.toString() so hidden formatting
  // marker spans (used by the editor) are included in the text offset mapping.
  const fragment = range.cloneContents();

  return getFragmentLength(fragment);
};

const getSelectionRange = (root: HTMLElement): SelectionRange => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return { start: 0, end: 0 };
  }

  const range = selection.getRangeAt(0);

  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
    return { start: 0, end: 0 };
  }

  return {
    start: getSelectionOffset(root, range.startContainer, range.startOffset),
    end: getSelectionOffset(root, range.endContainer, range.endOffset),
  };
};

const setSelectionRange = (root: HTMLElement, start: number, end: number) => {
  root.focus();

  const offsetNodes = getOffsetNodes(root);
  const range = document.createRange();

  if (!offsetNodes.length) {
    range.setStart(root, 0);
    range.setEnd(root, 0);
  } else {
    let currentOffset = 0;
    let startSet = false;
    let endSet = false;

    for (const entry of offsetNodes) {
      const nextOffset = currentOffset + entry.length;

      if (!startSet && start >= currentOffset && start <= nextOffset) {
        if (entry.isBr) {
          // Position cursor after the <br>
          const parent = entry.node.parentNode;

          if (parent) {
            const index = Array.from(parent.childNodes).indexOf(entry.node as ChildNode);
            range.setStart(parent, index + 1);
          }
        } else {
          range.setStart(entry.node, Math.min(start - currentOffset, entry.length));
        }

        startSet = true;
      }

      if (!endSet && end >= currentOffset && end <= nextOffset) {
        if (entry.isBr) {
          const parent = entry.node.parentNode;

          if (parent) {
            const index = Array.from(parent.childNodes).indexOf(entry.node as ChildNode);
            range.setEnd(parent, index + 1);
          }
        } else {
          range.setEnd(entry.node, Math.min(end - currentOffset, entry.length));
        }

        endSet = true;
      }

      currentOffset = nextOffset;

      if (startSet && endSet) {
        break;
      }
    }

    if (!startSet || !endSet) {
      // Fallback: place cursor at the very end
      const lastEntry = offsetNodes[offsetNodes.length - 1];

      if (lastEntry.isBr) {
        const parent = lastEntry.node.parentNode;

        if (parent) {
          const index = Array.from(parent.childNodes).indexOf(lastEntry.node as ChildNode);

          if (!startSet) range.setStart(parent, index + 1);
          if (!endSet) range.setEnd(parent, index + 1);
        }
      } else {
        const len = lastEntry.node.textContent?.length ?? 0;

        if (!startSet) range.setStart(lastEntry.node, len);
        if (!endSet) range.setEnd(lastEntry.node, len);
      }
    }
  }

  const selection = window.getSelection();

  selection?.removeAllRanges();
  selection?.addRange(range);
};

const normalizeEditorText = (editor: HTMLElement) => {
  const stringifyNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }

    if (node instanceof HTMLBRElement) {
      if (node.getAttribute(TRAILING_BREAK_PLACEHOLDER_ATTR) === 'true') {
        return '';
      }

      return '\n';
    }

    if (node instanceof HTMLElement) {
      if (node.tagName === 'A' && node.dataset.mdLink === 'true') {
        const label = Array.from(node.childNodes).map(stringifyNode).join('');
        const url = node.dataset.mdUrl || node.getAttribute('href') || '';

        return `[${label}](${url})`;
      }

      return Array.from(node.childNodes).map(stringifyNode).join('');
    }

    return '';
  };

  const normalizedText = Array.from(editor.childNodes).map(stringifyNode).join('');
  const hasSingleBrOnly =
    editor.childNodes.length === 1 && editor.firstChild instanceof HTMLBRElement;

  if (hasSingleBrOnly && normalizedText === '\n') {
    return '';
  }

  return normalizedText;
};

const moveTextTypedInsideMarkdownLinkOutside = (value: string) => {
  return value.replace(
    /\[([^[\]\n]+?)\]([^\(\)\n]+)\(((?:https?:\/\/|www\.)[^\s)]+)\)/gi,
    (_match, label: string, injectedText: string, url: string) =>
      `[${label}](${url})${injectedText}`
  );
};

const renderValue = (
  editor: HTMLElement,
  value: string,
  enableMarkdownLinks: boolean,
  selectionRange?: SelectionRange
) => {
  const baseHtml = EditorTextFormatter(value, { enableMarkdownLinks }) || '';
  const nextHtml = value.endsWith('\n')
    ? `${baseHtml}<br ${TRAILING_BREAK_PLACEHOLDER_ATTR}="true">`
    : baseHtml;

  editor.innerHTML = nextHtml;

  if (selectionRange) {
    requestAnimationFrame(() => {
      setSelectionRange(editor, selectionRange.start, selectionRange.end);
    });
  }
};

const ContentEditableTextArea = forwardRef<
  ContentEditableTextAreaRef,
  ContentEditableTextAreaProps
>(
  (
    {
      value = '',
      className = '',
      placeholder,
      disabled,
      enableMarkdownLinks = true,
      onChange,
      onContextMenu,
      onKeyDown,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const lastValueRef = useRef(value);
    const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const getCurrentValue = () => lastValueRef.current;

    const debouncedRender = (editor: HTMLElement, text: string) => {
      if (renderTimerRef.current) {
        clearTimeout(renderTimerRef.current);
      }

      renderTimerRef.current = setTimeout(() => {
        renderTimerRef.current = null;

        // Only re-render if the editor is still focused and value hasn't changed since
        if (document.activeElement === editor || editor.contains(document.activeElement)) {
          const selectionRange = getSelectionRange(editor);

          renderValue(editor, text, enableMarkdownLinks, selectionRange);
        }
      }, 300);
    };

    const emitChange = () => {
      const editor = editorRef.current;

      if (!editor) {
        return;
      }

      const nextValue = moveTextTypedInsideMarkdownLinkOutside(normalizeEditorText(editor));

      lastValueRef.current = nextValue;
      onChange?.(nextValue);

      // Don't re-render innerHTML immediately — let contentEditable handle typing natively.
      // Schedule a debounced render for formatting highlights after user pauses.
      debouncedRender(editor, nextValue);
    };

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),

      getSelectionRange: () => {
        const editor = editorRef.current;

        if (!editor) {
          return { start: 0, end: 0 };
        }

        return getSelectionRange(editor);
      },

      setSelectionRange: (start, end) => {
        const editor = editorRef.current;

        if (!editor) {
          return;
        }

        setSelectionRange(editor, start, end);
      },

      insertText: (text) => {
        const editor = editorRef.current;

        if (!editor) {
          return getCurrentValue();
        }

        // Cancel any pending debounced render
        if (renderTimerRef.current) {
          clearTimeout(renderTimerRef.current);
          renderTimerRef.current = null;
        }

        const selectionRange = getSelectionRange(editor);
        const currentValue = getCurrentValue();

        const nextValue =
          currentValue.slice(0, selectionRange.start) +
          text +
          currentValue.slice(selectionRange.end);

        const nextCursorPosition = selectionRange.start + text.length;

        lastValueRef.current = nextValue;
        onChange?.(nextValue);

        renderValue(editor, nextValue, enableMarkdownLinks, {
          start: nextCursorPosition,
          end: nextCursorPosition,
        });

        return nextValue;
      },

      applyFormat: (format) => {
        const editor = editorRef.current;

        if (!editor) {
          return getCurrentValue();
        }

        // Cancel any pending debounced render
        if (renderTimerRef.current) {
          clearTimeout(renderTimerRef.current);
          renderTimerRef.current = null;
        }

        const selectionRange = getSelectionRange(editor);
        const currentValue = getCurrentValue();

        const formatted = applyMessageFormat(
          currentValue,
          selectionRange.start,
          selectionRange.end,
          format
        );

        lastValueRef.current = formatted.value;
        onChange?.(formatted.value);

        renderValue(editor, formatted.value, enableMarkdownLinks, {
          start: formatted.selectionStart,
          end: formatted.selectionEnd,
        });

        return formatted.value;
      },

      getActiveFormats: () => {
        const editor = editorRef.current;

        if (!editor) {
          return [];
        }

        const selectionRange = getSelectionRange(editor);
        const currentValue = getCurrentValue();

        return getActiveFormats(currentValue, selectionRange.start, selectionRange.end);
      },
    }));

    useEffect(() => {
      const editor = editorRef.current;

      if (!editor) {
        return;
      }

      // Skip re-render if the value matches what we already have —
      // this prevents the effect from clobbering cursor position set by emitChange/insertText
      if (value === lastValueRef.current) {
        return;
      }

      // If the editor is focused, the user is actively typing.
      // emitChange already re-rendered with cursor preservation, so skip.
      if (document.activeElement === editor || editor.contains(document.activeElement)) {
        lastValueRef.current = value;
        return;
      }

      lastValueRef.current = value;
      renderValue(editor, value, enableMarkdownLinks);
    }, [value, enableMarkdownLinks]);

    useEffect(() => {
      return () => {
        if (renderTimerRef.current) {
          clearTimeout(renderTimerRef.current);
        }
      };
    }, []);

    useEffect(() => {
      const editor = editorRef.current;

      if (!editor || editor.innerHTML) {
        return;
      }

      renderValue(editor, value, enableMarkdownLinks);
    }, [enableMarkdownLinks, value]);

    return (
      <div
        ref={editorRef}
        className={`ant-input ${className}`}
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        data-is-empty={!value}
        aria-disabled={disabled}
        onInput={emitChange}
        onContextMenu={onContextMenu}
        onKeyDown={onKeyDown}
        onPaste={(event: ClipboardEvent<HTMLDivElement>) => {
          event.preventDefault();

          const text = event.clipboardData.getData('text/plain');

          const editor = editorRef.current;

          if (!editor) {
            return;
          }

          const selectionRange = getSelectionRange(editor);
          const currentValue = getCurrentValue();

          const nextValue =
            currentValue.slice(0, selectionRange.start) +
            text +
            currentValue.slice(selectionRange.end);

          const nextCursorPosition = selectionRange.start + text.length;

          lastValueRef.current = nextValue;
          onChange?.(nextValue);

          renderValue(editor, nextValue, enableMarkdownLinks, {
            start: nextCursorPosition,
            end: nextCursorPosition,
          });
        }}
      />
    );
  }
);

export default ContentEditableTextArea;
