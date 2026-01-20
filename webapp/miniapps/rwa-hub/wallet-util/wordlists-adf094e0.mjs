const ALL_LANGUAGE = [
    'english',
    'japanese',
    'chinese_simplified',
    'chinese_traditional',
    'czech',
    'french',
    'italian',
    'korean',
    'portuguese',
    'spanish',
];

const getWordList = async (language) => {
    switch (language) {
        case 'chinese_simplified':
            return (await import('./wordlists/chinese_simplified.mjs')).default;
        case 'chinese_traditional':
            return (await import('./wordlists/chinese_traditional.mjs')).default;
        case 'czech':
            return (await import('./wordlists/czech.mjs')).default;
        case 'english':
            // case 'EN':
            return (await import('./wordlists/english.mjs')).default;
        case 'french':
            return (await import('./wordlists/french.mjs')).default;
        case 'italian':
            return (await import('./wordlists/italian.mjs')).default;
        case 'japanese':
            // case 'JA':
            return (await import('./wordlists/japanese.mjs')).default;
        case 'korean':
            return (await import('./wordlists/korean.mjs')).default;
        case 'portuguese':
            return (await import('./wordlists/portuguese.mjs')).default;
        case 'spanish':
            return (await import('./wordlists/spanish.mjs')).default;
    }
    throw new Error(`unsupport language: ${language}`);
};
const WORDLISTS_MAP = new Map();
let DEFAULT_WORDLIST;
function setDefaultWordlist(language, wordlist) {
    if (wordlist === undefined) {
        wordlist = WORDLISTS_MAP.get(language);
    }
    if (wordlist === undefined) {
        throw new Error(`need load wordList first, call \`await getWordList('${language}')\`.`);
    }
    // void getWordList(language);
    DEFAULT_WORDLIST = { language, wordlist };
}
function getDefaultWordlist() {
    return DEFAULT_WORDLIST;
}

export { ALL_LANGUAGE, getDefaultWordlist, getWordList, setDefaultWordlist };
//# sourceMappingURL=wordlists-adf094e0.mjs.map
