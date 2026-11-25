// Shared state primitives for TYPE A/B registration and editing. No business rules or RPCs.
export const cloneState = value => structuredClone(value);
export const emptyFields = fields => Object.fromEntries(fields.map(f => [f.id, f.default ?? '']));
export const sameValue = (a, b) => String(a ?? '') === String(b ?? '');
export function fieldChanges(fields, original, current) {
    return fields.filter(f => !sameValue(original?.[f.id], current?.[f.id])).map(f => ({ id: f.id, label: f.label, before: String(original?.[f.id] ?? ''), after: String(current?.[f.id] ?? '') }));
}
export function makeEditState(value) {
    let original = cloneState(value), current = cloneState(value), confirming = false;
    return {
        get original() { return original; }, get current() { return current; }, get confirming() { return confirming; },
        update(fn) { fn(current); confirming = false; },
        reset() { current = cloneState(original); confirming = false; },
        beginConfirm() { confirming = true; }, cancelConfirm() { confirming = false; },
        commit() { original = cloneState(current); confirming = false; },
        replace(value) { original = cloneState(value); current = cloneState(value); confirming = false; }
    };
}
export function makeRegistrationState(headerFields, itemFields, { initialItem = true } = {}) {
    const fresh = () => ({ header: emptyFields(headerFields), items: initialItem ? [emptyFields(itemFields)] : [] });
    let data = fresh();
    return { get data() { return data; }, reset() { data = fresh(); }, addItem() { data.items.push(emptyFields(itemFields)); }, removeItem(i) { if (Number.isInteger(i) && i >= 0 && i < data.items.length)
            data.items.splice(i, 1); } };
}
