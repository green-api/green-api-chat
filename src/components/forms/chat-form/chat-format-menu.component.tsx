import { FC, MouseEvent, useLayoutEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { MessageFormat } from 'utils';

export type MessageFormatMenuMode = 'root' | 'formatting';

export type MessageFormatMenuState = {
  isOpen: boolean;
  mode: MessageFormatMenuMode;
  x: number;
  y: number;
  selectionStart: number;
  selectionEnd: number;
  activeFormats: MessageFormat[];
  hasSelection: boolean;
};

const messageFormatOptions: { key: MessageFormat; translationKey: string }[] = [
  { key: 'bold', translationKey: 'MESSAGE_FORMAT_BOLD' },
  { key: 'italic', translationKey: 'MESSAGE_FORMAT_ITALIC' },
  { key: 'strikethrough', translationKey: 'MESSAGE_FORMAT_STRIKETHROUGH' },
  { key: 'monospace', translationKey: 'MESSAGE_FORMAT_MONOSPACE' },
];

type ChatFormatMenuProps = {
  isLinkFeatureEnabled: boolean;
  formatMenu: MessageFormatMenuState;
  onOpenFormattingSubmenu: (event: MouseEvent<HTMLButtonElement>) => void;
  onOpenLinkModal: (event: MouseEvent<HTMLButtonElement>) => void;
  onBackToFormatMenuRoot: (event: MouseEvent<HTMLButtonElement>) => void;
  onSelectMessageFormat: (event: MouseEvent<HTMLButtonElement>, format: MessageFormat) => void;
};

const ChatFormatMenu: FC<ChatFormatMenuProps> = ({
  isLinkFeatureEnabled,
  formatMenu,
  onOpenFormattingSubmenu,
  onOpenLinkModal,
  onBackToFormatMenuRoot,
  onSelectMessageFormat,
}) => {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: formatMenu.x, y: formatMenu.y });

  useLayoutEffect(() => {
    if (!formatMenu.isOpen) {
      return;
    }

    const menuElement = menuRef.current;

    if (!menuElement) {
      return;
    }

    const viewportPadding = 8;
    const maxX = window.innerWidth - menuElement.offsetWidth - viewportPadding;
    const maxY = window.innerHeight - menuElement.offsetHeight - viewportPadding;
    const nextPosition = {
      x: Math.max(viewportPadding, Math.min(formatMenu.x, maxX)),
      y: Math.max(viewportPadding, Math.min(formatMenu.y, maxY)),
    };

    setPosition((currentPosition) =>
      currentPosition.x === nextPosition.x && currentPosition.y === nextPosition.y
        ? currentPosition
        : nextPosition
    );
  }, [
    formatMenu.activeFormats.length,
    formatMenu.hasSelection,
    formatMenu.isOpen,
    formatMenu.mode,
    formatMenu.x,
    formatMenu.y,
    isLinkFeatureEnabled,
  ]);

  if (!formatMenu.isOpen) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="message-format-menu"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => event.stopPropagation()}
    >
      {formatMenu.mode === 'root' && isLinkFeatureEnabled ? (
        <div className="message-format-menu__main">
          <button
            className={`message-format-menu__item ${
              !formatMenu.hasSelection ? 'message-format-menu__item--disabled' : ''
            }`}
            type="button"
            onClick={onOpenFormattingSubmenu}
            disabled={!formatMenu.hasSelection}
          >
            {t('MESSAGE_FORMAT')}
          </button>
          <button className="message-format-menu__item" type="button" onClick={onOpenLinkModal}>
            {t('MESSAGE_FORMAT_LINK')}
          </button>
        </div>
      ) : (
        <div className="message-format-menu__submenu">
          {isLinkFeatureEnabled && (
            <button
              className="message-format-menu__item message-format-menu__item--back"
              type="button"
              onClick={onBackToFormatMenuRoot}
            >
              {t('MESSAGE_FORMAT_BACK')}
            </button>
          )}
          {messageFormatOptions.map((option) => (
            <button
              className={`message-format-menu__item ${
                formatMenu.activeFormats.includes(option.key)
                  ? 'message-format-menu__item--active'
                  : ''
              }`}
              key={option.key}
              type="button"
              onClick={(event) => onSelectMessageFormat(event, option.key)}
            >
              {t(option.translationKey)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatFormatMenu;
