/** Explicit user cancellation of an unsaved register/edit workflow.
 * True means the caller must discard all transient draft/pending data and return to query.
 * False means the caller must leave the current state completely unchanged.
 */
export function confirmCancelWork(mode, hasWork, busy = false) {
    if (busy)
        return false;
    if (!hasWork)
        return true;
    return window.confirm(mode === 'register'
        ? '등록 중인 내용과 등록 예정 목록을 모두 취소하고 조회 화면으로 이동하시겠습니까?'
        : '수정 중인 변경사항을 취소하고 조회 화면으로 이동하시겠습니까?');
}
