// ERP-wide query-list pagination policy. Change the page size here only.
// DB batch sizes, PDF pages and editable form grids are not query-list pages.
export const QUERY_PAGE_SIZE = 12;
// The list rendering mode is selected by module configuration, not module CSS.
export const QUERY_LIST_TYPES = { SCROLL: 'scroll', PAGINATION: 'pagination' };
export const DEFAULT_QUERY_LIST_TYPE = QUERY_LIST_TYPES.PAGINATION;
