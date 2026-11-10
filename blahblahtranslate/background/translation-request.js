// blahblahtranslate/background/translation-request.js





function isTransientError(error) {
    if (error.name === 'TooManyRequests') {
        return true;
    }
    
    if (error.name !== 'RequestFailed') {
        return false;
    }
    
    
    return !/HTTP 4\d\d/.test(error.message);
}


async function translateWithBackoff(text, targetLanguage, sourceLanguage) {
    for (let attempt = 0; attempt < RATE_LIMIT_MAX_RETRIES; attempt++) {
        try {
            return await GoogleTranslateUnofficial.translate(text, targetLanguage, sourceLanguage);
        } catch (error) {
            if (!isTransientError(error)) {
                throw error;
            }

            await delay(RATE_LIMIT_BASE_DELAY_MS * Math.pow(2, attempt));
        }
    }

    
    return GoogleTranslateUnofficial.translate(text, targetLanguage, sourceLanguage);
}