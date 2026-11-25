// Shared remark editor: staged changes only; no database writes.
import { button, esc } from './interactive.js';
export { remarkTrigger } from './interactive.js';
export function mountRemarkEditor(root, { signal, onApply }) {
    let dialog = null;
    const close = () => { dialog?.close(); dialog?.remove(); dialog = null; };
    const listener = (event) => {
        const trigger = event.target?.closest?.('button[data-action="edit-remark"]');
        if (!trigger || !root.contains(trigger) || trigger.disabled)
            return;
        const fieldLabel = trigger.textContent?.replace(/\s*✓\s*$/, '').trim() || '비고';
        const scope = trigger.dataset.scope || 'header', index = Number(trigger.dataset.index || 0), key = trigger.dataset.key || 'remark';
        const state = root.__cv2RemarkValue?.(scope, index, key);
        const original = String(state ?? '');
        close();
        dialog = document.createElement('dialog');
        dialog.className = 'cv2-remark-dialog';
        dialog.innerHTML = `<form method="dialog" class="cv2-remark-dialog__body"><h2>${esc(fieldLabel)} 입력</h2><textarea class="cv2-remark-dialog__textarea" aria-label="${esc(fieldLabel)} 내용" rows="8" placeholder="${esc(fieldLabel)}를 입력하세요."></textarea><div class="cv2-remark-dialog__actions">${button({ label: '취소', action: 'remark-cancel' })}${button({ label: '적용', action: 'remark-apply', variant: 'primary' })}</div></form>`;
        const current = dialog;
        document.body.append(current);
        const textarea = current.querySelector('textarea');
        textarea.value = original;
        current.addEventListener('click', e => {
            const action = e.target.closest('button')?.dataset.action;
            if (action === 'remark-cancel') {
                e.preventDefault();
                close();
            }
            if (action === 'remark-apply') {
                e.preventDefault();
                const value = textarea.value;
                close();
                if (value !== original)
                    onApply({ scope, index, key, value });
            }
        });
        current.addEventListener('close', () => { if (dialog === current)
            dialog = null; current.remove(); });
        current.showModal();
        textarea.focus();
    };
    root.addEventListener('click', listener, signal ? { signal } : undefined);
    signal?.addEventListener('abort', close, { once: true });
    return { close };
}
