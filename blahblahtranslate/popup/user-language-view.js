// blahblahtranslate/popup/user-language-view.js





async function initUserLanguageView(languages, onLanguageChange) {
    const host = document.getElementById('user-language');

    const picker = createLanguagePicker({
        ariaLabel: 'Your language',
        onChange: async (languageCode) => {
            await savePrefs({
                userLanguage: languageCode,
                pageTargetLanguage: languageCode,
                modalTargetLanguage: languageCode,
                translatorTargetLanguage: languageCode
            });
            onLanguageChange(languageCode);
        }
    });
    picker.setOptions(buildLanguageOptions(languages, false));
    host.appendChild(picker.element);

    const prefs = await loadPrefs();
    picker.setValue(resolveUserLanguage(prefs), FALLBACK_TARGET_LANGUAGE);
}