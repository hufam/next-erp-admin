import { QUERY_PAGE_SIZE } from '../config/pagination-standard.js';
// Shared query UI state: draft/applied filters, sorting and pagination.
// Business filtering and row formatting remain in the query screen configuration.
// ERP-wide data column ordering. Empty values are grouped; numeric-looking values
// (including formatted amounts) are compared numerically, then dates and Korean text.
const sortCollator = new Intl.Collator('ko-KR', { numeric: true, sensitivity: 'base' });
export function compareColumnValues(left, right) {
    const a = left == null ? '' : String(left).trim();
    const b = right == null ? '' : String(right).trim();
    if (!a || !b)
        return !a && !b ? 0 : !a ? 1 : -1;
    const numberPattern = /^[-+]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/;
    if (numberPattern.test(a) && numberPattern.test(b)) {
        const x = Number(a.replace(/,/g, ''));
        const y = Number(b.replace(/,/g, ''));
        if (Number.isFinite(x) && Number.isFinite(y))
            return x - y;
    }
    return sortCollator.compare(a, b);
}
export function sortColumnRecords(rows, sort) {
    if (!sort?.key)
        return [...rows];
    return [...rows].sort((a, b) => compareColumnValues(a[sort.key], b[sort.key]) * (sort.dir === -1 ? -1 : 1));
}
export function createQueryState(defaultSort, { pageSize = QUERY_PAGE_SIZE, defaults = {} } = {}) {
    const initial = { ...defaults };
    const state = { filters: { ...initial }, applied: { ...initial }, sort: { key: defaultSort, dir: -1 }, page: 1 };
    return {
        state,
        setFilter(id, value) { state.filters[id] = value; },
        search() { state.applied = { ...state.filters }; state.page = 1; },
        refresh() { },
        reset() { state.filters = { ...initial }; state.applied = { ...initial }; state.sort = { key: defaultSort, dir: -1 }; state.page = 1; },
        sortBy(key) { state.sort = { key, dir: state.sort.key === key ? -state.sort.dir : 1 }; },
        pageCount(length) { return Math.max(1, Math.ceil(length / pageSize)); },
        clamp(length) { state.page = Math.max(1, Math.min(state.page, this.pageCount(length))); },
        movePage(delta, length) { state.page += delta; this.clamp(length); },
        sorted(rows) { return sortColumnRecords(rows, state.sort); },
        slice(rows) { this.clamp(rows.length); return rows.slice((state.page - 1) * pageSize, state.page * pageSize); },
    };
}
// Standard list return: the module supplies its existing DB query callback.
// Preserve the applied search, sort and page; never reload the browser.
export async function refreshListOnReturn(queryState, reload, showList) {
    await reload();
    // The reload callback preserves and clamps the page against fresh DB rows.
    // Restoring the old page after clamping would create an invalid page.
    showList();
}
