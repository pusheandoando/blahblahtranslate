// blahblahtranslate/popup.js





document.addEventListener('DOMContentLoaded', async () => {
    const languages = GoogleTranslateUnofficial.getLanguages(true);


    document.getElementById('open-page-view').addEventListener('click', () => {
        showView('view-page');
    });

    document.getElementById('open-translator-view').addEventListener('click', () => {
        showView('view-translator');
    });


    for (const backButton of document.querySelectorAll('[data-back]')) {
        backButton.addEventListener('click', () => {
            showView('view-main');
        });
    }


    hydrateIcons(document);

    const [pageView, translatorView] = await Promise.all([
        initPageView(languages),
        initTranslatorView(languages)
    ]);

    await initUserLanguageView(languages, (languageCode) => {
        pageView.setTargetLanguage(languageCode);
        translatorView.setTargetLanguage(languageCode);
    });
});