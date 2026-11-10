// blahblahtranslate/shared/language-picker.js





const PICKER_SEARCH_PLACEHOLDER = 'Search language';
const PICKER_EMPTY_MESSAGE = 'No languages found';
const PICKER_ICON_SIZE = 14;





function createLanguagePicker({ ariaLabel, align = 'start', flip = false, onChange = () => {} }) {
    let options = [];
    let visibleOptions = [];
    let optionElements = [];
    let selectedCode = null;
    let activeIndex = -1;
    let panelOpen = false;


    
    const valueLabel = createElement('span', { className: 'bbt-picker-value' });

    const trigger = createElement(
        'button',
        {
            className: 'bbt-picker-trigger',
            attributes: {
                type: 'button',
                disabled: '',
                'aria-haspopup': 'listbox',
                'aria-expanded': 'false',
                'aria-label': ariaLabel
            }
        },
        [valueLabel, createIcon('chevron-down', PICKER_ICON_SIZE)]
    );

    const searchInput = createElement('input', {
        className: 'bbt-picker-input',
        attributes: {
            type: 'text',
            placeholder: PICKER_SEARCH_PLACEHOLDER,
            spellcheck: 'false',
            autocomplete: 'off',
            'aria-label': PICKER_SEARCH_PLACEHOLDER
        }
    });

    const search = createElement('div', { className: 'bbt-picker-search' }, [
        createIcon('search', PICKER_ICON_SIZE),
        searchInput
    ]);

    const list = createElement('div', {
        className: 'bbt-picker-list',
        attributes: { role: 'listbox' }
    });

    const panel = createElement('div', { className: 'bbt-picker-panel' }, [search, list]);
    
    const root = createElement('div', { className: 'bbt-picker' }, [trigger, panel]);
    


    if (align === 'end') {
        root.classList.add('bbt-picker-align-end');
    }



    function findOption(code) {
        return options.find((option) => option.code === code);
    }


    function setSelected(code) {
        const option = findOption(code);
        if (!option) {
            return;
        }

        selectedCode = code;
        valueLabel.textContent = option.label;
    }


    function buildOptionElement(option) {
        const isSelected = option.code === selectedCode;
        const children = [createElement('span', { className: 'bbt-picker-option-label', text: option.label })];

        if (isSelected) {
            children.push(createIcon('check', PICKER_ICON_SIZE));
        }

        const element = createElement(
            'div',
            {
                className: 'bbt-picker-option',
                attributes: {
                    role: 'option',
                    'aria-selected': String(isSelected),
                    'data-code': option.code
                }
            },
            children
        );

        if (isSelected) {
            element.classList.add('bbt-selected');
        }


        return element;
    }


    function renderOptions() {
        if (visibleOptions.length === 0) {
            optionElements = [];

            list.replaceChildren(
                createElement('div', { className: 'bbt-picker-empty', text: PICKER_EMPTY_MESSAGE })
            );

            return;
        }

        const fragment = document.createDocumentFragment();
        for (const option of visibleOptions) {
            fragment.appendChild(buildOptionElement(option));
        }

        list.replaceChildren(fragment);
        optionElements = Array.from(list.children);
    }


    function keepVisible(element) {
        const top = element.offsetTop;
        const bottom = top + element.offsetHeight;

        if (top < list.scrollTop) {
            list.scrollTop = top;
        } else if (bottom > list.scrollTop + list.clientHeight) {
            list.scrollTop = bottom - list.clientHeight;
        }
    }


    function centerOnElement(element) {
        list.scrollTop = element.offsetTop - (list.clientHeight - element.offsetHeight) / 2;
    }

    
    function setActiveIndex(index) {
        const previous = optionElements[activeIndex];
        if (previous) {
            previous.classList.remove('bbt-active');
        }

        activeIndex = index;
        const current = optionElements[activeIndex];
        
        if (!current) {
            return;
        }

        current.classList.add('bbt-active');
        keepVisible(current);
    }


    function moveActive(step) {
        if (visibleOptions.length === 0) {
            return;
        }

        const nextIndex = (activeIndex + step + visibleOptions.length) % visibleOptions.length;
        setActiveIndex(nextIndex);
    }


    function flipIfCramped() {
        const triggerBounds = trigger.getBoundingClientRect();
        const panelHeight = panel.getBoundingClientRect().height;
        const spaceBelow = document.documentElement.clientHeight - triggerBounds.bottom;
        const spaceAbove = triggerBounds.top;
        
        if (spaceBelow < panelHeight && spaceAbove > spaceBelow) {
            root.classList.add('bbt-picker-up');
        }
    }


    function handleOutsideMouseDown(event) {
        if (!root.contains(event.target)) {
            closePanel();
        }
    }


    function openPanel() {
        if (panelOpen || options.length === 0) {
            return;
        }

        panelOpen = true;
        searchInput.value = '';
        visibleOptions = options;
        activeIndex = -1;
        renderOptions();

        root.classList.remove('bbt-picker-up');
        root.classList.add('bbt-open');
        trigger.setAttribute('aria-expanded', 'true');
        
        if (flip) {
            flipIfCramped();
        }

        const selectedIndex = visibleOptions.findIndex((option) => option.code === selectedCode);
        setActiveIndex(Math.max(selectedIndex, 0));
        centerOnElement(optionElements[activeIndex]);
        searchInput.focus({ preventScroll: true });
        document.addEventListener('mousedown', handleOutsideMouseDown, true);
    }


    function closePanel() {
        if (!panelOpen) {
            return;
        }

        panelOpen = false;
        root.classList.remove('bbt-open');
        trigger.setAttribute('aria-expanded', 'false');
        document.removeEventListener('mousedown', handleOutsideMouseDown, true);
    }


    function chooseOption(code) {
        const hasChanged = code !== selectedCode;

        setSelected(code);
        closePanel();
        trigger.focus({ preventScroll: true });
        
        if (hasChanged) {
            onChange(code);
        }
    }


    function chooseActiveOption() {
        const option = visibleOptions[activeIndex];
        
        if (option) {
            chooseOption(option.code);
        }
    }


    function handleClosedKeydown(event) {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        openPanel();
    }


    function handleOpenKeydown(event) {
        if (event.isComposing) {
            return;
        }

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                event.stopPropagation();
                moveActive(1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                event.stopPropagation();
                moveActive(-1);
                break;
            case 'Enter':
                event.preventDefault();
                event.stopPropagation();
                chooseActiveOption();
                break;
            case 'Escape':
                event.preventDefault();
                event.stopPropagation();
                closePanel();
                trigger.focus({ preventScroll: true });
                break;
            case 'Tab':
                closePanel();
                break;
            default:
                break;
        }
    }


    function handleKeydown(event) {
        if (panelOpen) {
            handleOpenKeydown(event);
            return;
        }

        handleClosedKeydown(event);
    }


    function setOptions(newOptions) {
        options = newOptions;

        trigger.disabled = options.length === 0;

        if (options.length > 0) {
            setSelected(options[0].code);
        }
    }


    function setValue(code, fallbackCode) {
        if (findOption(code)) {
            setSelected(code);
            return;
        }

        setSelected(fallbackCode);
    }



    trigger.addEventListener('click', () => {
        if (panelOpen) {
            closePanel();
        } else {
            openPanel();
        }
    });


    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();

        visibleOptions = options.filter((option) => option.label.toLowerCase().includes(query));
        activeIndex = -1;
        renderOptions();
        list.scrollTop = 0;
        
        if (visibleOptions.length > 0) {
            setActiveIndex(0);
        }
    });


    list.addEventListener('click', (event) => {
        const optionElement = event.target.closest('.bbt-picker-option');
        
        if (!optionElement) {
            return;
        }
        
        chooseOption(optionElement.dataset.code);
    });


    root.addEventListener('keydown', handleKeydown);

    
    return {
        element: root,
        setOptions,
        setValue,
        getValue() {
            return selectedCode;
        },
        isOpen() {
            return panelOpen;
        },
        close: closePanel
    };
}