// blahblahtranslate/popup/translator-view.js





async function initTranslatorView(languages) {
    const sourceHost = document.getElementById('translator-source');
    const targetHost = document.getElementById('translator-target');
    const swapButton = document.getElementById('swap-languages-button');
    const translateButton = document.getElementById('translate-button');
    const input = document.getElementById('translator-input');
    const output = document.getElementById('translator-output');
    let lastTranslation = '';


    const sourcePicker = createLanguagePicker({
        ariaLabel: 'Source language',
        onChange: handleLanguageChange
    });
    const targetPicker = createLanguagePicker({
        ariaLabel: 'Target language',
        align: 'end',
        onChange: handleLanguageChange
    });
    sourcePicker.setOptions(buildLanguageOptions(languages, true));
    targetPicker.setOptions(buildLanguageOptions(languages, false));
    sourceHost.appendChild(sourcePicker.element);
    targetHost.appendChild(targetPicker.element);


    const prefs = await loadPrefs();
    sourcePicker.setValue(prefs.translatorSourceLanguage, AUTO_LANGUAGE);
    targetPicker.setValue(prefs.translatorTargetLanguage, resolveUserLanguage(prefs));


    const manualTranslation = createManualTranslation({
        translate: (text, targetLanguage, sourceLanguage) => {
            return withTimeout(
                GoogleTranslateUnofficial.translate(text, targetLanguage, sourceLanguage),
                REQUEST_TIMEOUT_MS
            );
        },
        readRequest: () => ({
            text: input.value.trim(),
            targetLanguage: targetPicker.getValue(),
            sourceLanguage: sourcePicker.getValue()
        }),
        onStart: () => {
            translateButton.disabled = true;
            output.value = 'Translating...';
        },
        onResult: (result) => {
            lastTranslation = result;
            output.value = result;
        },
        onError: (error) => {
            lastTranslation = '';
            output.value = 'Error: ' + error.message;
        },
        onFinish: () => {
            translateButton.disabled = false;
        }
    });


    function updateSwapState() {
        swapButton.disabled = sourcePicker.getValue() === AUTO_LANGUAGE;
    }


    function handleLanguageChange() {
        savePrefs({
            translatorSourceLanguage: sourcePicker.getValue(),
            translatorTargetLanguage: targetPicker.getValue()
        });
        updateSwapState();
    }


    function handleSwap() {
        const previousSource = sourcePicker.getValue();

        sourcePicker.setValue(targetPicker.getValue());
        targetPicker.setValue(previousSource);
        
        if (lastTranslation) {
            input.value = lastTranslation;
            output.value = '';
            lastTranslation = '';
        }

        handleLanguageChange();
    }


    translateButton.addEventListener('click', () => {
        manualTranslation.run();
    });


    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            manualTranslation.run();
        }
    });

    
    swapButton.addEventListener('click', handleSwap);
    updateSwapState();
    
    
    return {
        setTargetLanguage(languageCode) {
            targetPicker.setValue(languageCode, FALLBACK_TARGET_LANGUAGE);
        }
    };
}