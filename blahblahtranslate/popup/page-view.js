// blahblahtranslate/popup/page-view.js





async function requestPageTranslation(targetLanguage) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || tab.id === undefined) {
        return { error: 'No active tab found.' };
    }

    try {
        const response = await chrome.runtime.sendMessage({
            type: MessageType.REQUEST_PAGE_TRANSLATION,
            tabId: tab.id,
            targetLanguage
        });

        if (!response) {
            return { error: 'No response from the extension.' };
        }

        return response;
    } catch (error) {
        return { error: error.message };
    }
}


async function initPageView(languages) {
    const targetHost = document.getElementById('page-target-language');
    const startButton = document.getElementById('start-page-translation-button');
    const status = document.getElementById('page-status');

    const targetPicker = createLanguagePicker({ ariaLabel: 'Target language' });
    targetPicker.setOptions(buildLanguageOptions(languages, false));
    targetHost.appendChild(targetPicker.element);

    const prefs = await loadPrefs();
    targetPicker.setValue(prefs.pageTargetLanguage, resolveUserLanguage(prefs));

    startButton.addEventListener('click', async () => {
        status.textContent = '';
        startButton.disabled = true;

        const targetLanguage = targetPicker.getValue();
        await savePrefs({ pageTargetLanguage: targetLanguage });

        const response = await requestPageTranslation(targetLanguage);
        if (response.error) {
            status.textContent = response.error;
            startButton.disabled = false;
            return;
        }

        window.close();
    });

    
    return {
        setTargetLanguage(languageCode) {
            targetPicker.setValue(languageCode, FALLBACK_TARGET_LANGUAGE);
        }
    };
}