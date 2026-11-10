// blahblahtranslate/shared/prefs.js





async function loadPrefs() {
    const stored = await chrome.storage.local.get(PREFS_STORAGE_KEY);
    
    
    return stored[PREFS_STORAGE_KEY] || {};
}


function resolveUserLanguage(prefs) {
    return prefs.userLanguage || FALLBACK_TARGET_LANGUAGE;
}


async function savePrefs(partialPrefs) {
    const currentPrefs = await loadPrefs();
    
    await chrome.storage.local.set({
        [PREFS_STORAGE_KEY]: { ...currentPrefs, ...partialPrefs }
    });
}