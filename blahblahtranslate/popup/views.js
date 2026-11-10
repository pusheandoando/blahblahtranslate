// blahblahtranslate/popup/views.js





function showView(viewId) {
    for (const view of document.querySelectorAll('.view')) {
        view.hidden = view.id !== viewId;
    }
}