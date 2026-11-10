// blahblahtranslate/content.js





chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === MessageType.PING) {
        sendResponse(true);
    } else if (message.type === MessageType.START_PAGE_TRANSLATION) {
        translatePage(message.targetLanguage);
        sendResponse(true);
    } else if (message.type === MessageType.OPEN_QUICK_TRANSLATE) {
        openQuickTranslatePopover(message.text, message.editable);
        sendResponse(true);
    }


    return false;
});