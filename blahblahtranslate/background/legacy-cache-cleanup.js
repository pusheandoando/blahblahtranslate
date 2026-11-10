// blahblahtranslate/background/legacy-cache-cleanup.js





const LEGACY_CACHE_PREFIX = 'tc:';





// entries written by earlier versions that cached page translations
async function removeLegacyCacheEntries() {
    const everything = await chrome.storage.local.get(null);
    const legacyKeys = Object.keys(everything).filter((key) => key.startsWith(LEGACY_CACHE_PREFIX));
    
    if (legacyKeys.length > 0) {
        await chrome.storage.local.remove(legacyKeys);
    }
}