/**
 * Wallet Utilities
 * 
 * Helper functions for wallet management
 */

import { wordlists } from 'bip39';

/** Locale to BIP39 wordlist mapping */
const LOCALE_WORDLIST_MAP: Record<string, string[] | undefined> = {
    'zh-CN': wordlists.chinese_simplified,
    'zh-TW': wordlists.chinese_traditional,
    'ja': wordlists.japanese,
    'ko': wordlists.korean,
};

/** 
 * Locales that don't use spaces between words
 * (Chinese, Japanese, Korean - CJK languages)
 */
const NO_SPACE_LOCALES = ['zh-CN', 'zh-TW', 'ja', 'ko'];

/**
 * Generate a random wallet name using BIP39 wordlist
 * @param locale Current locale (e.g. 'zh-CN', 'en')
 * @param suffix Localized suffix (e.g. '钱包', 'Wallet')
 * @returns Generated wallet name (e.g. '爱钱包', 'Garden Wallet')
 */
export function generateWalletName(locale: string, suffix: string): string {
    // Get wordlist for locale, fallback to English
    const wordlist = LOCALE_WORDLIST_MAP[locale] ?? wordlists.english!;

    // Pick a random word
    const randomWord = wordlist[Math.floor(Math.random() * wordlist.length)];

    // Capitalize first letter for non-CJK languages
    const formattedWord = NO_SPACE_LOCALES.includes(locale)
        ? randomWord
        : randomWord.charAt(0).toUpperCase() + randomWord.slice(1);

    // CJK languages don't use spaces
    const useSpace = !NO_SPACE_LOCALES.includes(locale);

    return useSpace ? `${formattedWord} ${suffix}` : `${formattedWord}${suffix}`;
}
