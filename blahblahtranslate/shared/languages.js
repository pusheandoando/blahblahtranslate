// blahblahtranslate/shared/languages.js





function formatLanguageName(name) {
    return name.replace(/(^|[\s(])(\p{L})/gu, (match, boundary, letter) => {
        return boundary + letter.toUpperCase();
    });
}


function buildLanguageOptions(languages, includeAuto) {
    const options = [];
    
    if (includeAuto) {
        options.push({ code: AUTO_LANGUAGE, label: 'Auto-detect' });
    }

    for (const [name, code] of Object.entries(languages)) {
        options.push({ code, label: formatLanguageName(name) });
    }

    
    return options;
}