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
 * Get a random word for wallet naming from BIP39 wordlist
 * @param locale Current locale (e.g. 'zh-CN', 'en')
 * @returns Formatted random word (e.g. 'Garden', '爱')
 */
export function getRandomWalletWord(locale: string): string {
    // Get wordlist for locale, fallback to English
    const wordlist = LOCALE_WORDLIST_MAP[locale] ?? wordlists.english!;

    // Pick a random word
    const randomWord = wordlist[Math.floor(Math.random() * wordlist.length)];

    // Capitalize first letter for non-CJK languages
    return NO_SPACE_LOCALES.includes(locale)
        ? randomWord
        : randomWord.charAt(0).toUpperCase() + randomWord.slice(1);
}

