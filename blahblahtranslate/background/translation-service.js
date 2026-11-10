// blahblahtranslate/background/translation-service.js





async function translateText(text, targetLanguage, sourceLanguage = AUTO_LANGUAGE) {
    return translateWithBackoff(text, targetLanguage, sourceLanguage);
}


async function translateTexts(texts, targetLanguage) {
    if (texts.length === 0) {
        return [];
    }

    
    return translateLines(texts, targetLanguage);
}