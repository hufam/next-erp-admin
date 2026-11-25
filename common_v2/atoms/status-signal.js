import { esc } from './interactive.js';
/** Shared, non-interactive status signal; text remains visible without color. */
export function statusSignal(label, tone = 'neutral') {
    const safeTone = ['neutral', 'warning', 'info', 'danger', 'success'].includes(tone) ? tone : 'neutral';
    return `<span class="cv2-status-signal cv2-status-signal--${safeTone}"><span aria-hidden="true">●</span> ${esc(label)}</span>`;
}
