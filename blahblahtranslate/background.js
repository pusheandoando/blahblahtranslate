// blahblahtranslate/background.js
importScripts(
    'lib/google-translate-unofficial.global.js',
    'shared/constants.js',
    'shared/async-utils.js',
    'background/legacy-cache-cleanup.js',
    'background/translation-request.js',
    'background/batch-translation.js',
    'background/translation-service.js',
    'background/content-injection.js'
);





const CONTEXT_MENU_ID = 'bbt-open-quick-translate';
const TOP_FRAME_ID = 0;
const FAILURE_BADGE_MS = 4000;


const messageHandlers = {
    [MessageType.TRANSLATE_TEXT]: handleTranslateText,
    [MessageType.TRANSLATE_TEXTS]: handleTranslateTexts,
    [MessageType.GET_LANGUAGES]: handleGetLanguages,
    [MessageType.REQUEST_PAGE_TRANSLATION]: handleRequestPageTranslation
};





chrome.runtime.onInstalled.addListener(async () => {
    await chrome.contextMenus.removeAll();

    chrome.contextMenus.create({
        id: CONTEXT_MENU_ID,
        title: 'Open in Blah Blah Translate',
        contexts: ['selection']
    });


    await removeLegacyCacheEntries();
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== CONTEXT_MENU_ID || !tab) {
        return;
    }

    openQuickTranslate(info, tab.id).catch(() => {
        reportFailure(tab.id);
    });
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const handler = messageHandlers[message.type];
    if (!handler) {
        return false;
    }

    handler(message).then(sendResponse, (error) => {
        sendResponse({ error: error.message });
    });


    return true;
});





async function openQuickTranslate(info, tabId) {
    const editable = Boolean(info.editable);
    let frameId = TOP_FRAME_ID;

    if (editable && info.frameId) {
        frameId = info.frameId;
    }

    const message = {
        type: MessageType.OPEN_QUICK_TRANSLATE,
        text: info.selectionText,
        editable
    };

    try {
        await sendToContentScript(tabId, frameId, message);
    } catch (error) {
        if (frameId === TOP_FRAME_ID) {
            throw error;
        }

        await sendToContentScript(tabId, TOP_FRAME_ID, { ...message, editable: false });
    }
}


async function reportFailure(tabId) {
    try {
        await chrome.action.setBadgeBackgroundColor({ tabId, color: '#b3261e' });
        await chrome.action.setBadgeText({ tabId, text: '!' });
        await delay(FAILURE_BADGE_MS);
        await chrome.action.setBadgeText({ tabId, text: '' });
    } catch (error) {
        // the tab may have been closed or navigated while the badge was visible
    }
}


async function handleTranslateText({ text, targetLanguage, sourceLanguage }) {
    const result = await translateText(text, targetLanguage, sourceLanguage);


    return { result };
}


async function handleTranslateTexts({ texts, targetLanguage }) {
    const results = await translateTexts(texts, targetLanguage);


    return { results };
}


async function handleGetLanguages() {
    return { languages: GoogleTranslateUnofficial.getLanguages(true) };
}


async function handleRequestPageTranslation({ tabId, targetLanguage }) {
    try {
        await sendToContentScript(tabId, TOP_FRAME_ID, {
            type: MessageType.START_PAGE_TRANSLATION,
            targetLanguage
        });
    } catch (error) {
        return { error: 'This page cannot be translated. Reload the page and try again.' };
    }


    return { ok: true };
}