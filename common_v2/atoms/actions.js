import { formatNumericControl, isNumericControl, normalizeNumericControl } from './numeric.js';
// One delegated action boundary for all common_v2 screens.
// Screen-specific business decisions stay in their screen controller.
export function bindActions(root, onAction, { signal } = {}) {
    const listener = event => {
        const button = event.target?.closest?.('button');
        if (!button || !root.contains(button) || button.disabled || button.getAttribute('aria-disabled') === 'true')
            return;
        const action = button.dataset.action ?? '';
        if (!action && !button.dataset.sort)
            return;
        onAction(action, button, event);
    };
    root.addEventListener('click', listener, signal ? { signal } : undefined);
    return () => root.removeEventListener('click', listener);
}
// Keep native disabled and accessible state in sync for dynamic changes.
export function setButtonDisabled(button, disabled) {
    if (!button)
        return;
    button.disabled = Boolean(disabled);
    if (disabled)
        button.setAttribute('aria-disabled', 'true');
    else
        button.removeAttribute('aria-disabled');
}
// One delegated input/change boundary; keep focus and caret during edits.
export function bindInputs(root, onInput, { signal } = {}) {
    const listener = event => {
        const target = event.target;
        if (!target || !root.contains(target))
            return;
        // Modules always receive raw numeric strings, never display separators.
        if (isNumericControl(target))
            normalizeNumericControl(target);
        onInput(event, target);
    };
    const options = signal ? { signal } : undefined;
    root.addEventListener('input', listener, options);
    root.addEventListener('change', listener, options);
    const formatOnBlur = event => {
        if (root.contains(event.target))
            formatNumericControl(event.target);
    };
    root.addEventListener('focusout', formatOnBlur, options);
    return () => {
        root.removeEventListener('input', listener);
        root.removeEventListener('change', listener);
        root.removeEventListener('focusout', formatOnBlur);
    };
}
// Shared edit state -> save button binding. Diff calculation stays pluggable.
export function syncDirtyButton(root, action, isDirty) {
    const button = [...root.querySelectorAll('button[data-action]')]
        .find(node => node.dataset.action === action);
    setButtonDisabled(button, !isDirty);
}
// Shared totals DOM update for TYPE A registration/editing.
export function syncTotals(root, amounts) {
    const nodes = root.querySelectorAll('.cv2-totals-inline strong, .cv2-totals strong');
    [amounts.supply, amounts.tax, amounts.total].forEach((value, index) => {
        if (nodes[index])
            nodes[index].textContent = Number(value || 0).toLocaleString('ko-KR');
    });
}
