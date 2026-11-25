/**
 * 날짜 범위 변경 공통 검증.
 * 유효하지 않은 값은 상태에 반영하지 않고 기존 정상값을 유지합니다.
 * ISO 날짜(YYYY-MM-DD) 문자열을 사용합니다.
 */
export function validateDateRangeChange(currentFrom, currentTo, changed, candidate) {
    const validDate = (value) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
            return false;
        const date = new Date(`${value}T00:00:00Z`);
        return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    };
    if (!validDate(candidate))
        return { accepted: false, from: currentFrom, to: currentTo };
    const from = changed === 'from' ? candidate : currentFrom;
    const to = changed === 'to' ? candidate : currentTo;
    if (from && to && from > to)
        return { accepted: false, from: currentFrom, to: currentTo };
    return { accepted: true, from, to };
}
