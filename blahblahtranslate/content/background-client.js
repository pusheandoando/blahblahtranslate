// blahblahtranslate/content/background-client.js





let cachedLanguages = null;





async function sendRequest(message) {
    const response = await withTimeout(chrome.runtime.sendMessage(message), REQUEST_TIMEOUT_MS);
    
    if (!response) {
        throw new Error('No response from the extension');
    }
    
    if (response.error) {
        throw new Error(response.error);
    }
    
    
    return response;
}


async function requestTranslation(text, targetLanguage, sourceLanguage) {
    const response = await sendRequest({
        type: MessageType.TRANSLATE_TEXT,
        text,
        targetLanguage,
        sourceLanguage
    });
    
    
    return response.result;
}


async function requestTranslations(texts, targetLanguage) {
    const response = await sendRequest({
        type: MessageType.TRANSLATE_TEXTS,
        texts,
        targetLanguage
    });


    return response.results;
}


async function requestLanguages() {
    if (!cachedLanguages) {
        const response = await sendRequest({ type: MessageType.GET_LANGUAGES });
        cachedLanguages = response.languages;
    }
    
    
    return cachedLanguages;
}