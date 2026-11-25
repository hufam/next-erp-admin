/** Common reset contract: restore the current mode's entry state, never navigate.
 * A module owns business data and chooses the snapshot payload. The shared
 * controller owns the confirmation and snapshot lifetime.
 */
export function createInitialStateReset(options = {}) {
    const copy = options.clone ?? ((value) => structuredClone(value));
    let snapshot;
    let identity;
    return {
        enter(modeAndRecord, value) {
            identity = modeAndRecord;
            snapshot = copy(value);
        },
        hasSnapshot(modeAndRecord) {
            return identity === modeAndRecord && snapshot !== undefined;
        },
        reset(modeAndRecord, current, apply, prompt = '작성 중인 변경사항을 초기 상태로 복원하시겠습니까?') {
            if (identity !== modeAndRecord || snapshot === undefined)
                return false;
            if (JSON.stringify(current) === JSON.stringify(snapshot))
                return true;
            if (!(options.confirm ?? ((message) => window.confirm(message)))(prompt))
                return false;
            apply(copy(snapshot));
            return true;
        },
        clear() { identity = undefined; snapshot = undefined; },
    };
}
