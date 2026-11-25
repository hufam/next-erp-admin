import { remarkTrigger } from '../atoms/remark-editor.js';
import { QUERY_PAGE_SIZE, QUERY_LIST_TYPES, DEFAULT_QUERY_LIST_TYPE } from '../config/pagination-standard.js';
// The sole composition entrypoint for all modes. Screens supply configuration and data,
// never card/table/search markup. Each assembly delegates to the same primitives.
import { pageShell, card, button, row, searchFields, tableFrame, tableHeaders, tableRow, tableCell, tableContentCell, pagination, message, esc, control } from '../atoms/interactive.js';
import { formFields, itemEditor } from '../atoms/form.js';
export const action = (label, name, opts = {}) => button({ label, action: name, ...opts });
// Opt-in standard back control. The module supplies its existing parent-navigation action.
// This helper only standardizes the label; it never changes routing by itself.
export const previousAction = (parentAction, opts = {}) => {
    if (!parentAction?.trim())
        throw new Error('previousAction requires a parent action');
    return action('이전으로', parentAction, opts);
};
export const actions = (...items) => row(items.filter(Boolean));
export const notice = value => value ? message(value) : '';
export const page = ({ title, subtitle = '', active = 'query', primary = ['query', 'register'], headerTools = [], secondary = [], hiddenHeaderActions = [], children = [], help = '', maxWidth }) => pageShell({
    heading: title, subtitle,
    primaryActions: actions(...primary.map(name => action(({ query: '조회', register: '등록', 'create-mode': '실사생성' })[name] || name, name, { variant: active === name ? 'primary' : 'secondary' }))),
    secondaryActions: actions(...headerTools, ...['refresh', 'reset', 'close'].filter(name => !hiddenHeaderActions.includes(name)).map(name => {
        const defaults = { refresh: '새로고침', reset: '초기화', close: '닫기' };
        const override = secondary.find(x => x.action === name) || {};
        return action(defaults[name], name, { disabled: override.disabled ?? false });
    })),
    content: children.filter(Boolean).join(''), footnote: help, maxWidth
});
// Two optional header slots: auxiliaryLeft follows the title; auxiliaryRight precedes actions.
// Legacy meta/actionMeta remain accepted so existing modules require no changes.
export const panel = ({ title, meta = '', actionMeta = '', auxiliaryLeft, auxiliaryRight, tools = [], children = '', kind = '' }) => card({ heading: title, meta, actionMeta, auxiliaryLeft, auxiliaryRight, action: actions(...tools), content: children, klass: kind });
export const form = ({ title, fields, values = {}, scope = 'header', index = 0, tools = [], noticeText = '', meta = '', actionMeta = '', auxiliaryLeft, auxiliaryRight, layout }) => panel({ title, meta, actionMeta, auxiliaryLeft, auxiliaryRight, tools, children: (layout?.type === 'two-row' ? `<div class="cv2-form-two-row">${formFields(fields.filter((f) => layout.firstRow.includes(f.id)), values, scope, index)}${layout.lastRow?.length ? `<div class="cv2-form-two-row__last">${formFields(fields.filter((f) => layout.lastRow.includes(f.id)), values, scope, index)}</div>` : ''}</div>` : formFields(fields, values, scope, index)) + notice(noticeText) });
// The only creation path for register/edit cancel + save pairs.
// Disabled controls are always rendered; disabled affects interaction only.
const workflowButtons = (mode, { saveDisabled = true, saving = false, cancelLabel, saveLabel, extraActions = [] } = {}) => {
    const isEdit = mode === 'edit';
    return [...(isEdit ? extraActions : []), action(cancelLabel || (isEdit ? '수정취소' : '등록취소'), 'query'),
        action(saving ? '저장 중...' : (saveLabel || (isEdit ? '수정저장' : '등록저장')), 'save', { variant: 'primary', disabled: saveDisabled || saving })];
};
// Shared registration action contract for both master and transaction screens.
// Modules supply only their existing action identifiers and save eligibility.
export const registrationActions = ({ cancelAction = 'query', saveAction = 'save', saveDisabled = true, saving = false, saveLabel = '등록저장' } = {}) => [
    action('등록취소', cancelAction, { disabled: saving }),
    action(saving ? '저장 중...' : saveLabel, saveAction, { variant: 'primary', disabled: saveDisabled || saving })
];
export const registerForm = ({ title, fields, values = {}, meta = '', actionMeta = '', auxiliaryLeft, auxiliaryRight, saveDisabled = true, saving = false, cancelLabel = '등록취소', saveLabel = '등록저장', noticeText = '' }) => form({ title, fields, values, meta, actionMeta, auxiliaryLeft, auxiliaryRight, tools: workflowButtons('register', { saveDisabled, saving, cancelLabel, saveLabel }), noticeText });
export const editForm = ({ title, fields, values = {}, meta = '', actionMeta = '', auxiliaryLeft, auxiliaryRight, saveDisabled = true, saving = false, cancelLabel = '수정취소', saveLabel = '수정저장', noticeText = '', extraActions = [] }) => form({ title, fields, values, meta, actionMeta, auxiliaryLeft, auxiliaryRight, tools: workflowButtons('edit', { saveDisabled, saving, cancelLabel, saveLabel, extraActions }), noticeText });
// Search disclosure is in the common card header, immediately before the Search action.
// Native details owns the state; CSS :has() controls the field body without module handlers.
export const search = ({ title, fields, values = {}, meta = '', actionMeta = '', auxiliaryLeft, auxiliaryRight, noticeText = '', tools = [action('검색', 'search', { variant: 'primary' })], collapsible = true, expanded = false, historyOption }) => {
    const history = historyOption ? `<label class="cv2-search-history"><input type="checkbox" data-query-history${historyOption.checked ? ' checked' : ''}${historyOption.disabled ? ' disabled' : ''}>${esc(historyOption.label)}</label>` : '';
    const originalRight = auxiliaryRight === undefined ? actionMeta : auxiliaryRight;
    if (!collapsible)
        return panel({ title, meta, auxiliaryLeft, auxiliaryRight: history ? `${originalRight || ''}${history}` : originalRight, tools, children: searchFields(fields, values) + notice(noticeText), kind: history ? 'cv2-search cv2-search--history' : 'cv2-search' });
    const toggle = `<details class="cv2-search-disclosure"${expanded ? ' open' : ''}><summary class="cv2-search-disclosure__toggle"><span class="cv2-search-disclosure__closed">조건 펼치기</span><span class="cv2-search-disclosure__opened">조건 접기</span></summary></details>`;
    // Keep summary metrics and query controls as separate layout units.
    // The mobile stylesheet can then align the checkbox/disclosure/search button
    // without pulling monetary totals into the same row.
    const headerRight = history
        ? `<div class="cv2-search-metrics">${originalRight || ''}</div><div class="cv2-search-execution">${history}${toggle}</div>`
        : `${originalRight || ''}${toggle}`;
    const body = `<div class="cv2-search-disclosure__fields">${searchFields(fields, values)}</div>${notice(noticeText)}`;
    return panel({ title, meta, auxiliaryLeft, auxiliaryRight: headerRight, tools, children: body, kind: 'cv2-search cv2-search--collapsible' + (history ? ' cv2-search--history' : '') });
};
// Shared convention: business action columns always follow data columns.
// Remarks are width-limited and may precede actions; never reorder a module's fields.
const isRemarkColumn = c => c?.remark === true || /^(remark|note|shipmentNote|headerRemark|itemRemark)$/i.test(String(c?.key || '')) || /^(비고|전체 비고|Note|Remark)$/i.test(String(c?.label || ''));
const tableValue = (record, column) => {
    const raw = record[column.key];
    if (typeof column.render === 'function')
        return tableContentCell(column.render(raw, record), { align: column.align });
    if (column.toneWhen && column.toneWhen(raw, record))
        return tableContentCell(`<span class="cv2-value--${esc(column.tone || 'danger')}">${esc(typeof raw === 'number' ? raw.toLocaleString('ko-KR') : (raw ?? ''))}</span>`, { align: column.align });
    const value = typeof raw === 'number' ? raw.toLocaleString('ko-KR') : (raw ?? '');
    if (isRemarkColumn(column))
        return tableContentCell(`<span class="cv2-remark-ellipsis" title="${esc(value)}">${esc(value)}</span>`, { align: column.align });
    return tableCell(value, column.align);
};
export const dataTable = ({ columns, records, sort, empty = '검색 결과가 없습니다.', extraCells = () => [], extraColumns = [], extraPosition = 'end', stickyFirstColumn = false, mobileColumns = null, stickyMobileHeader = false }) => {
    const ordered = extraPosition === 'start' ? [...extraColumns, ...columns] : [...columns, ...extraColumns];
    const rows = records.map((r, i) => tableRow(extraPosition === 'start' ? [...extraCells(r, i), ...columns.map(c => tableValue(r, c))] : [...columns.map(c => tableValue(r, c)), ...extraCells(r, i)])).join('');
    // Shared width hints: quantity/count columns and adjacent business actions stay compact.
    // Keep the native auto layout so long values remain readable and can scroll when necessary.
    const columnKind = (c) => {
        const label = String(c?.label || '').trim();
        if (/^(상세|수정|취소|삭제|선택|추가)$/.test(label))
            return label === '선택' && c?.reasonAction ? 'reason-action' : 'action';
        if (/^(단가|판매단가|매입단가|공급가|공급금액|금액|합계|총금액|세액|VAT)$/.test(label))
            return 'amount';
        if (/^(현재고|현재재고|가용재고|재고|재고수량)$/.test(label))
            return 'quantity';
        if (/^(품목\s*수|품목수|건수|항목\s*수)$/.test(label))
            return 'count';
        if (/(수량|잔량)$/.test(label))
            return 'quantity';
        return '';
    };
    const compactColumns = ordered.map(columnKind);
    const compact = compactColumns.some(Boolean);
    const gridBase = tableFrame({ headers: tableHeaders(ordered, sort), rows, empty, colspan: ordered.length });
    const colgroup = compact ? `<colgroup>${compactColumns.map(kind => `<col${kind ? ` class="cv2-col--${kind}"` : ''}>`).join('')}</colgroup>` : '';
    const grid = compact ? gridBase.replace('<table class="cv2-table">', `<table class="cv2-table cv2-table--compact-columns">${colgroup}`) : gridBase;
    if (mobileColumns) {
        const mobileOrdered = extraPosition === 'start' ? [...extraColumns, ...mobileColumns] : [...mobileColumns, ...extraColumns];
        const mobileRows = records.map((r, i) => tableRow(extraPosition === 'start' ? [...extraCells(r, i), ...mobileColumns.map(c => tableValue(r, c))] : [...mobileColumns.map(c => tableValue(r, c)), ...extraCells(r, i)])).join('');
        const mobileGrid = tableFrame({ headers: tableHeaders(mobileOrdered, sort), rows: mobileRows, empty, colspan: mobileOrdered.length, wrapperClass: `cv2-sticky-first-column${stickyMobileHeader ? ' cv2-mobile-sticky-header' : ''}` });
        return `<div class="cv2-responsive-table-desktop">${grid}</div><div class="cv2-responsive-table-mobile">${mobileGrid}</div>`;
    }
    return stickyFirstColumn ? grid.replace('class="cv2-table-scroll', `class="cv2-table-scroll cv2-sticky-first-column${stickyMobileHeader ? ' cv2-mobile-sticky-header' : ''}`) : grid;
};
export const list = ({ title, meta = '', actionMeta = '', auxiliaryLeft, auxiliaryRight, tools = [], empty = '검색 결과가 없습니다.', columns, records, sort, extraCells, extraColumns = [], extraPosition = 'end', pageNumber, pages, stickyFirstColumn = false, mobileColumns = null, stickyMobileHeader = false, listType = DEFAULT_QUERY_LIST_TYPE }) => {
    const type = listType === QUERY_LIST_TYPES.SCROLL ? QUERY_LIST_TYPES.SCROLL : QUERY_LIST_TYPES.PAGINATION;
    const grid = dataTable({ columns, records, sort, empty, extraCells, extraColumns, extraPosition, stickyFirstColumn, mobileColumns, stickyMobileHeader });
    const children = type === 'scroll'
        ? `<div class="cv2-list-content--scroll" data-cv2-list-mode="scroll">${grid}</div>`
        : grid + (pageNumber ? pagination(pageNumber, pages) : '');
    return panel({ title, meta, actionMeta, auxiliaryLeft, auxiliaryRight, tools, children });
};
// Invariant: itemList owns ITEM display and "+ 품목 추가" only.
// Save/cancel buttons belong to mode-specific screen assemblies.
export const itemList = ({ fields, items, view = 'grid' }) => itemEditor(fields, items, { view });
// Single common summary renderer shared by inquiry strips and detail panels.
const renderSummary = fields => `<div class="cv2-summary-strip" data-ui-component="summary" style="--cv2-summary-count:${Math.max(1, Math.min(8, fields.length))}">${fields.map(f => `<div class="cv2-summary-strip__stat${f.links?.length ? ' cv2-summary-strip__stat--links' : ''}"><span>${esc(f.label)}</span>${f.links?.length ? `<div class="cv2-summary-inline-links">${f.links.map(link => `<span>${esc(link.label)} ${button({ label: String(link.value ?? '0'), action: link.action, variant: 'link' })}</span>`).join('<span class="cv2-summary-inline-separator">·</span>')}${f.inlineControl ? `<span class="cv2-summary-inline-control">${f.inlineControl}</span>` : ''}</div>` : `<strong>${esc(f.value ?? '0')}</strong>`}</div>`).join('')}</div>`;
export const summary = fields => renderSummary(fields);
// Shared summary with individually actionable metrics. The caller supplies only labels, values and actions.
export const linkedSummary = (fields) => `<div class="cv2-summary-strip" data-ui-component="linked-summary" style="--cv2-summary-count:${Math.max(1, Math.min(8, fields.length))}">${fields.map(f => `<div class="cv2-summary-strip__stat"><span>${esc(f.label)}</span>${f.action ? button({ label: String(f.value ?? '0'), action: f.action, variant: 'secondary' }) : `<strong>${esc(f.value ?? '0')}</strong>`}</div>`).join('')}</div>`;
export const detail = ({ title, meta = '', actionMeta = '', auxiliaryLeft, auxiliaryRight, fields, columns, record, tools = [], help = '' }) => panel({ title, meta, actionMeta, auxiliaryLeft, auxiliaryRight, tools, children: summary(fields.map(f => ({ ...f, value: f.value ?? record[f.key] }))) + (columns.length ? dataTable({ columns, records: [record] }) : '') + (help ? `<p class="cv2-footnote">${esc(help)}</p>` : '') });
export const pending = ({ title, fields, items, tools = [], meta = '', actionMeta = '', auxiliaryLeft, auxiliaryRight, empty = '추가된 항목이 없습니다.', removable = true }) => panel({ title, meta, actionMeta, auxiliaryLeft, auxiliaryRight, tools, children: dataTable({ columns: fields.map(f => ({ key: f.id, label: f.label })), records: items, extraColumns: removable ? [{ label: '삭제' }] : [], extraCells: removable ? (_, i) => [tableContentCell(action('삭제', 'unstage', { extra: `data-index="${i}"` }))] : () => [], empty }) });
export const changesTable = diffs => dataTable({ columns: [{ key: 'field', label: '항목' }, { key: 'before', label: '변경 전' }, { key: 'after', label: '변경 후' }], records: diffs });
export const documentChangesTable = diffs => dataTable({ columns: [{ key: 'where', label: '위치' }, { key: 'field', label: '항목' }, { key: 'before', label: '변경 전' }, { key: 'after', label: '변경 후' }], records: diffs });
// Compact, card-free summary for report and inquiry screens.
export const summaryStrip = fields => renderSummary(fields);
// Shared responsive metrics: preserve the existing compact desktop text while
// presenting individual label/value cells on narrow screens. Data only from modules.
export const responsiveMetrics = (fields, options = {}) => {
    const kind = options.kind === 'amount' ? ' cv2-responsive-metrics--amount' : '';
    const desktop = fields.map(f => `${esc(f.label)} ${esc(f.value ?? '—')}`).join(' | ');
    const mobile = fields.map(f => `<span class="cv2-responsive-metrics__item"><span class="cv2-responsive-metrics__label">${esc(f.label)}</span><strong>${esc(f.value ?? '—')}</strong></span>`).join('');
    return `<span class="cv2-responsive-metrics${kind}"><span class="cv2-responsive-metrics__desktop cv2-muted">${desktop}</span><span class="cv2-responsive-metrics__mobile">${mobile}</span></span>`;
};
// Reusable compact card-title metrics; values are escaped and never interpreted as markup.
export const titleMetrics = (fields = []) => fields.map(f => `<span class="cv2-title-metric"><span>${esc(f.label)}</span> <strong>${esc(f.value ?? '—')}</strong></span>`).join('<span class="cv2-title-metric-separator" aria-hidden="true">|</span>');
// Opt-in mobile continuous listing. Desktop retains the ERP-wide 12-row paging.
// This is presentation-only: filters, sorting and saved business data are unchanged.
export const mobileContinuousList = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches;
export const responsivePaginateRecords = (records, requestedPage = 1) => mobileContinuousList()
    ? { records, pageNumber: 1, pages: 1 }
    : paginateRecords(records, requestedPage);
// One ERP-wide page-size policy; business modules never choose their own row count.
export const paginateRecords = (records, requestedPage = 1) => {
    const pages = Math.max(1, Math.ceil(records.length / QUERY_PAGE_SIZE));
    const pageNumber = Math.min(pages, Math.max(1, requestedPage));
    return {
        records: records.slice((pageNumber - 1) * QUERY_PAGE_SIZE, pageNumber * QUERY_PAGE_SIZE),
        pageNumber,
        pages,
    };
};
// Common configurable item editing grid; all HTML/control rendering stays in common_v2.
// Column widths are reusable configuration, never module-specific CSS.
// Each width is a positive percentage; when supplied, all widths must total 100%.
export const editableDataTable = ({ title = '품목 구성', columns, records, actionLabel = '삭제', actionName = 'remove-line', canRemoveLine = () => true, auxiliaryLeft = '', auxiliaryRight = '', tools = [], minTableWidth = 0, sort, pageNumber, pages, mobileCards = false, mobileTableColumns = [], mobileCompactNumeric = false, stickyMobileHeader = false }) => {
    const ordered = actionLabel ? [...columns, { label: actionLabel }] : [...columns];
    const widths = ordered.map(c => Number(c.widthPercent || 0));
    const hasWidths = widths.every(w => Number.isFinite(w) && w > 0) && Math.abs(widths.reduce((a, b) => a + b, 0) - 100) < 0.01;
    const rows = records.map((r, i) => tableRow([
        ...columns.map(c => (typeof c.editable === 'function' ? c.editable(r) : c.editable) ? tableContentCell(c.type === 'remark' ? remarkTrigger(r[c.key], 'line', i, c.key) : control({ type: c.type || 'text', value: r[c.key], options: typeof c.options === 'function' ? c.options(r) : c.options || [], emptyLabel: c.emptyLabel || '선택', includeEmptyOption: c.includeEmptyOption !== false, width: 'full', attributes: { 'data-line': i, 'data-key': c.key, min: c.min ?? (c.type === 'number' ? 0 : undefined) } }), { align: c.align }) : c.value ? tableContentCell(`<span data-calculated-line="${i}" data-calculated-key="${esc(c.key)}">${esc(c.value(r) ?? '')}</span>`, { align: c.align }) : tableValue(r, c)),
        ...(actionLabel ? [tableContentCell(action(actionLabel, actionName, { disabled: !canRemoveLine(r), extra: `data-index="${i}"` }))] : [])
    ])).join('');
    let grid = tableFrame({ headers: tableHeaders(ordered, sort), rows, empty: '추가된 항목이 없습니다.', colspan: ordered.length });
    if (hasWidths) {
        const cols = widths.map(w => `<col style="width:${w}%">`).join('');
        const minWidth = Number.isFinite(Number(minTableWidth)) ? Math.max(0, Math.min(4000, Number(minTableWidth))) : 0;
        grid = grid.replace('<table class="cv2-table">', `<table class="cv2-table" style="width:100%;table-layout:fixed;${minWidth ? `min-width:${minWidth}px;` : ''}"><colgroup>${cols}</colgroup>`);
    }
    // Optional compact phone grid: first column stays visible, and priority inputs follow it.
    // Uses the same shared controls, change tracking and calculation bindings as desktop.
    let mobileTable = '';
    if (mobileTableColumns.length) {
        const priority = mobileTableColumns.map((key) => columns.find((c) => c.key === key)).filter(Boolean);
        const phoneColumns = [...priority, ...columns.filter((c) => !mobileTableColumns.includes(c.key))];
        const phoneRows = records.map((r, i) => tableRow(phoneColumns.map((c) => (typeof c.editable === 'function' ? c.editable(r) : c.editable)
            ? tableContentCell(c.type === 'remark' ? remarkTrigger(r[c.key], 'line', i, c.key) : control({ type: c.type || 'text', value: r[c.key], options: typeof c.options === 'function' ? c.options(r) : c.options || [], emptyLabel: c.emptyLabel || '선택', includeEmptyOption: c.includeEmptyOption !== false, width: 'full', attributes: { 'data-line': i, 'data-key': c.key, min: c.min ?? (c.type === 'number' ? 0 : undefined) } }), { align: c.align })
            : c.value ? tableContentCell(`<span data-calculated-line="${i}" data-calculated-key="${esc(c.key)}">${esc(c.value(r) ?? '')}</span>`, { align: c.align }) : tableValue(r, c)))).join('');
        const phoneGrid = tableFrame({ headers: tableHeaders(phoneColumns, sort), rows: phoneRows, empty: '추가된 항목이 없습니다.', colspan: phoneColumns.length });
        mobileTable = `<div class="cv2-editable-mobile-table${mobileCompactNumeric ? ' cv2-editable-mobile-table--compact-numeric' : ''}">${phoneGrid.replace('class="cv2-table-scroll', `class="cv2-table-scroll cv2-sticky-first-column${stickyMobileHeader ? ' cv2-mobile-sticky-header' : ''}`)}</div>`;
    }
    const mobile = mobileCards ? `<div class="cv2-editable-mobile-cards">${records.map((r, i) => `<section class="cv2-editable-mobile-card">${columns.map(c => {
        const editable = typeof c.editable === 'function' ? c.editable(r) : c.editable;
        const content = editable ? (c.type === 'remark' ? remarkTrigger(r[c.key], 'line', i, c.key) : control({ type: c.type || 'text', value: r[c.key], options: typeof c.options === 'function' ? c.options(r) : c.options || [], emptyLabel: c.emptyLabel || '선택', includeEmptyOption: c.includeEmptyOption !== false, width: 'full', attributes: { 'data-line': i, 'data-key': c.key, min: c.min ?? (c.type === 'number' ? 0 : undefined) } })) : c.value ? `<span data-calculated-line="${i}" data-calculated-key="${esc(c.key)}">${esc(c.value(r) ?? '')}</span>` : `<span>${esc(typeof r[c.key] === 'number' ? r[c.key].toLocaleString('ko-KR') : (r[c.key] ?? ''))}</span>`;
        return `<div class="cv2-editable-mobile-field${editable ? ' cv2-editable-mobile-field--input' : ''}"><label>${esc(c.label)}</label>${content}</div>`;
    }).join('')}${actionLabel ? `<div class="cv2-editable-mobile-action">${action(actionLabel, actionName, { disabled: !canRemoveLine(r), extra: `data-index="${i}"` })}</div>` : ''}</section>`).join('')}</div>` : '';
    return panel({ title, auxiliaryLeft, auxiliaryRight, tools, children: `<div class="${mobileCards || mobileTableColumns.length ? 'cv2-editable-desktop-grid' : ''}">${grid}</div>` + mobileTable + mobile + (pageNumber ? pagination(pageNumber, pages) : '') });
};
export const workflowGuide = ({ title, rows, intro = '', footer = '', closeAction = 'close-guide', closeLabel = '설명서 닫기', headings = {} }) => panel({
    title,
    tools: [action(closeLabel, closeAction)],
    children: (intro ? workflowGuideLine(intro) : '') + dataTable({
        columns: [
            { key: 'state', label: headings.state || '현재상태' },
            { key: 'next', label: headings.next || '다음업무' },
            { key: 'after', label: headings.after || '처리 후 상태' },
            { key: 'detail', label: headings.detail || '상세설명' }
        ],
        records: rows,
        empty: '등록된 업무설명서가 없습니다.'
    }).replace('class="cv2-table-scroll ', 'class="cv2-table-scroll cv2-workflow-manual ') + (footer ? workflowGuideLine(footer) : '')
});
// Compact, card-free workflow instruction shared by business screens.
export const workflowGuideLine = (value) => `<div class="cv2-workflow-guide">${esc(value)}</div>`;
// Compact status sequence and current action: no nested cards or duplicate summaries.
export const workflowStatusLine = (steps) => `<div class="cv2-workflow-status">${steps.map((step, i) => `${i ? '<span class="cv2-workflow-arrow" aria-hidden="true">→</span>' : ''}<span class="cv2-workflow-step" data-tone="${esc(step.tone || 'neutral')}">${esc(step.label)}</span>`).join('')}</div>`;
export const workflowTaskLine = (task, guide) => `<div class="cv2-workflow-task"><strong>${esc(task)}</strong><span>${esc(guide)}</span></div>`;
// Shared right-aligned one-line totals beneath item tables.
export const amountSummaryLine = (fields) => `<div class="cv2-amount-summary">${fields.map(f => `<span class="cv2-amount-summary__item">${esc(f.label)} <strong>${esc(f.value)}</strong></span>`).join('')}</div>`;
// Shared calculated-cell update for editable tables. Business modules supply
// the calculated value; DOM access remains inside common_v2.
export function updateEditableCalculatedCell(root, line, key, value) {
    const cells = root.querySelectorAll('[data-calculated-line][data-calculated-key]');
    for (const cell of cells) {
        if (cell.dataset.calculatedLine === String(line) && cell.dataset.calculatedKey === key) {
            cell.textContent = value;
        }
    }
}
// Keep desktop and mobile representations of the same editable cell in sync.
export function syncEditableMirrors(root, source) {
    const line = source.dataset.line, key = source.dataset.key;
    if (line === undefined || !key)
        return;
    root.querySelectorAll('[data-line][data-key]').forEach(el => {
        if (el !== source && el.dataset.line === line && el.dataset.key === key)
            el.value = source.value;
    });
}
// Shared KPI dashboard: all markup and styling are owned by common_v2.
export const metricDashboard = (items) => `<div class="cv2-metric-dashboard" data-ui-component="metric-dashboard">${items.map((item, i) => `<section class="cv2-metric-dashboard__item${i >= 4 ? ' cv2-metric-dashboard__item--lower' : ''}"><div class="cv2-metric-dashboard__name">${esc(item.label)}</div><div class="cv2-metric-dashboard__value${item.tone ? ' cv2-metric-dashboard__value--' + esc(item.tone) : ''}">${esc(item.value)}<small>${esc(item.unit ?? '건')}</small></div><div class="cv2-metric-dashboard__description">${esc(item.description ?? '')}</div><div class="cv2-metric-dashboard__link">${action('상세보기 →', item.action, { variant: 'link' })}</div></section>`).join('')}</div>`;
/** Label and control together in panel action tools (common_v2). */
export const labeledTool = (label, widget) => `<span class="cv2-labeled-tool"><span>${esc(label)}</span>${widget}</span>`;
// Shared compact, single-column row actions for inquiry lists.
export const executionCell = (buttons) => tableContentCell(`<span class="cv2-execution-actions">${buttons.join('')}</span>`);
