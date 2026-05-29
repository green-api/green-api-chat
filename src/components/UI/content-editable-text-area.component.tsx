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
  insertText: (text: string) => void;
  applyFormat: (format: MessageFormat) => string;
  getActiveFormats: () => MessageFormat[];
};

type ContentEditableTextAreaProps = {
  value?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
};

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
    } else if (current instanceof HTMLBRElement) {
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

  // range.toString() doesn't account for <br>, so count them manually
  const fragment = range.cloneContents();
  const brs = fragment.querySelectorAll('br').length;

  return range.toString().length + brs;
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
  return editor.innerText.replace(/\n$/, '');
};

const renderValue = (editor: HTMLElement, value: string, selectionRange?: SelectionRange) => {
  const nextHtml = EditorTextFormatter(value) || '';

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
    { value = '', className = '', placeholder, disabled, onChange, onContextMenu, onKeyDown },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const lastValueRef = useRef(value);
    const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedRender = (editor: HTMLElement, text: string) => {
      if (renderTimerRef.current) {
        clearTimeout(renderTimerRef.current);
      }

      renderTimerRef.current = setTimeout(() => {
        renderTimerRef.current = null;

        // Only re-render if the editor is still focused and value hasn't changed since
        if (document.activeElement === editor || editor.contains(document.activeElement)) {
          const selectionRange = getSelectionRange(editor);

          renderValue(editor, text, selectionRange);
        }
      }, 300);
    };

    const emitChange = () => {
      const editor = editorRef.current;

      if (!editor) {
        return;
      }

      const nextValue = normalizeEditorText(editor);

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
          return;
        }

        // Cancel any pending debounced render
        if (renderTimerRef.current) {
          clearTimeout(renderTimerRef.current);
          renderTimerRef.current = null;
        }

        const selectionRange = getSelectionRange(editor);
        const currentValue = lastValueRef.current || value || '';

        const nextValue =
          currentValue.slice(0, selectionRange.start) +
          text +
          currentValue.slice(selectionRange.end);

        const nextCursorPosition = selectionRange.start + text.length;

        lastValueRef.current = nextValue;
        onChange?.(nextValue);

        renderValue(editor, nextValue, {
          start: nextCursorPosition,
          end: nextCursorPosition,
        });
      },

      applyFormat: (format) => {
        const editor = editorRef.current;

        if (!editor) {
          return lastValueRef.current || value || '';
        }

        // Cancel any pending debounced render
        if (renderTimerRef.current) {
          clearTimeout(renderTimerRef.current);
          renderTimerRef.current = null;
        }

        const selectionRange = getSelectionRange(editor);
        const currentValue = lastValueRef.current || value || '';

        const formatted = applyMessageFormat(
          currentValue,
          selectionRange.start,
          selectionRange.end,
          format
        );

        lastValueRef.current = formatted.value;
        onChange?.(formatted.value);

        renderValue(editor, formatted.value, {
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
        const currentValue = lastValueRef.current || value || '';

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
      renderValue(editor, value);
    }, [value]);

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

      renderValue(editor, value);
    }, []);

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
          const currentValue = lastValueRef.current || value || '';

          const nextValue =
            currentValue.slice(0, selectionRange.start) +
            text +
            currentValue.slice(selectionRange.end);

          const nextCursorPosition = selectionRange.start + text.length;

          lastValueRef.current = nextValue;
          onChange?.(nextValue);

          renderValue(editor, nextValue, {
            start: nextCursorPosition,
            end: nextCursorPosition,
          });
        }}
      />
    );
  }
);

export default ContentEditableTextArea;

