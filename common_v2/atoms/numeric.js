/**
 * Shared numeric input helpers.
 *
 * Numeric values in business state and RPC payloads remain unformatted strings.
 * Thousands separators are presentation-only and never enter module state.
 */
export function normalizeNumericValue(value) {
    return String(value ?? '').replace(/,/g, '').trim();
}
export function formatNumericValue(value) {
    const raw = normalizeNumericValue(value);
    if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(raw))
        return raw;
    const negative = raw.startsWith('-') ? '-' : '';
    const unsigned = negative ? raw.slice(1) : raw;
    const [integer, fraction] = unsigned.split('.');
    const grouped = (integer || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${negative}${grouped}${fraction === undefined ? '' : `.${fraction}`}`;
}
export function isNumericControl(element) {
    return element?.dataset?.cv2Numeric === 'true';
}
export function normalizeNumericControl(element) {
    if (!isNumericControl(element))
        return;
    element.value = normalizeNumericValue(element.value);
}
export function formatNumericControl(element) {
    if (!isNumericControl(element))
        return;
    element.value = formatNumericValue(element.value);
}
/** Validate numeric input in one shared location, including optional min/max. */
export function numericValidationError(value, field = {}) {
    const raw = normalizeNumericValue(value);
    if (!raw)
        return '';
    if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(raw) || !Number.isFinite(Number(raw)))
        return '숫자 형식 오류';
    const number = Number(raw);
    if (field.min !== undefined && number < Number(field.min))
        return `최소 ${field.min}`;
    if (field.max !== undefined && number > Number(field.max))
        return `최대 ${field.max}`;
    return '';
}
