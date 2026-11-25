// Shared A4 portrait, multi-page handwriting record sheet.
// Data and labels are supplied by the calling module; this assembly owns the markup.
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
export function openRecordSheet(options) {
    const win = window.open('', '_blank');
    if (!win) {
        window.alert('인쇄 창이 차단되었습니다. 팝업을 허용한 후 다시 시도하세요.');
        return false;
    }
    const { title, subtitle = '', metadata, columns, widths = [], rows, signatureLabels = ['작성', '확인'], footer = '' } = options;
    const perPage = Math.max(1, Math.floor(options.rowsPerPage ?? 25));
    const pages = [];
    for (let i = 0; i < rows.length; i += perPage)
        pages.push(rows.slice(i, i + perPage));
    if (!pages.length)
        pages.push([]);
    const colgroup = widths.length === columns.length ? `<colgroup>${widths.map(w => `<col style="width:${escapeHtml(w)}">`).join('')}</colgroup>` : '';
    const htmlPages = pages.map((page, index) => {
        const dataRows = page.map(row => `<tr>${row.map(v => `<td>${escapeHtml(v)}</td>`).join('')}</tr>`).join('');
        const emptyRows = Array.from({ length: perPage - page.length }, () => `<tr><td colspan="${columns.length}">&nbsp;</td></tr>`).join('');
        const meta = metadata.map(([key, value]) => `<div><span>${escapeHtml(key)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
        const sign = signatureLabels.map(label => `<div class="sign"><b>${escapeHtml(label)}</b><span></span></div>`).join('');
        return `<main class="sheet"><header><div><small>${escapeHtml(subtitle)}</small><h1>${escapeHtml(title)}</h1></div><aside>${index + 1} / ${pages.length} 페이지</aside></header><section class="meta">${meta}</section><table>${colgroup}<thead><tr>${columns.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${dataRows}${emptyRows}</tbody></table><div class="bottom"><div class="footer">${escapeHtml(footer)}</div><div class="signatures">${sign}</div></div></main>`;
    }).join('');
    win.document.open();
    win.document.write(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
  *{box-sizing:border-box}body{margin:0;background:#e9eef5;font-family:'Malgun Gothic',sans-serif;color:#15233b}
  .toolbar{padding:12px 20px;background:white;position:sticky;top:0;display:flex;justify-content:flex-end}
  .toolbar button{background:#194a8d;color:white;border:0;padding:10px 20px;cursor:pointer}
  .sheet{width:210mm;height:297mm;padding:12mm 11mm 10mm;margin:14px auto;background:white;display:flex;flex-direction:column;break-after:page;overflow:hidden}
  header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #173b70;padding-bottom:5px}
  h1{font-size:15pt;letter-spacing:1.5px;margin:3px 0 0}header small,aside{font-size:9pt;color:#536783}
  .meta{display:flex;gap:18px;padding:7px 2px;font-size:9pt}.meta div{display:flex;gap:7px}.meta span{color:#61718a}
  table{width:100%;table-layout:fixed;border-collapse:collapse;font-size:10pt;border:1px solid #b7c6d8}
  th{background:#edf3fa;color:#24466e;font-size:10pt;padding:5px 3px;border:1px solid #b7c6d8}
  td{height:8mm;padding:2px 4px;border:1px solid #d7e0ea;overflow-wrap:anywhere;vertical-align:middle}
  tr{break-inside:avoid;page-break-inside:avoid}td:first-child{text-align:center}.bottom{margin-top:auto;flex-shrink:0;display:flex;align-items:end;justify-content:space-between;gap:12px;font-size:9pt}
  .footer{color:#536783}.signatures{display:flex}.sign{width:26mm;border:1px solid #b7c6d8;text-align:center}.sign+.sign{border-left:0}
  .sign b{display:block;background:#f1f5fa;border-bottom:1px solid #b7c6d8;padding:4px}.sign span{display:block;height:17mm}
  @page{size:A4 portrait;margin:0}@media print{body{background:white}.toolbar{display:none}.sheet{margin:0;break-after:page;page-break-after:always}.sheet:last-child{break-after:auto;page-break-after:auto}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body><div class="toolbar"><button onclick="window.print()">인쇄 / PDF 저장</button></div>${htmlPages}</body></html>`);
    win.document.close();
    win.focus();
    return true;
}
