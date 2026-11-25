import { form, pending, action, notice } from '../assemblies/components.js';
export function registerTypeB({ heading = '신규 등록', listHeading = '등록 예정 목록', fields, values, items, notice: msg = '' }) {
    return form({ title: heading, fields, values, scope: 'draft', tools: [action('추가', 'stage', { variant: 'primary' })] }) +
        pending({ title: listHeading, fields, items, meta: `<span class="cv2-muted">${items.length}건</span>`, tools: [action('등록저장 (DEMO)', 'save', { variant: 'primary', disabled: !items.length })] }) + notice(msg);
}
