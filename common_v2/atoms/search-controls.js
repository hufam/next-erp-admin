// Generic search behavior. No ERP tables, field names, or RPCs belong here.
const str = value => String(value ?? '');
export const searchDefaults = fields => Object.fromEntries(fields.map(f => [f.id, f.default ?? '']));
export function validateSearchRange(fields, values) {
    const errors = [];
    for (const field of fields) {
        if (field.match !== 'from' || !field.key)
            continue;
        const end = fields.find(f => f.key === field.key && f.match === 'to');
        if (end && values[field.id] && values[end.id] && str(values[field.id]) > str(values[end.id])) {
            errors.push(`${field.label}은(는) ${end.label}보다 늦을 수 없습니다.`);
        }
    }
    return errors;
}
export function availableOptions(field, values) {
    const options = field.options || [];
    if (!field.dependsOn || !str(values[field.dependsOn]))
        return options;
    const parent = str(values[field.dependsOn]);
    return options.filter(o => typeof o !== 'object' || (o.parentValue === undefined && o.parentLabel === undefined) || (o.parentValue !== undefined && str(o.parentValue) === parent) || (o.parentLabel !== undefined && str(o.parentLabel) === parent));
}
export function resolveSearchValues(fields, values) {
    const result = { ...values };
    for (const field of fields) {
        if (field.type !== 'autocomplete')
            continue;
        const typed = str(values[field.id]).trim();
        if (!typed) {
            result[field.id] = '';
            continue;
        }
        const options = availableOptions(field, values);
        const found = options.find(o => str(typeof o === 'object' ? o.label : o) === typed);
        result[field.id] = found && typeof found === 'object' ? found.value : typed;
    }
    return result;
}
// Only refresh dependent controls; do not redraw the form while typing (caret preservation).
export function syncDependentSearchControls(root, fields, values, changedId) {
    const pending = [changedId];
    const seen = new Set();
    while (pending.length) {
        const parent = pending.shift();
        if (seen.has(parent))
            continue;
        seen.add(parent);
        for (const field of fields.filter(f => f.dependsOn === parent)) {
            values[field.id] = '';
            const element = [...root.querySelectorAll('[data-filter]')].find(el => el.dataset.filter === field.id);
            if (element) {
                element.value = '';
                const opts = availableOptions(field, values);
                if (element.tagName === 'SELECT') {
                    element.replaceChildren(new Option('전체', ''));
                    for (const o of opts)
                        element.add(new Option(typeof o === 'object' ? o.label : o, typeof o === 'object' ? o.value : o));
                }
                else if (field.type === 'autocomplete') {
                    const popup = element.closest('.cv2-autocomplete')?.querySelector('.cv2-autocomplete-options');
                    if (popup) {
                        popup.replaceChildren();
                        popup.hidden = true;
                    }
                }
            }
            pending.push(field.id);
        }
    }
}
// One reusable dropdown controller; module files provide options only.
export function bindSearchAutocomplete(root, fields, values, onSelect, { signal } = {}) {
    const getField = input => fields.find(f => (input?.dataset?.filter === f.id && (!f.scope || f.scope === 'filter') || ((input?.dataset?.scope === 'header' || input?.dataset?.scope === 'item') && input?.dataset?.key === f.id && (!f.scope || f.scope === input.dataset.scope))) && f.type === 'autocomplete');
    // Item grids are horizontally scrollable; their overflow clips an in-cell popup.
    // A shared body-level popup is used only for item inputs, preserving all legacy
    // filter/header autocomplete behavior and public API.
    const itemPopup = document.createElement('div');
    itemPopup.className = 'cv2-autocomplete-options';
    itemPopup.setAttribute('role', 'listbox');
    itemPopup.hidden = true;
    itemPopup.style.position = 'fixed';
    itemPopup.style.zIndex = '10000';
    document.body.append(itemPopup);
    let itemInput = null;
    const popupFor = input => input?.dataset?.scope === 'item' ? itemPopup : input.closest('.cv2-autocomplete')?.querySelector('.cv2-autocomplete-options');
    const positionItemPopup = input => {
        const rect = input.getBoundingClientRect();
        itemPopup.style.left = `${rect.left}px`;
        itemPopup.style.top = `${rect.bottom + 2}px`;
        itemPopup.style.width = `${rect.width}px`;
        itemInput = input;
    };
    signal?.addEventListener('abort', () => itemPopup.remove(), { once: true });
    const closeAll = (except) => { root.querySelectorAll('.cv2-autocomplete-options').forEach(p => { if (p !== except)
        p.hidden = true; }); if (itemPopup !== except)
        itemPopup.hidden = true; };
    const render = (input, showAll = false) => {
        const field = getField(input), popup = popupFor(input);
        if (!field || !popup)
            return;
        if (input.dataset.scope === 'item')
            positionItemPopup(input);
        const query = input.value.trim().toLocaleLowerCase();
        const all = [...availableOptions(field, values)].sort((a, b) => str(typeof a === 'object' ? a.label : a).localeCompare(str(typeof b === 'object' ? b.label : b), 'ko', { numeric: true, sensitivity: 'base' }));
        const matches = all.filter(o => showAll || str(typeof o === 'object' ? o.label : o).toLocaleLowerCase().includes(query));
        popup.replaceChildren();
        const list = document.createElement('div');
        list.className = 'cv2-autocomplete-list';
        for (const option of matches) {
            const label = str(typeof option === 'object' ? option.label : option);
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'cv2-autocomplete-option';
            item.setAttribute('role', 'option');
            item.textContent = label;
            item.dataset.value = label;
            item.dataset.id = str(typeof option === 'object' ? option.value : option);
            item.setAttribute('aria-selected', String(label === input.value));
            if (label === input.value)
                item.classList.add('cv2-autocomplete-option--active');
            list.append(item);
        }
        popup.append(list);
        const count = document.createElement('div');
        count.className = 'cv2-autocomplete-count';
        count.textContent = `전체 ${all.length}건 · 표시 ${matches.length}건`;
        popup.append(count);
        closeAll(popup);
        popup.hidden = matches.length === 0;
    };
    const opts = signal ? { signal } : undefined;
    // Keep focus on the input while clicking a candidate. Otherwise the browser
    // moves focus to the option and focusing the input again reopens the list.
    document.addEventListener('pointerdown', e => {
        if (e.target instanceof Element && e.target.closest('.cv2-autocomplete-option') && (root.contains(e.target) || itemPopup.contains(e.target)))
            e.preventDefault();
    }, opts);
    root.addEventListener('focusin', e => { if (getField(e.target))
        render(e.target, true); }, opts);
    root.addEventListener('input', e => { if (getField(e.target))
        render(e.target); }, opts);
    root.addEventListener('keydown', e => {
        const input = e.target, field = getField(input);
        if (!field)
            return;
        const popup = popupFor(input);
        if (e.key === 'Escape') {
            if (popup)
                popup.hidden = true;
            return;
        }
        if (!popup || popup.hidden) {
            if (e.key === 'ArrowDown') {
                render(input, true);
                e.preventDefault();
            }
            return;
        }
        const items = [...popup.querySelectorAll('.cv2-autocomplete-option')];
        const current = items.findIndex(el => el.classList.contains('cv2-autocomplete-option--active'));
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const next = (current + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
            items.forEach(el => { el.classList.remove('cv2-autocomplete-option--active'); el.setAttribute('aria-selected', 'false'); });
            items[next]?.classList.add('cv2-autocomplete-option--active');
            items[next]?.setAttribute('aria-selected', 'true');
            items[next]?.scrollIntoView({ block: 'nearest' });
        }
        else if (e.key === 'Enter' && current >= 0) {
            e.preventDefault();
            input.value = items[current].dataset.value;
            popup.hidden = true;
            onSelect(field.id, input.value, input.dataset.filter ? 'filter' : input.dataset.scope || 'header', Number(input.dataset.index || 0), items[current].dataset.id);
        }
    }, opts);
    const handleSelectionClick = e => {
        const option = e.target.closest?.('.cv2-autocomplete-option');
        if (option && (root.contains(option) || itemPopup.contains(option))) {
            const input = itemPopup.contains(option) ? itemInput : option.closest('.cv2-autocomplete')?.querySelector('input[data-filter], input[data-scope="header"][data-key], input[data-scope="item"][data-key]');
            if (input) {
                input.value = option.dataset.value;
                const popup = popupFor(input);
                if (popup)
                    popup.hidden = true;
                onSelect(input.dataset.filter || input.dataset.key, input.value, input.dataset.filter ? 'filter' : input.dataset.scope || 'header', Number(input.dataset.index || 0), option.dataset.id);
            }
        }
        else if (!e.target.closest?.('.cv2-autocomplete'))
            closeAll();
    };
    document.addEventListener('click', handleSelectionClick, opts);
}
