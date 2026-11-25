/** Common browser file selection; the caller owns parsing and business validation. */
export function selectLocalFile(accept) {
    return new Promise(resolve => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.style.display = 'none';
        let settled = false;
        const finish = (file) => {
            if (settled)
                return;
            settled = true;
            window.removeEventListener('focus', onFocus);
            input.remove();
            resolve(file);
        };
        const onFocus = () => window.setTimeout(() => { if (!input.files?.length)
            finish(null); }, 500);
        input.addEventListener('change', () => finish(input.files?.[0] ?? null), { once: true });
        document.body.append(input);
        window.addEventListener('focus', onFocus, { once: true });
        input.click();
    });
}
