import { Button, InteractiveButton } from 'types/api.types';

export function mapButtonsToInteractive(buttons: Button[]): InteractiveButton[] {
  return buttons.map((button) => {
    const { type, buttonId, buttonText } = button;

    switch (type) {
      case 'copy':
        return {
          type,
          buttonId,
          buttonText,
          copyCode: button.copyCode,
        };
      case 'call':
        return {
          type,
          buttonId,
          buttonText,
          phoneNumber: button.phoneNumber,
        };
      case 'url':
        return {
          type,
          buttonId,
          buttonText,
          url: button.url,
        };
      default:
        return {
          type: 'reply',
          buttonId,
          buttonText,
        };
    }
  });
}
