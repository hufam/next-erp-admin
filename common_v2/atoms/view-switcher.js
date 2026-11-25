// Common LIST <-> DETAIL view state. No business-specific assumptions.
export function createViewSwitcher() {
    let mode = 'list';
    let selectedId = null;
    let scrollY = 0;
    return {
        get mode() { return mode; },
        get selectedId() { return selectedId; },
        open(id, currentScrollY = 0) { selectedId = id; scrollY = currentScrollY; mode = 'detail'; },
        back() { mode = 'list'; selectedId = null; return scrollY; },
        reset() { mode = 'list'; selectedId = null; scrollY = 0; }
    };
}
