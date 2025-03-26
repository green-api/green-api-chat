import { MessageInterface } from 'types';

export function getTextMessage(message: MessageInterface) {
  return (
    message.extendedTextMessage?.text ||
    message.textMessage ||
    message.templateButtonReplyMessage?.selectedDisplayText ||
    message.typeMessage
  );
}

export function getPhoneNumberFromChatId(chatId: string) {
  return chatId?.replace(/\@.*$/, '');
}

export function getJSONMessage(message: MessageInterface): string {
  let copyMessage: MessageInterface;

  if ('structuredClone' in window) {
    copyMessage = structuredClone(message);
  } else {
    // TODO: rework
    copyMessage = { ...message };
  }

  if (copyMessage.jpegThumbnail) {
    copyMessage.jpegThumbnail = copyMessage.jpegThumbnail.slice(0, 50) + '...';
  }

  if (copyMessage.extendedTextMessage && copyMessage.extendedTextMessage.jpegThumbnail) {
    copyMessage.extendedTextMessage.jpegThumbnail =
      copyMessage.extendedTextMessage.jpegThumbnail.slice(0, 50) + '...';
  }

  if (copyMessage.extendedTextMessage && copyMessage.extendedTextMessage.text.length > 250) {
    copyMessage.extendedTextMessage.text =
      copyMessage.extendedTextMessage.text.slice(0, 250) + '...';
  }

  if (copyMessage.textMessage && copyMessage.textMessage.length > 250) {
    copyMessage.textMessage = copyMessage.textMessage.slice(0, 250) + '...';
  }

  if (copyMessage.caption && copyMessage.caption.length > 150) {
    copyMessage.caption = copyMessage.caption.slice(0, 150) + '...';
  }

  if (copyMessage.location && copyMessage.location.jpegThumbnail.length > 50) {
    copyMessage.location.jpegThumbnail = copyMessage.location.jpegThumbnail.slice(0, 50) + '...';
  }

  if (copyMessage.quotedMessage) {
    copyMessage.quotedMessage = JSON.parse(getJSONMessage(copyMessage.quotedMessage));
  }

  return JSON.stringify(copyMessage, null, 2);
}
