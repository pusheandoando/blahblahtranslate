// blahblahtranslate/content/selection-anchor.js





function captureSelectionAnchor() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return null;
    }

    const range = selection.getRangeAt(0).cloneRange();


    return () => range.getBoundingClientRect();
}