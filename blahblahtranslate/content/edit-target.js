// blahblahtranslate/content/edit-target.js





const EDITABLE_INPUT_TYPES = new Set(['text', 'search', 'url', 'tel']);





function getDeepActiveElement() {
    let element = document.activeElement;
    
    while (element && element.shadowRoot && element.shadowRoot.activeElement) {
        element = element.shadowRoot.activeElement;
    }


    return element;
}


function isTextField(element) {
    if (element instanceof HTMLTextAreaElement) {
        return true;
    }


    return element instanceof HTMLInputElement && EDITABLE_INPUT_TYPES.has(element.type);
}


function captureTextFieldTarget(field) {
    const start = field.selectionStart;
    const end = field.selectionEnd;
    
    if (start === end) {
        return null;
    }


    return {
        selectedText: field.value.slice(start, end),
        getAnchorRect() {
            return field.getBoundingClientRect();
        },
        replace(text) {
            field.focus();
            field.setSelectionRange(start, end);
            if (document.execCommand('insertText', false, text)) {
                return;
            }
            field.setRangeText(text, start, end, 'end');
            field.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };
}


function captureContentEditableTarget(element) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return null;
    }

    const range = selection.getRangeAt(0).cloneRange();
    
    
    return {
        selectedText: selection.toString(),
        getAnchorRect() {
            return range.getBoundingClientRect();
        },
        replace(text) {
            element.focus();
            selection.removeAllRanges();
            selection.addRange(range);
            if (document.execCommand('insertText', false, text)) {
                return;
            }
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };
}


function captureEditTarget() {
    const element = getDeepActiveElement();
    
    if (!element) {
        return null;
    }
    
    if (isTextField(element)) {
        return captureTextFieldTarget(element);
    }
    
    if (element.isContentEditable) {
        return captureContentEditableTarget(element);
    }
    
    
    return null;
}


function capturePageSelectionTarget() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return null;
    }

    const range = selection.getRangeAt(0).cloneRange();
    
    
    return {
        replace(text) {
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
        }
    };
}