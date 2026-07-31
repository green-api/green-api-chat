/**
 * Number of messages requested via getChatHistory in the full (desktop) chat view.
 *
 * Chat headers must request the SAME count as the chat view so RTK Query dedupes them
 * into a single request. Requesting a different count fires a second parallel
 * getChatHistory for the same chat, which doubles the load and can trigger 429 errors
 * (making chats open very slowly).
 */
export const FULL_CHAT_HISTORY_COUNT = 50;

/** Same as {@link FULL_CHAT_HISTORY_COUNT} but for the mini (iframe) chat view. */
export const MINI_CHAT_HISTORY_COUNT = 10;

/** Maximum number of messages the chat view can grow to via "load more". */
export const MAX_CHAT_HISTORY_COUNT = 200;

/** Number of extra messages loaded on each "load more" click. */
export const CHAT_HISTORY_COUNT_STEP = 20;
