/** 등록/수정 저장 전 사용자 확인. 메시지 내용은 업무 모듈이 제공합니다.
 * 취소 시 false를 반환하며 화면과 입력값을 변경하지 않습니다.
 */
export function confirmSave(message) {
    return window.confirm(String(message ?? '저장하시겠습니까?'));
}
/** DB 저장 성공 후 완료 확인창. 확인 버튼을 누르면 업무 흐름으로 복귀합니다. */
export function confirmSaveComplete(message) {
    window.alert(String(message ?? '저장되었습니다.'));
}
