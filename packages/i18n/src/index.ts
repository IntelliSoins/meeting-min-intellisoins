// Internationalization package for Meetily
export const locales = ['en', 'fr'] as const;
export type Locale = typeof locales[number];

export function getMessages(locale: Locale) {
  return import(`../messages/${locale}.json`);
}

export { default as enMessages } from '../messages/en.json';
export { default as frMessages } from '../messages/fr.json';
