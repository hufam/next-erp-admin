import { closeModuleWindow } from './module-close.js';
import { numericValidationError } from './numeric.js';
import { bindActions, bindInputs, syncDirtyButton, syncTotals } from './actions.js';
import { page, form, itemList, panel, action, notice, documentChangesTable } from '../assemblies/components.js';
import { cloneState, emptyFields, sameValue, makeEditState } from './form-state.js';
const clone = cloneState;
const value = (v) => String(v ?? '');
export function documentDiff(spec, original, current) {
    const diffs = [];
    for (const f of spec.header) {
        if (!sameValue(original.header[f.id], current.header[f.id]))
            diffs.push({ where: 'Header', field: f.label, before: value(original.header[f.id]), after: value(current.header[f.id]) });
    }
    const n = Math.max(original.items.length, current.items.length);
    for (let i = 0; i < n; i++) {
        const a = original.items[i], b = current.items[i];
        if (!a || !b) {
            diffs.push({ where: `${spec.itemLabel || '항목'} ${i + 1}`, field: a ? '행 삭제' : '행 추가', before: a ? '존재' : '—', after: b ? '존재' : '—' });
            continue;
        }
        for (const f of spec.item) {
            if (!sameValue(a[f.id], b[f.id]))
                diffs.push({ where: `${spec.itemLabel || '항목'} ${i + 1}`, field: f.label, before: value(a[f.id]), after: value(b[f.id]) });
        }
    }
    return diffs;
}
export function mountDocumentEdit(root, spec, { onQuery } = {}) {
    root.__cv2Cleanup?.();
    const controller = new AbortController();
    root.__cv2Cleanup = () => controller.abort();
    const defaults = emptyFields;
    // Module owns original business data and all pricing policies.
    const seed = spec.initialDocument || { header: defaults(spec.header), items: [defaults(spec.item)] };
    const original = cloneState(seed);
    const edit = makeEditState(original);
    const state = { notice: '' };
    Object.defineProperties(state, { original: { get: () => edit.original }, current: { get: () => edit.current }, confirming: { get: () => edit.confirming, set: v => v ? edit.beginConfirm() : edit.cancelConfirm() } });
    const empty = () => defaults(spec.item);
    const amounts = () => typeof spec.calculateAmounts === 'function' ? spec.calculateAmounts(state.current) : null;
    function validate() { const problems = []; for (const f of spec.header) {
        if (f.required && !value(state.current.header[f.id]).trim())
            problems.push(`${f.label} 필수`);
    } if (!state.current.items.length)
        problems.push(`${spec.itemLabel || '항목'} 1개 이상 필요`); state.current.items.forEach((item, i) => spec.item.forEach(f => { if (f.required && !value(item[f.id]).trim())
        problems.push(`${spec.itemLabel || '항목'} ${i + 1} ${f.label} 필수`); if (f.type === 'number') {
        const error = numericValidationError(item[f.id], f);
        if (error)
            problems.push(`${spec.itemLabel || '항목'} ${i + 1} ${f.label} ${error}`);
    } })); return problems; }
    function render() { const diff = documentDiff(spec, state.original, state.current); root.innerHTML = page({ title: spec.pageTitle, active: 'edit', secondary: [{ label: '초기화', action: 'reset' }, { label: '닫기', action: 'close' }], children: [form({ title: spec.pageTitle + ' 수정', fields: spec.header, values: state.current.header, tools: [action('수정취소', 'cancel'), action('수정저장', 'save', { variant: 'primary', disabled: !diff.length })] }), itemList({ fields: spec.item, items: state.current.items, view: spec.itemView || 'grid', amounts: amounts() }), state.confirming ? panel({ title: '변경사항 확인 (' + diff.length + '건)', tools: [action('확인취소', 'back'), action('수정확정', 'confirm', { variant: 'primary' })], children: documentChangesTable(diff) }) : '', notice(state.notice)], help: spec.help || '' }); }
    function update(e) { const t = e.target, k = t.dataset.key; if (!k)
        return; if (t.dataset.scope === 'header')
        state.current.header[k] = t.value;
    else if (t.dataset.scope === 'item' && state.current.items[Number(t.dataset.index)])
        state.current.items[Number(t.dataset.index)][k] = t.value; state.confirming = false; const diff = documentDiff(spec, state.original, state.current); syncDirtyButton(root, 'save', diff.length > 0); if (amounts())
        syncTotals(root, amounts()); }
    bindInputs(root, update, { signal: controller.signal });
    bindActions(root, (action, b, e) => {
        if (action === 'close') {
            if (documentDiff(spec, state.original, state.current).length && !window.confirm('수정 중인 내용을 버리고 닫으시겠습니까?'))
                return;
            closeModuleWindow();
        }
        else if (action === 'add-item') {
            state.current.items.push(empty());
            state.confirming = false;
            render();
        }
        else if (action === 'remove-item') {
            state.current.items.splice(Number(b.dataset.index), 1);
            state.confirming = false;
            render();
        }
        else if (action === 'reset') {
            edit.reset();
            state.notice = '원본 데이터로 초기화했습니다.';
            render();
        }
        else if (action === 'save') {
            const errors = validate();
            state.notice = errors.length ? '입력 확인: ' + errors.join(' / ') : '';
            state.confirming = !errors.length;
            render();
        }
        else if (action === 'back') {
            state.confirming = false;
            render();
        }
        else if (action === 'confirm') {
            if (validate().length)
                return;
            edit.commit();
            state.notice = spec.confirmNotice || '변경사항을 확인했습니다.';
            render();
        }
        else if (action === 'cancel' || action === 'query') {
            onQuery?.();
        }
        else if (action === 'register') {
            const next = new URL(location.href);
            next.searchParams.set('screen', 'register');
            location.href = next.href;
        }
    }, { signal: controller.signal });
    render();
}
