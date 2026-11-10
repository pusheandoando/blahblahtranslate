// blahblahtranslate/background/batch-translation.js





const LINE_SEPARATOR = '\n';
const LINE_SPLIT_PATTERN = /\r?\n/;





async function translateJoinedLines(texts, targetLanguage) {
    const joined = texts.join(LINE_SEPARATOR);
    const translated = await translateWithBackoff(joined, targetLanguage, AUTO_LANGUAGE);
    
    
    return translated.split(LINE_SPLIT_PATTERN).map((line) => line.trim());
}


async function tryTranslateJoinedLines(texts, targetLanguage) {
    try {
        const lines = await translateJoinedLines(texts, targetLanguage);
        
        if (lines.length === texts.length) {
            return lines;
        }
    } catch (error) {
        if (isTransientError(error)) {
            throw error;
        }
    }


    return null;
}


async function translateSingleLine(text, targetLanguage) {
    try {
        return await translateWithBackoff(text, targetLanguage, AUTO_LANGUAGE);
    } catch (error) {
        if (isTransientError(error)) {
            throw error;
        }


        return null;
    }
}


async function translateLines(texts, targetLanguage) {
    if (texts.length === 1) {
        return [await translateSingleLine(texts[0], targetLanguage)];
    }

    const lines = await tryTranslateJoinedLines(texts, targetLanguage);
    if (lines) {
        return lines;
    }

    const middle = Math.ceil(texts.length / 2);
    const firstHalf = await translateLines(texts.slice(0, middle), targetLanguage);
    const secondHalf = await translateLines(texts.slice(middle), targetLanguage);
    
    
    return firstHalf.concat(secondHalf);
}