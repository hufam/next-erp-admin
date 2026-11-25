import { editForm as sharedEditForm, panel, action, notice, changesTable } from '../assemblies/components.js';
import { cloneState, fieldChanges } from './form-state.js';
export const snapshot = cloneState;
export const changes = fieldChanges;
export function editForm({ heading, fields, original, current, notice: msg = '', confirming = false }) {
    const diff = changes(fields, original, current);
    return sharedEditForm({ title: heading, fields, values: current, saveDisabled: !diff.length }) +
        (confirming ? panel({ title: '변경사항 확인', children: changesTable(diff), tools: [action('확인취소', 'edit-back'), action('수정확정 (DEMO)', 'edit-confirm', { variant: 'primary' })] }) : '') + notice(msg);
}
