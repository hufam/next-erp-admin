import { searchFieldWidthKind } from '../config/search-field-standard.js';
import { formatNumericValue } from './numeric.js';
// Framework-independent UI atoms; all displayed values are escaped.
import { availableOptions } from './search-controls.js';
export const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
// Single runtime button atom: all modules and screen assemblies call this implementation.
// Button appearance and accessible state are changed here, never in module files.
export function button({ label, action, variant = 'secondary', disabled = false, extra = '' }) {
    const safeVariant = ['primary', 'secondary', 'warning', 'danger'].includes(variant) ? variant : 'secondary';
    return `<button type="button" class="cv2-button cv2-button--${safeVariant}" data-ui-component="button" data-action="${esc(action)}" aria-label="${esc(label)}"${disabled ? ' disabled aria-disabled="true"' : ''}${extra ? ' ' + extra : ''}>${esc(label)}</button>`;
}
// Shared remark trigger for both header semantic fields and item table cells.
export function remarkTrigger(value, scope, index, key, disabled = false, label = '비고') {
    const content = String(value ?? '').trim();
    const present = content.length > 0;
    const preview = present ? content.replace(/\s+/g, ' ').slice(0, 120) : `${label} 입력`;
    const extra = `data-scope="${esc(scope)}" data-index="${index}" data-key="${esc(key)}" title="${esc(preview)}"`;
    return `<span class="cv2-remark-trigger${present ? ' cv2-remark-trigger--filled' : ''}">${button({ label: present ? `${label} ✓` : label, action: 'edit-remark', disabled, extra })}</span>`;
}
export function title(text, level = 1) { return `<h${level} class="cv2-title">${esc(text)}</h${level}>`; }
// Width is the only optional visual override exposed to modules. Other styling is centralized.
export function controlWidthClass(width = 'auto', type = 'text') {
    const presets = ['auto', 'compact', 'normal', 'date', 'wide', 'full'];
    const choice = presets.includes(width) ? width : (type === 'date' ? 'date' : 'auto');
    return `cv2-control--${choice}`;
}
// All input/select controls share this single runtime renderer.
export function control({ type = 'text', value = '', placeholder = '', options = [], attributes = {}, emptyLabel = '선택', includeEmptyOption = true, width = 'auto' }) {
    const widthClass = controlWidthClass(width, type);
    const attrs = Object.entries(attributes).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => ` ${esc(k)}="${esc(v)}"`).join('');
    if (type === 'number') {
        const numericAttrs = {
            ...attributes,
            'data-cv2-numeric': 'true',
            inputmode: 'decimal',
            autocomplete: 'off',
        };
        const numericAttributes = Object.entries(numericAttrs)
            .filter(([, attributeValue]) => attributeValue !== undefined && attributeValue !== null && attributeValue !== false)
            .map(([name, attributeValue]) => ` ${esc(name)}="${esc(attributeValue)}"`)
            .join('');
        return `<input class="cv2-control cv2-control--numeric ${widthClass}" data-ui-component="control" type="text" value="${esc(formatNumericValue(value))}" placeholder="${esc(placeholder)}"${numericAttributes}>`;
    }
    if (type === 'autocomplete')
        return `<input class="cv2-control ${widthClass}" data-ui-component="control" type="text" value="${esc(value)}" placeholder="${esc(placeholder)}" autocomplete="off"${attrs}>`;
    if (type === 'select')
        return `<select class="cv2-control ${widthClass}" data-ui-component="control"${attrs}>${includeEmptyOption ? `<option value="">${esc(emptyLabel)}</option>` : ''}${options.map(o => `<option value="${esc(typeof o === 'object' ? o.value : o)}" ${String(value) === String(typeof o === 'object' ? o.value : o) ? 'selected' : ''}>${esc(typeof o === 'object' ? o.label : o)}</option>`).join('')}</select>`;
    return `<input class="cv2-control ${widthClass}" data-ui-component="control" type="${esc(type)}" value="${esc(value)}" placeholder="${esc(placeholder)}"${attrs}>`;
}
// Search widths are resolved centrally from semantic field identity.
// Form layout retains its existing independent sizing behavior.
export function searchWidthKind(field = {}) { return searchFieldWidthKind(field); }
export function semanticFields(specs, values = {}, context = { mode: 'query', scope: '', index: 0 }) {
    const scope = context.scope || (context.mode === 'query' ? 'filter' : 'header');
    return `<div class="cv2-semantic-fields" data-ui-component="semantic-fields">${specs.map(f => {
        // Semantic search fields use the centralized width standard in both query and form screens.
        // Unclassified form fields retain their existing layout sizing.
        const semanticKind = searchWidthKind(f);
        const hasSemanticWidth = semanticKind !== 'normal' || f.fieldType !== undefined;
        const kind = scope === 'filter' ? semanticKind : (f.formWidthKind || (hasSemanticWidth ? semanticKind : (f.widthKind || f.width || 'normal')));
        const attrs = scope === 'filter' ? { 'data-filter': f.id } : { 'data-scope': scope, 'data-index': context.index || 0, 'data-key': f.id, min: f.min, step: f.step };
        const options = scope === 'filter' ? availableOptions(f, values) : (f.options || []);
        if (scope === 'filter' && f.type === 'checkbox') {
            const checked = values[f.id] === true || values[f.id] === 'true';
            return `<div class="cv2-semantic-field cv2-semantic-field--${esc(kind)} cv2-semantic-field--checkbox${f.alignGroup === 'right-start' ? ' cv2-semantic-field--right-start' : f.alignGroup === 'right' ? ' cv2-semantic-field--right' : ''}"><div class="cv2-search-checkbox${f.checkboxAlign === 'end' ? ' cv2-search-checkbox--end' : f.checkboxAlign === 'center' ? ' cv2-search-checkbox--center' : ''}"><label for="cv2-search-${esc(f.id)}">${esc(f.label)}</label><div class="cv2-search-checkbox__control"><input id="cv2-search-${esc(f.id)}" type="checkbox" data-filter="${esc(f.id)}" aria-label="${esc(f.label)}" ${checked ? 'checked' : ''}></div></div></div>`;
        }
        const element = f.type === 'remark' ? remarkTrigger(values[f.id] ?? '', scope, Number(context.index || 0), f.id, !!f.disabled, f.label || '비고') : control({ type: f.type || 'text', value: values[f.id] ?? f.default ?? '', placeholder: f.placeholder || '', options, width: 'full', attributes: attrs, emptyLabel: scope === 'filter' ? '전체' : '선택', includeEmptyOption: f.includeEmptyOption !== false });
        const suffix = f.suffixAction;
        const suffixButton = suffix ? button({ label: suffix.label || '추가', action: suffix.name || 'add', disabled: !!suffix.disabled }) : '';
        const suggestions = f.type === 'autocomplete' ? '<div class="cv2-autocomplete-options" role="listbox" hidden></div>' : '';
        return `<div class="cv2-semantic-field cv2-semantic-field--${esc(kind)}${f.type === 'autocomplete' ? ' cv2-autocomplete' : ''}${suffixButton ? ' cv2-semantic-field--with-action' : ''}"><label class="cv2-field"><span>${esc(f.label)}${f.required ? ' <em class="cv2-required">*</em>' : ''}</span>${suffixButton ? `<span class="cv2-inline-action">${element}${suffixButton}</span>` : element}${suggestions}</label></div>`;
    }).join('')}</div>`;
}
export function searchFields(specs, values = {}) { return semanticFields(specs, values, { mode: 'query' }); }
export function field({ id, label, type = 'text', placeholder = '', value = '', options = [], width = 'auto' }) { return `<label class="cv2-field"><span>${esc(label)}</span>${control({ type, placeholder, value, options, width, attributes: { id, 'data-filter': id }, emptyLabel: '전체' })}</label>`; }
export function grid(items, columns = 3) { return `<div class="cv2-field-grid cv2-field-grid--${columns}">${items.join('')}</div>`; }
export function row(items, klass = '') { return `<div class="cv2-row ${klass}">${items.join('')}</div>`; }
export function card({ heading, meta = '', actionMeta = '', auxiliaryLeft, auxiliaryRight, action = '', content = '', klass = '' }) {
    const left = auxiliaryLeft === undefined ? meta : auxiliaryLeft;
    const right = auxiliaryRight === undefined ? actionMeta : auxiliaryRight;
    return `<section class="cv2-card ${klass}"><header class="cv2-card__header"><div class="cv2-card__heading"><h2>${esc(heading)}</h2>${left ? `<div class="cv2-card__aux cv2-card__aux--left">${left}</div>` : ''}</div><div class="cv2-card__actions">${right ? `<div class="cv2-card__action-meta cv2-card__aux cv2-card__aux--right">${right}</div>` : ''}${action}</div></header>${content}</section>`;
}
export function text(value, klass = '') { return `<span class="${esc(klass)}">${esc(value)}</span>`; }
// Single runtime table primitive. Column metadata and row data remain screen configuration.
export function tableFrame({ headers, rows = '', tableClass = 'cv2-table', wrapperClass = '', empty = '', colspan = 1 }) {
    const emptyRow = `<tr><td colspan="${Math.max(1, Number(colspan) || 1)}" class="cv2-empty">${esc(empty)}</td></tr>`;
    return `<div class="cv2-table-scroll ${esc(wrapperClass)}" data-ui-component="table" data-ui-structure="cv2-shared-v15"><table class="${esc(tableClass)}"><thead><tr>${headers}</tr></thead><tbody>${rows || emptyRow}</tbody></table></div>`;
}
export function tableHeaders(columns, sort = { key: '', dir: 1 }) {
    return columns.map(c => `<th scope="col" class="${c.align === 'right' ? 'right' : ''}">${c.key != null && c.key !== '' && c.sort !== false ? `<button type="button" class="cv2-sort" data-sort="${esc(c.key)}" aria-label="${esc(c.label)} 정렬">${esc(c.label)} ${sort.key === c.key ? (sort.dir === 1 ? '↑' : '↓') : '↕'}</button>` : esc(c.label)}</th>`).join('');
}
// Structural helpers: screen assemblies provide content, never write table tags.
export function tableHeader(content, { align = 'left', scope = 'col' } = {}) { return `<th scope="${esc(scope)}" class="${align === 'right' ? 'right' : ''}">${content}</th>`; }
export function tableContentCell(content, { align = 'left', colspan = 1 } = {}) { return `<td class="${align === 'right' ? 'right' : ''}"${colspan > 1 ? ` colspan="${Math.max(1, Number(colspan) || 1)}"` : ''}>${content}</td>`; }
export function tableCell(value, align = 'left') { return tableContentCell(esc(value), { align }); }
export function tableRow(cells, klass = '') { return `<tr class="${esc(klass)}">${cells.join('')}</tr>`; }
export function expandedRow(colspan, content) { return `<tr class="cv2-expanded"><td colspan="${Math.max(1, Number(colspan) || 1)}">${content}</td></tr>`; }
export function table(columns, body, sort = { key: '', dir: 1 }) { return tableFrame({ headers: tableHeaders(columns, sort), rows: body, colspan: columns.length, empty: '검색 결과가 없습니다.' }); }
export function pagination(page, pages) { return `<nav class="cv2-pagination" aria-label="페이지 이동">${button({ label: '이전', action: 'prev', disabled: page <= 1 })}<span>${page} / ${pages} 페이지</span>${button({ label: '다음', action: 'next', disabled: page >= pages })}</nav>`; }
export function message(value) { return `<p class="cv2-message" role="status">${esc(value)}</p>`; }
// Shared page composition: the only runtime owner of main/page-header/footnote markup.
export function pageShell({ heading, subtitle = '', primaryActions = '', secondaryActions = '', content = '', footnote = '', maxWidth }) {
    const headingBlock = subtitle ? `<div class="cv2-pagehead__heading">${title(heading)}<div class="cv2-pagehead__subtitle">${esc(subtitle)}</div></div>` : title(heading);
    // Optional module-level maximum width; default remains the shared token (1400px).
    const width = Number(maxWidth);
    const widthStyle = maxWidth != null && Number.isFinite(width) && width >= 1020 && width <= 2400
        ? ` style="--cv2-page-max-width:${Math.round(width)}px"` : '';
    return `<main class="cv2-app" data-ui-component="page-shell"${widthStyle}><header class="cv2-pagehead">${row([headingBlock, primaryActions], 'cv2-pagehead__left')}${secondaryActions}</header>${content}${footnote ? `<p class="cv2-footnote">${esc(footnote)}</p>` : ''}</main>`;
}
