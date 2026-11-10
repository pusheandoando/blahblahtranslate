// blahblahtranslate/content/progress-bar.js





const PROGRESS_BAR_ID = 'bbt-progress';





function createProgressBar(onCancel) {
    const existing = document.getElementById(PROGRESS_BAR_ID);
    if (existing) {
        existing.remove();
    }

    let finished = false;


    const label = createElement('span', { className: 'bbt-progress-label', text: 'Translating... 0%' });

    const cancelButton = createElement('button', {
        className: 'bbt-progress-cancel',
        text: 'Cancel',
        attributes: { type: 'button' }
    });

    const header = createElement('div', { className: 'bbt-progress-header' }, [label, cancelButton]);

    const fill = createElement('span', { className: 'bbt-progress-fill' });

    const track = createElement('span', { className: 'bbt-progress-track' }, [fill]);

    const container = createElement(
        'div',
        { id: PROGRESS_BAR_ID, className: 'bbt-theme', attributes: { translate: 'no' } },
        [header, track]
    );


    cancelButton.addEventListener('click', () => {
        onCancel();
    });

    document.documentElement.appendChild(container);


    return {
        update(percent) {
            if (finished) {
                return;
            }

            label.textContent = 'Translating - ' + percent + '%';
            fill.style.width = percent + '%';
        },
        finish(message, lingerMs) {
            finished = true;
            label.textContent = message;
            cancelButton.remove();
            setTimeout(() => container.remove(), lingerMs);
        }
    };
}