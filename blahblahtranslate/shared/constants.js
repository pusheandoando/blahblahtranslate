// blahblahtranslate/shared/constants.js





const MessageType = {
    PING: 'bbt:ping',
    TRANSLATE_TEXT: 'bbt:translateText',
    TRANSLATE_TEXTS: 'bbt:translateTexts',
    GET_LANGUAGES: 'bbt:getLanguages',
    REQUEST_PAGE_TRANSLATION: 'bbt:requestPageTranslation',
    START_PAGE_TRANSLATION: 'bbt:startPageTranslation',
    OPEN_QUICK_TRANSLATE: 'bbt:openQuickTranslate'
};


const AUTO_LANGUAGE = 'auto';
const FALLBACK_TARGET_LANGUAGE = 'en';
const PREFS_STORAGE_KEY = 'prefs';


const REQUEST_TIMEOUT_MS = 60 * 1000;
const RATE_LIMIT_MAX_RETRIES = 3;
const RATE_LIMIT_BASE_DELAY_MS = 1000;


const PAGE_CHUNK_MAX_CHARS = 3000;
const PAGE_CHUNK_MAX_ITEMS = 40;
const PAGE_CONCURRENCY = 2;
const PAGE_MAX_RETRIES = 3;
const PAGE_RETRY_DELAY_MS = 1000;