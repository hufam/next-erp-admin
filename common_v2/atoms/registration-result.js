/** Shared batch insert result validation: never infer DB success from a partial response. */
export function validateInsertedIds(value, expected) {
    if (!Array.isArray(value) || value.length !== expected ||
        !value.every(id => Number.isSafeInteger(Number(id)) && Number(id) > 0) ||
        new Set(value.map(Number)).size !== expected) {
        throw new Error('등록 결과 ID 확인 실패: DB 저장 여부를 확인하십시오. 다시 등록하지 마십시오.');
    }
    return value.map(Number);
}
