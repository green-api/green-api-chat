# CSL-996: Live Hebrew direction switching

## Goal

When the GREEN-API Console changes its locale to Hebrew while the chat iframe is open, the embedded chat must immediately switch to the Hebrew RTL layout without reloading the page or iframe and without losing the current chat state.

## Scope

The behavioral change belongs to `sw-console-chat`. The parent console continues to send the selected locale through the existing `INIT` and `LOCALE_CHANGE` messages. No new message type or payload field is introduced.

The fix covers transitions between all supported languages:

- `en`, `ru`, and `tr` use LTR;
- `he` uses RTL;
- transitions such as `en → ru → he → en` update the existing UI in place.

## Design

The chat application remains the owner of deriving document direction from its active i18next locale.

After i18next resolves a new locale, the application:

1. normalizes the language to its base code;
2. derives direction through i18next;
3. passes the resolved direction to Ant Design `ConfigProvider`;
4. synchronizes the iframe document root attributes:
   - `document.documentElement.lang` receives the normalized language;
   - `document.documentElement.dir` receives `rtl` or `ltr`.

The existing message handler continues to call `i18n.changeLanguage` for `INIT` and `LOCALE_CHANGE`. The iframe is not remounted or reloaded.

This keeps Ant Design components, application CSS, browser bidi behavior, and accessibility metadata aligned to the same locale state.

## Error handling

If i18next has not resolved a supported locale, the application falls back to English and LTR, matching the existing fallback behavior. Unsupported regional suffixes are normalized to their base language before selecting the Ant Design locale.

## Testing

The regression check must first demonstrate the current failure and then verify that:

- Hebrew resolves to `rtl`;
- English, Russian, and Turkish resolve to `ltr`;
- the root `lang` and `dir` attributes follow live locale changes;
- the iframe is not reloaded or remounted during the change.

After automated checks, the complete flow is verified in the existing authorized Chrome session:

1. start the chat application on `localhost:5174`;
2. open the console on `localhost:3000`;
3. open Chats;
4. switch the console locale to Hebrew;
5. confirm the visible chat becomes RTL immediately and remains usable;
6. switch back to an LTR locale and confirm the layout returns to LTR;
7. inspect browser console errors and horizontal overflow.

## Non-goals

- Reloading the iframe to apply a locale.
- Adding a separate `direction` field to the cross-window message contract.
- Refactoring unrelated chat layout or localization code.
