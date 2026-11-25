// Shared read-only information dialog. Presentation follows the common remark dialog.
import { button } from './interactive.js';
export function mountInfoDialog(root, { signal, resolve }) {
    let dialog = null;
    const close = () => { if (dialog?.open)
        dialog.close(); dialog?.remove(); dialog = null; };
    root.addEventListener('click', event => {
        const trigger = event.target.closest?.('button[data-action="show-unavailable-reason"]');
        if (!trigger || !root.contains(trigger))
            return;
        const info = resolve(trigger.dataset.id || '');
        if (!info)
            return;
        close();
        dialog = document.createElement('dialog');
        dialog.className = 'cv2-remark-dialog cv2-info-dialog';
        const body = document.createElement('div');
        body.className = 'cv2-remark-dialog__body';
        const heading = document.createElement('h2');
        heading.className = 'cv2-info-dialog__heading';
        heading.textContent = info.title;
        const section = (label, value) => {
            const wrapper = document.createElement('section');
            wrapper.className = 'cv2-info-dialog__section';
            const labelEl = document.createElement('strong');
            labelEl.className = 'cv2-info-dialog__label';
            labelEl.textContent = label;
            const valueEl = document.createElement('p');
            valueEl.className = 'cv2-info-dialog__text';
            valueEl.textContent = value;
            wrapper.append(labelEl, valueEl);
            return wrapper;
        };
        const reasonSection = section('사유', info.reason);
        const actionSection = section('조치사항', info.action);
        const footer = document.createElement('div');
        footer.className = 'cv2-remark-dialog__actions';
        footer.innerHTML = button({ label: '닫기', action: 'close-info-dialog' });
        footer.addEventListener('click', e => { if (e.target.closest('button'))
            close(); });
        body.append(heading, reasonSection, actionSection, footer);
        dialog.append(body);
        const current = dialog;
        document.body.append(current);
        current.addEventListener('close', () => { current.remove(); if (dialog === current)
            dialog = null; });
        current.showModal();
    }, signal ? { signal } : undefined);
    signal?.addEventListener('abort', close, { once: true });
    return { close };
}
