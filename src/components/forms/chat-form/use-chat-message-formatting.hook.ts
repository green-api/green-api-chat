import { KeyboardEvent, MouseEvent, RefObject, useCallback, useEffect, useState } from 'react';

import { Form } from 'antd';

import { MessageFormatMenuState } from 'components/forms/chat-form/chat-format-menu.component';
import { LinkModalFormValues } from 'components/forms/chat-form/chat-link-modal.component';
import { ContentEditableTextAreaRef } from 'components/UI/content-editable-text-area.component';
import { ChatFormValues } from 'types';
import { MessageFormat } from 'utils';

const initialFormatMenuState: MessageFormatMenuState = {
  isOpen: false,
  mode: 'root',
  x: 0,
  y: 0,
  selectionStart: 0,
  selectionEnd: 0,
  activeFormats: [],
  hasSelection: false,
};

type UseChatMessageFormattingParams = {
  form: ReturnType<typeof Form.useForm<ChatFormValues>>[0];
  linkForm: ReturnType<typeof Form.useForm<LinkModalFormValues>>[0];
  isLinkFeatureEnabled: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  messageEditorRef: RefObject<ContentEditableTextAreaRef>;
};

export const useChatMessageFormatting = ({
  form,
  linkForm,
  isLinkFeatureEnabled,
  inputValue,
  setInputValue,
  messageEditorRef,
}: UseChatMessageFormattingParams) => {
  const [formatMenu, setFormatMenu] = useState<MessageFormatMenuState>(initialFormatMenuState);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkSelectionRange, setLinkSelectionRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const closeFormatMenu = useCallback(() => {
    setFormatMenu((currentFormatMenu) =>
      currentFormatMenu.isOpen ? initialFormatMenuState : currentFormatMenu
    );
  }, []);

  const onTextAreaContextMenu = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const { start, end } = messageEditorRef.current?.getSelectionRange() ?? {
        start: 0,
        end: 0,
      };

      event.preventDefault();
      event.stopPropagation();

      const viewportPadding = 8;

      const activeFormats = messageEditorRef.current?.getActiveFormats() || [];

      let disableFormatting = false;
      let disableLink = false;
      if (isLinkFeatureEnabled && start !== end) {
        const checkSelectionContainsLink = (text: string, s: number, e: number): boolean => {
          const markdownLinkRegex = /\[\s*([^[\]]+?)\s*\]\(\s*((?:https?:\/\/|www\.)[^\s)]+)\s*\)/gi;
          let match;
          while ((match = markdownLinkRegex.exec(text)) !== null) {
            const linkStart = match.index;
            const linkEnd = markdownLinkRegex.lastIndex;
            if (Math.max(s, linkStart) < Math.min(e, linkEnd)) {
              return true;
            }
          }

          const plainUrlRegex = /(?:https?:\/\/|www\.)[^\s]+/gi;
          while ((match = plainUrlRegex.exec(text)) !== null) {
            const linkStart = match.index;
            const linkEnd = plainUrlRegex.lastIndex;
            if (Math.max(s, linkStart) < Math.min(e, linkEnd)) {
              return true;
            }
          }

          return false;
        };

        disableFormatting = checkSelectionContainsLink(inputValue, start, end);

        const checkSelectionHasFormatting = (text: string, s: number, e: number, formats: string[]): boolean => {
          if (formats.length > 0) {
            return true;
          }
          const selectedText = text.slice(s, e);
          const hasBold = /(?<!\w)\*[^*\n]+\*(?!\w)/.test(selectedText);
          const hasItalic = /(?<!\w)_[^_\n]+_(?!\w)/.test(selectedText);
          const hasStrikethrough = /(?<!\w)~[^~\n]+~(?!\w)/.test(selectedText);
          const hasMonospace = /`[^`\n]+`/.test(selectedText);

          return hasBold || hasItalic || hasStrikethrough || hasMonospace;
        };

        disableLink = checkSelectionHasFormatting(inputValue, start, end, activeFormats);
      }

      setFormatMenu({
        isOpen: true,
        mode: isLinkFeatureEnabled ? 'root' : 'formatting',
        x: Math.max(viewportPadding, Math.min(event.clientX, window.innerWidth - viewportPadding)),
        y: Math.max(viewportPadding, Math.min(event.clientY, window.innerHeight - viewportPadding)),
        selectionStart: start,
        selectionEnd: end,
        activeFormats,
        hasSelection: start !== end,
        disableFormatting,
        disableLink,
      });
    },
    [isLinkFeatureEnabled, messageEditorRef, inputValue]
  );

  const onSelectMessageFormat = useCallback(
    (event: MouseEvent<HTMLButtonElement>, format: MessageFormat) => {
      event.preventDefault();
      event.stopPropagation();

      if (!formatMenu.hasSelection) {
        closeFormatMenu();
        return;
      }

      messageEditorRef.current?.setSelectionRange(
        formatMenu.selectionStart,
        formatMenu.selectionEnd
      );
      const nextValue = messageEditorRef.current?.applyFormat(format) || '';

      form.setFieldValue('message', nextValue);
      setInputValue(nextValue);
      closeFormatMenu();
    },
    [closeFormatMenu, form, formatMenu, messageEditorRef, setInputValue]
  );

  const onOpenFormattingSubmenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setFormatMenu((currentFormatMenu) => {
      if (!currentFormatMenu.isOpen || !currentFormatMenu.hasSelection) {
        return currentFormatMenu;
      }

      return { ...currentFormatMenu, mode: 'formatting' };
    });
  }, []);

  const onBackToFormatMenuRoot = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setFormatMenu((currentFormatMenu) => {
      if (!currentFormatMenu.isOpen) {
        return currentFormatMenu;
      }

      return { ...currentFormatMenu, mode: 'root' };
    });
  }, []);

  const onOpenLinkModal = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (!isLinkFeatureEnabled) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const selectedText = inputValue
        .slice(formatMenu.selectionStart, formatMenu.selectionEnd)
        .trim();

      linkForm.setFieldsValue({
        linkText: selectedText,
        linkUrl: '',
      });
      setLinkSelectionRange({
        start: formatMenu.selectionStart,
        end: formatMenu.selectionEnd,
      });
      setIsLinkModalOpen(true);
      closeFormatMenu();
    },
    [
      closeFormatMenu,
      formatMenu.selectionEnd,
      formatMenu.selectionStart,
      inputValue,
      isLinkFeatureEnabled,
      linkForm,
    ]
  );

  const onCancelLinkModal = useCallback(() => {
    setIsLinkModalOpen(false);
    setLinkSelectionRange(null);
    linkForm.resetFields();
  }, [linkForm]);

  const onInsertLink = useCallback(async () => {
    if (!isLinkFeatureEnabled) {
      return;
    }

    try {
      const values = await linkForm.validateFields();
      let text = values.linkText.trim();
      const url = values.linkUrl.trim();
      const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

      let prefix = '';
      let suffix = '';
      while (true) {
        let matched = false;
        const formats = [
          { char: '*', close: '*' },
          { char: '_', close: '_' },
          { char: '~', close: '~' },
          { char: '`', close: '`' },
        ];
        for (const fmt of formats) {
          if (text.startsWith(fmt.char) && text.endsWith(fmt.char) && text.length > 2) {
            prefix = prefix + fmt.char;
            suffix = fmt.close + suffix;
            text = text.slice(1, -1);
            matched = true;
            break;
          }
        }
        if (!matched) break;
      }

      const markdownLink = prefix
        ? `${prefix}[${text}](${normalizedUrl})${suffix}`
        : `[${text}](${normalizedUrl})`;
      const selectionStart = linkSelectionRange?.start ?? 0;
      const selectionEnd = linkSelectionRange?.end ?? 0;

      messageEditorRef.current?.setSelectionRange(selectionStart, selectionEnd);
      const nextValue = messageEditorRef.current?.insertText(markdownLink);

      if (nextValue !== undefined) {
        form.setFieldValue('message', nextValue);
        setInputValue(nextValue);
      }

      onCancelLinkModal();
      setTimeout(() => messageEditorRef.current?.focus(), 0);
    } catch {}
  }, [
    form,
    isLinkFeatureEnabled,
    linkForm,
    linkSelectionRange,
    messageEditorRef,
    onCancelLinkModal,
    setInputValue,
  ]);

  const onEditorKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Enter') {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        const nextValue = messageEditorRef.current?.insertText('\n');

        if (nextValue !== undefined) {
          form.setFieldValue('message', nextValue);
          setInputValue(nextValue);
        }

        return;
      }

      event.preventDefault();
      event.stopPropagation();
      form.submit();
    },
    [form, messageEditorRef, setInputValue]
  );

  useEffect(() => {
    if (!formatMenu.isOpen) {
      return;
    }

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeFormatMenu();
      }
    };

    window.addEventListener('mousedown', closeFormatMenu);
    window.addEventListener('resize', closeFormatMenu);
    window.addEventListener('scroll', closeFormatMenu, true);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('mousedown', closeFormatMenu);
      window.removeEventListener('resize', closeFormatMenu);
      window.removeEventListener('scroll', closeFormatMenu, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closeFormatMenu, formatMenu.isOpen]);

  return {
    formatMenu,
    isLinkModalOpen,
    onTextAreaContextMenu,
    onSelectMessageFormat,
    onOpenFormattingSubmenu,
    onBackToFormatMenuRoot,
    onOpenLinkModal,
    onCancelLinkModal,
    onInsertLink,
    onEditorKeyDown,
  };
};
