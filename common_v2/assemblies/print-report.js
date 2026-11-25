// common_v2: reusable read-only A4 print report. Browser print dialog supports "Save as PDF".
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function openPrintReport({ title = '', subtitle = '', metadata = [], metrics = [], columns = [], rows = [], numericColumns = [], footer = '' }) {
    const win = window.open('', '_blank');
    if (!win) {
        window.alert('인쇄 창이 차단되었습니다. 팝업을 허용한 후 다시 시도하세요.');
        return false;
    }
    const cells = rows.map(row => `<tr>${row.map((value, i) => `<td class="${numericColumns.includes(i) ? 'num' : ''}">${esc(value)}</td>`).join('')}</tr>`).join('');
    const meta = metadata.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
    const stats = metrics.map(({ label, value }) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('');
    const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(title)}</title>
 <style>
 @page{size:A4 landscape;margin:12mm}
 *{box-sizing:border-box}
 html{background:#e8edf4}
 body{font:11px/1.5 Arial,'Malgun Gothic',sans-serif;color:#1e293b;margin:0 auto;padding:12mm;width:297mm;min-height:210mm;background:white;box-shadow:0 3px 24px rgba(0,0,0,.16)}
 h1{font-size:18px;margin:0 0 2px;color:#17375f;text-align:center}
 .subtitle{color:#64748b;margin-bottom:14px;text-align:center}
 .meta{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;border-top:1px solid #d1d9e5;border-bottom:1px solid #d1d9e5;padding:9px 0;margin-bottom:12px}
 .meta div,.stats div{display:flex;flex-direction:column;gap:2px}
 .meta span,.stats span{color:#64748b;font-size:10px}
 .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;padding:6px 10px 12px;margin-bottom:14px;border-bottom:1px solid #d1d9e5}
 .stats strong{font-size:13px;color:#17375f}
 table{border-collapse:collapse;width:100%;table-layout:auto}
 th,td{border-bottom:1px solid #dce3ec;padding:6px 7px;vertical-align:top}
 th{background:#e8f0fa;color:#17375f;text-align:left;white-space:nowrap}
 th.num,td.num{text-align:right;font-variant-numeric:tabular-nums}
 thead{display:table-header-group}tr{break-inside:avoid}
 .footer{margin-top:10px;color:#64748b}
 .toolbar{display:flex;gap:8px;justify-content:flex-end;margin-bottom:16px}
 button{padding:8px 16px;background:#1d4d88;color:white;border:0;border-radius:4px;cursor:pointer}
 @media screen and (max-width:1122px){html{overflow-x:auto}body{margin:12px 0}}
 @media print{
  html{background:white}
  body{width:auto;min-height:0;margin:0;padding:0;box-shadow:none;background:white}
  .toolbar{display:none}
  thead{display:table-header-group}
  tr{break-inside:avoid;page-break-inside:avoid}
  h1,.subtitle,.meta,.stats{break-inside:avoid}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
 }
 </style></head><body>
 <div class="toolbar"><button onclick="window.print()">인쇄 / PDF 저장</button></div>
 <h1>${esc(title)}</h1><div class="subtitle">${esc(subtitle)}</div>
 <section class="meta">${meta}</section><section class="stats">${stats}</section>
 <table><thead><tr>${columns.map((x, i) => `<th class="${numericColumns.includes(i) ? 'num' : ''}">${esc(x)}</th>`).join('')}</tr></thead>
 <tbody>${cells || `<tr><td colspan="${columns.length}">조회 결과가 없습니다.</td></tr>`}</tbody></table>
 <div class="footer">${esc(footer)}</div></body></html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    return true;
}
