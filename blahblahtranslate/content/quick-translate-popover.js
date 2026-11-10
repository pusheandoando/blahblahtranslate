// blahblahtranslate/content/quick-translate-popover.js





const POPOVER_ID = 'bbt-popover';


let detachPopoverListeners = null;





function closeQuickTranslatePopover() {
    const popover = document.getElementById(POPOVER_ID);
    if (popover) {
        popover.remove();
    }

    if (detachPopoverListeners) {
        detachPopoverListeners();
        detachPopoverListeners = null;
    }
}


function buildQuickTranslateView(showReplaceButton, showReplaceOriginalButton, onLanguageChange) {
    const closeButton = createElement(
        'button',
        {
            className: 'bbt-button bbt-close',
            attributes: { type: 'button', 'aria-label': 'Close' }
        },
        [createIcon('x', 14)]
    );
    
    const header = createElement('div', { className: 'bbt-popover-header' }, [
        createElement('span', { className: 'bbt-popover-title', text: 'Blah Blah Translate' }),
        closeButton
    ]);

    const languagePicker = createLanguagePicker({
        ariaLabel: 'Target language',
        flip: true,
        onChange: onLanguageChange
    });

    const runButton = createElement('button', {
        className: 'bbt-button bbt-primary bbt-run',
        text: 'Translate',
        attributes: { type: 'button', disabled: '' }
    });

    const controls = createElement('div', { className: 'bbt-popover-controls' }, [
        createElement('span', { className: 'bbt-label', text: 'Translate to' }),
        languagePicker.element,
        runButton
    ]);

    const sourceText = createElement('textarea', {
        className: 'bbt-textarea',
        attributes: { spellcheck: 'false', 'aria-label': 'Original text' }
    });

    const output = createElement('textarea', {
        className: 'bbt-textarea bbt-output',
        attributes: {
            readonly: '',
            spellcheck: 'false',
            placeholder: 'Translation',
            'aria-label': 'Translation'
        }
    });

    const panels = createElement('div', { className: 'bbt-popover-panels' }, [sourceText, output]);



    const popoverChildren = [header, controls];
    let replaceOriginalButton = null;

    if (showReplaceOriginalButton) {
        replaceOriginalButton = createElement('button', {
            className: 'bbt-button bbt-text-button',
            text: 'Translate and replace original',
            attributes: { type: 'button' }
        });
        popoverChildren.push(
            createElement('div', { className: 'bbt-popover-secondary' }, [replaceOriginalButton])
        );
    }
    popoverChildren.push(panels);


    let replaceButton = null;
    if (showReplaceButton) {
        replaceButton = createElement('button', {
            className: 'bbt-button bbt-primary',
            text: 'Replace selection',
            attributes: { type: 'button', disabled: '' }
        });
        popoverChildren.push(replaceButton);
    }


    const resizeHandle = createElement('div', {
        className: 'bbt-resize-handle',
        attributes: { title: 'Drag to resize' }
    });
    popoverChildren.push(resizeHandle);


    const popover = createElement(
        'div',
        {
            id: POPOVER_ID,
            className: 'bbt-theme',
            attributes: { role: 'dialog', 'aria-label': 'Blah Blah Translate', translate: 'no' }
        },
        popoverChildren
    );


    return {
        popover,
        closeButton,
        languagePicker,
        runButton,
        sourceText,
        output,
        replaceButton,
        replaceOriginalButton,
        resizeHandle
    };
}


async function loadPopoverLanguages(view, manualTranslation) {
    try {
        const languages = await requestLanguages();
        const prefs = await loadPrefs();

        view.languagePicker.setOptions(buildLanguageOptions(languages, false));
        view.languagePicker.setValue(prefs.modalTargetLanguage, resolveUserLanguage(prefs));
        view.runButton.disabled = false;
        manualTranslation.run();
    } catch (error) {
        view.output.value = 'Error: ' + error.message;
    }
}


function openQuickTranslatePopover(selectedText, editable) {
    closeQuickTranslatePopover();

    let editTarget = null;
    if (editable) {
        editTarget = captureEditTarget();
    }

    let replaceTarget = editTarget;
    if (!replaceTarget) {
        replaceTarget = capturePageSelectionTarget();
    }

    let readAnchorRect = captureSelectionAnchor();
    if (editTarget) {
        readAnchorRect = editTarget.getAnchorRect;
    }

    const view = buildQuickTranslateView(editTarget !== null, replaceTarget !== null, (languageCode) => {
        savePrefs({ modalTargetLanguage: languageCode });
    });

    view.sourceText.value = selectedText || '';

    if (editTarget) {
        view.sourceText.value = editTarget.selectedText;
    }


    function setReplaceEnabled(enabled) {
        if (view.replaceButton) {
            view.replaceButton.disabled = !enabled;
        }
    }


    const manualTranslation = createManualTranslation({
        translate: requestTranslation,
        readRequest: () => ({
            text: view.sourceText.value.trim(),
            targetLanguage: view.languagePicker.getValue(),
            sourceLanguage: AUTO_LANGUAGE
        }),
        onStart: () => {
            view.runButton.disabled = true;
            view.output.value = 'Translating...';
            setReplaceEnabled(false);
        },
        onResult: (result) => {
            view.output.value = result;
            setReplaceEnabled(result !== '');
        },
        onError: (error) => {
            view.output.value = 'Error: ' + error.message;
            setReplaceEnabled(false);
        },
        onFinish: () => {
            view.runButton.disabled = false;
        }
    });


    async function translateAndReplaceOriginal() {
        const translation = await manualTranslation.run();
        if (!translation || !view.popover.isConnected) {
            return;
        }

        replaceTarget.replace(translation);
        closeQuickTranslatePopover();
    }


    const positioner = createPopoverPositioner(view.popover, readAnchorRect);


    view.closeButton.addEventListener('click', closeQuickTranslatePopover);
    view.runButton.addEventListener('click', () => {
        manualTranslation.run();
    });
    view.sourceText.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            manualTranslation.run();
        }
    });

    if (view.replaceButton) {
        view.replaceButton.addEventListener('click', () => {
            editTarget.replace(view.output.value);
            closeQuickTranslatePopover();
        });
    }

    if (view.replaceOriginalButton) {
        view.replaceOriginalButton.addEventListener('click', () => {
            translateAndReplaceOriginal();
        });
    }

    attachPopoverResizeHandle(view.popover, view.resizeHandle, positioner.stop);


    function handleKeydown(event) {
        if (event.key !== 'Escape' || view.languagePicker.isOpen()) {
            return;
        }

        event.stopPropagation();
        closeQuickTranslatePopover();
    }


    function handleOutsideMouseDown(event) {
        if (!view.popover.contains(event.target)) {
            closeQuickTranslatePopover();
        }
    }

    
    document.addEventListener('keydown', handleKeydown, true);
    document.addEventListener('mousedown', handleOutsideMouseDown, true);
    positioner.start();
    detachPopoverListeners = () => {
        document.removeEventListener('keydown', handleKeydown, true);
        document.removeEventListener('mousedown', handleOutsideMouseDown, true);
        positioner.stop();
        view.languagePicker.close();
    };

    document.documentElement.appendChild(view.popover);
    positioner.update();
    view.sourceText.focus({ preventScroll: true });
    loadPopoverLanguages(view, manualTranslation);
}