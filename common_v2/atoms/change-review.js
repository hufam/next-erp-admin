const text = v => v == null || v === '' ? '—' : String(v);
const norm = (v, f) => {
    if (v == null || v === '')
        return '';
    if (f?.type === 'number') {
        const n = Number(String(v).replaceAll(',', ''));
        return Number.isFinite(n) ? String(n) : String(v);
    }
    return String(v);
};
const display = (f, v, format) => format ? format(f, v) : f?.type === 'number' && norm(v, f) !== '' ? Number(norm(v, f)).toLocaleString('ko-KR') : text(v);
export function compareFields(fields, original = {}, current = {}, { where = '', format } = {}) {
    return fields.filter(f => norm(original[f.id], f) !== norm(current[f.id], f)).map(f => ({ where, field: f.label || f.id, before: display(f, original[f.id], format), after: display(f, current[f.id], format), kind: 'changed' }));
}
export function compareDocument({ headerFields = [], itemFields = [], original, current, itemKey = 'itemId', itemLabel = '품목', describeItem, format } = {}) {
    const diffs = compareFields(headerFields, original?.header, current?.header, { where: '기본정보', format });
    const oldItems = original?.items || [], newItems = current?.items || [];
    const oldById = new Map(oldItems.filter(x => x[itemKey] != null && x[itemKey] !== '').map(x => [String(x[itemKey]), x]));
    const used = new Set();
    const label = (x, i) => typeof describeItem === 'function' ? describeItem(x, i) : `${itemLabel} ${i + 1}`;
    newItems.forEach((x, i) => {
        const key = x[itemKey] == null ? '' : String(x[itemKey]);
        if (!key || !oldById.has(key)) {
            diffs.push({ where: label(x, i), field: '품목 추가', before: '—', after: itemFields.map(f => `${f.label}: ${display(f, x[f.id], format)}`).join(' / '), kind: 'added' });
            return;
        }
        used.add(key);
        diffs.push(...compareFields(itemFields, oldById.get(key), x, { where: label(x, i), format }));
    });
    oldItems.forEach((x, i) => { const key = x[itemKey] == null ? '' : String(x[itemKey]); if (!used.has(key))
        diffs.push({ where: label(x, i), field: '품목 삭제', before: itemFields.map(f => `${f.label}: ${display(f, x[f.id], format)}`).join(' / '), after: '—', kind: 'deleted' }); });
    return diffs;
}
export function formatChangeReview(diffs, { title = '수정내용을 확인해 주세요.', subject = '', warning = '', question = '수정하시겠습니까?' } = {}) {
    return [title, subject, ...diffs.map(d => `${d.where ? d.where + ' / ' : ''}${d.field}: ${text(d.before)} → ${text(d.after)}`), warning, question].filter(Boolean).join('\n\n').replace(/\n\n(?=[^\n]*:)/g, '\n');
}
