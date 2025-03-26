import { GetChatHistoryResponse, MessageInterface, StatusMessage } from 'types';

export function getLastChats(
  lastIncomingMessages: GetChatHistoryResponse,
  lastOutgoingMessages: GetChatHistoryResponse,
  count?: number
): GetChatHistoryResponse {
  if (!lastIncomingMessages.length && !lastOutgoingMessages.length) {
    return [];
  }

  const allMessagesFilteredAndSorted = [...lastIncomingMessages, ...lastOutgoingMessages]
    .filter(
      (message) =>
        message.typeMessage !== 'reactionMessage' &&
        message.typeMessage !== 'deletedMessage' &&
        message.typeMessage !== 'editedMessage'
    )
    .sort((a, b) => b.timestamp - a.timestamp);

  const resultMap = new Map<string, MessageInterface>();

  for (const message of allMessagesFilteredAndSorted) {
    if (count && resultMap.size === count) {
      break;
    }

    if (!resultMap.has(message.chatId)) {
      resultMap.set(message.chatId, message);
      continue;
    }

    const existingChat = resultMap.get(message.chatId);
    if (!existingChat) continue;

    // need for update existing chat last message status
    if (
      isStatusUpdateNeeded(existingChat, message) ||
      isEditedOrDeletedMessageUpdateNeeded(existingChat, message)
    ) {
      resultMap.set(existingChat.chatId, message);
    }
  }

  return Array.from(resultMap.values());
}

function isNewStatusMessageForExistingChat(
  existingStatus: StatusMessage | undefined,
  newStatus: StatusMessage | undefined
): boolean {
  return (
    (existingStatus === 'pending' &&
      (newStatus === 'sent' || newStatus === 'delivered' || newStatus === 'read')) ||
    (existingStatus === 'sent' && (newStatus === 'delivered' || newStatus === 'read')) ||
    (existingStatus === 'delivered' && newStatus === 'read')
  );
}

function isStatusUpdateNeeded(existingChat: MessageInterface, message: MessageInterface): boolean {
  return (
    existingChat.idMessage === message.idMessage &&
    existingChat.statusMessage !== message.statusMessage &&
    isNewStatusMessageForExistingChat(existingChat.statusMessage, message.statusMessage)
  );
}

function isEditedOrDeletedMessageUpdateNeeded(
  existingChat: MessageInterface,
  message: MessageInterface
): boolean {
  return (
    existingChat.idMessage === message.idMessage &&
    (('editedMessageId' in existingChat &&
      'editedMessageId' in message &&
      existingChat.editedMessageId !== message.editedMessageId) ||
      ('deletedMessageId' in existingChat &&
        'deletedMessageId' in message &&
        existingChat.deletedMessageId !== message.deletedMessageId))
  );
}

export function updateLastChats(
  currentChats: MessageInterface[],
  lastIncomingMessages: GetChatHistoryResponse,
  lastOutgoingMessages: GetChatHistoryResponse,
  count?: number
): GetChatHistoryResponse {
  const updates = [...lastIncomingMessages, ...lastOutgoingMessages];

  return getLastChats(currentChats, updates, count);
}
