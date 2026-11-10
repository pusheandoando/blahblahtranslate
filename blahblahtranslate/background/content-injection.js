// blahblahtranslate/background/content-injection.js





const CONTENT_SCRIPT_FILES = [
    'shared/constants.js',
    'shared/languages.js',
    'shared/prefs.js',
    'shared/async-utils.js',
    'shared/manual-translation.js',
    'shared/dom-builder.js',
    'shared/icons.js',
    'shared/language-picker.js',
    'content/background-client.js',
    'content/edit-target.js',
    'content/selection-anchor.js',
    'content/popover-position.js',
    'content/popover-resize.js',
    'content/progress-bar.js',
    'content/page-slots.js',
    'content/page-translation.js',
    'content/quick-translate-popover.js',
    'content.js'
];

const CONTENT_STYLE_FILES = ['shared/theme.css', 'shared/language-picker.css', 'content.css'];





async function isContentScriptReady(tabId, frameId) {
    try {
        await chrome.tabs.sendMessage(tabId, { type: MessageType.PING }, { frameId });
        return true;
    } catch (error) {
        return false;
    }
}


async function ensureContentScript(tabId, frameId) {
    if (await isContentScriptReady(tabId, frameId)) {
        return;
    }

    const target = { tabId, frameIds: [frameId] };
    await chrome.scripting.insertCSS({ target, files: CONTENT_STYLE_FILES });
    await chrome.scripting.executeScript({ target, files: CONTENT_SCRIPT_FILES });
}


async function sendToContentScript(tabId, frameId, message) {
    await ensureContentScript(tabId, frameId);
    
    
    return chrome.tabs.sendMessage(tabId, message, { frameId });
}