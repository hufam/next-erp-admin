// Shared, business-agnostic form atoms. All user values are HTML-escaped.
import { esc, button, row, grid, card, message, control, tableFrame, tableHeaders, tableRow, tableHeader, tableContentCell, semanticFields } from './interactive.js';
import { remarkTrigger } from './remark-editor.js';
import { searchFieldWidthKind } from '../config/search-field-standard.js';
export function inputField(spec, value = '', scope = 'header', index = 0) {
    const key = `${scope}.${index}.${spec.id}`;
    const opts = spec.options || [];
    const element = spec.type === 'remark' ? remarkTrigger(value, scope, Number(index), spec.id, Boolean(spec.disabled), spec.label || '비고') : control({ type: spec.type || 'text', value, placeholder: spec.placeholder || '', options: opts, width: spec.width || 'auto', attributes: { 'data-scope': scope, 'data-index': index, 'data-key': spec.id, min: spec.min, step: spec.step } });
    const tag = spec.type === 'remark' ? 'div' : 'label';
    return `<${tag} class="cv2-field${spec.type === 'autocomplete' ? ' cv2-autocomplete' : ''}"><span>${esc(spec.label)}${spec.required ? ' <em class="cv2-required">*</em>' : ''}</span>${element}${spec.type === 'autocomplete' ? '<div class="cv2-autocomplete-options" role="listbox" hidden></div>' : ''}</${tag}>`;
}
// Header forms share the same semantic width contract as query forms.
// Item editors remain grid-based: their column widths are constrained by table geometry.
export function formFields(specs, values = {}, scope = 'header', index = 0, columns = 3) {
    if (scope !== 'item')
        return semanticFields(specs, values, { mode: 'form', scope, index });
    return grid(specs.map(s => inputField(s, values[s.id] ?? s.default ?? '', scope, index)), columns);
}
export function itemCard(specs, values, index, { itemLabel = '품목' } = {}) { return `<section class="cv2-item"><header class="cv2-item__head"><strong>${esc(itemLabel)} ${index + 1}</strong>${button({ label: '행 삭제', action: 'remove-item', variant: 'secondary', extra: `data-index="${index}"` })}</header>${formFields(specs, values, 'item', index, 3)}</section>`; }
export function itemGrid(specs, items, { emptyLabel = '항목을 추가해 주세요.' } = {}) {
    const headers = tableHeaders(specs.map(s => ({ label: s.label + (s.required ? ' *' : '') })));
    const widths = { compact: 'var(--cv2-control-width-compact)', normal: 'var(--cv2-search-width-normal)', part: 'var(--cv2-search-width-part)', party: 'var(--cv2-search-width-party)', 'part-name': 'var(--cv2-search-width-part-name)', date: 'var(--cv2-search-width-date)', document: 'var(--cv2-search-width-document)', long: 'var(--cv2-search-width-long)', wide: 'var(--cv2-control-width-wide)' };
    const colWidths = specs.map(s => s.type === 'remark' ? 'var(--cv2-item-remark-width)' : (searchFieldWidthKind(s) === 'normal' ? (widths[s.width] || widths.normal) : widths[searchFieldWidthKind(s)]));
    const colgroup = '<colgroup>' + colWidths.map(w => `<col style="width:${w}">`).join('') + '<col style="width:72px"></colgroup>';
    const rows = items.map((values, i) => tableRow([...specs.map(s => tableContentCell(inputField({ ...s, label: '', required: false }, values[s.id] ?? s.default ?? '', 'item', i))), tableContentCell(button({ label: '삭제', action: 'remove-item', extra: `data-index="${i}"` }))])).join('');
    return tableFrame({ headers: headers + tableHeader('삭제'), rows, tableClass: 'cv2-itemgrid', wrapperClass: 'cv2-itemgrid-wrap', empty: emptyLabel, colspan: specs.length + 1 }).replace('<table class="cv2-itemgrid">', `<table class="cv2-itemgrid">${colgroup}`);
}
// Compact totals live in the item card header. This component is also updated in-place.
export function totalsInline({ supply = 0, tax = 0, total = 0, labels = {} } = {}) {
    const n = v => Number(v || 0).toLocaleString('ko-KR');
    return `<div class="cv2-totals-inline" data-ui-component="totals"><span>${esc(labels.supply || '공급가')} <strong>${n(supply)}</strong></span><span>${esc(labels.tax || '세액')} <strong>${n(tax)}</strong></span><span class="cv2-totals-inline__total">${esc(labels.total || '총공급가')} <strong>${n(total)}</strong></span></div>`;
}
// ITEM editor owns only the fixed "+ 품목 추가" control.
export function itemEditor(specs, items, { view = 'card', itemLabel = '품목', emptyLabel = '항목을 추가해 주세요.' } = {}) {
    const itemActions = row([button({ label: `+ ${itemLabel} 추가`, action: 'add-item' })], 'cv2-item-actions');
    return card({ heading: `${itemLabel} 정보`, action: itemActions, content: view === 'grid' ? itemGrid(specs, items, { emptyLabel }) : items.map((v, i) => itemCard(specs, v, i, { itemLabel })).join('') });
}
export { message };
