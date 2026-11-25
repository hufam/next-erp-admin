import { confirmCancelWork } from './cancel-work.js';
/** Explicit cancel/reset actions discard draft state without a redundant leave prompt.
 * Closing with unsaved data requires confirmation; pending rows count as unsaved data.
 */
export function mayLeaveMaster(mode, action, changed, busy) {
    if (busy)
        return false;
    if (action === 'query' && mode !== 'query')
        return confirmCancelWork(mode, changed, busy);
    if (!changed || action === 'reset')
        return true;
    return window.confirm('저장하지 않은 변경사항이 있습니다. 이동하시겠습니까?');
}
export const MASTER_BUTTON_GUIDE = [
    ['조회', '검색조건에 따라 DB 조회'],
    ['등록', '신규 등록화면 이동'],
    ['새로고침', '현재 화면의 DB 데이터 갱신'],
    ['초기화', '검색조건 및 입력 상태 초기화'],
    ['닫기', '모듈 종료. 미저장 데이터가 있으면 확인'],
    ['등록취소', '등록 작업을 취소하고 조회화면으로 복귀'],
    ['등록저장', '등록 예정 목록을 확인하고 DB 저장'],
    ['수정취소', '수정내용을 폐기하고 조회화면으로 복귀'],
    ['수정저장', '변경사항 확인 후 DB 저장']
];
