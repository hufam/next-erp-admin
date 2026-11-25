/**
 * common_v2 only: keep TYPE SCROLL tables inside the remaining viewport.
 * Modules call this shared binding once; they never calculate DOM sizes.
 * No changes to TYPE PAGINATION or existing list consumers.
 */
export function bindListViewport(root, { signal } = {}) {
    let frame = 0;
    const update = () => {
        frame = 0;
        root.querySelectorAll('.cv2-list-content--scroll .cv2-table-scroll').forEach(table => {
            const top = table.getBoundingClientRect().top;
            // Show up to 12 complete data rows while keeping the card inside the viewport.
            // Use actual table row/header heights so the shared sizing follows common_v2 typography.
            const header = table.querySelector("thead tr");
            const row = table.querySelector("tbody tr");
            const headerHeight = header?.getBoundingClientRect().height ?? 35;
            const rowHeight = row?.getBoundingClientRect().height ?? 35;
            const twelveRowsHeight = Math.ceil(headerHeight + rowHeight * 12 + 2);
            const viewportSpace = Math.floor(window.innerHeight - top - 28);
            const available = Math.max(120, Math.min(twelveRowsHeight, viewportSpace));
            table.style.setProperty('--cv2-list-scroll-max-height', `${available}px`);
        });
    };
    const schedule = () => {
        if (frame)
            return;
        frame = window.requestAnimationFrame(update);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true });
    window.addEventListener('resize', schedule);
    schedule();
    const cleanup = () => {
        observer.disconnect();
        window.removeEventListener('resize', schedule);
        if (frame)
            window.cancelAnimationFrame(frame);
    };
    signal?.addEventListener('abort', cleanup, { once: true });
    return cleanup;
}
