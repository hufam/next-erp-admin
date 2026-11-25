import { supabase } from '../../supabase.js';
export async function loadCompanyMasters() {
    if (!supabase)
        throw new Error('Supabase 연결 설정이 없습니다.');
    const result = [];
    for (let from = 0; from < 100000; from += 1000) {
        const { data, error } = await supabase
            .from('md_company')
            .select('id,company_name')
            .eq('active_yn', 'Y')
            .order('id', { ascending: true })
            .range(from, from + 999);
        if (error)
            throw new Error(`회사 마스터 조회 실패: ${error.message}`);
        const rows = (data ?? []).map(row => ({
            id: Number(row.id),
            company_name: String(row.company_name ?? '').trim(),
        }));
        if (rows.some(row => !Number.isSafeInteger(row.id) || row.id <= 0 || !row.company_name)) {
            throw new Error('회사 마스터 ID 또는 공식 회사명이 올바르지 않습니다.');
        }
        result.push(...rows);
        if (rows.length < 1000)
            return result;
    }
    throw new Error('회사 마스터가 100,000건을 초과했습니다.');
}
export function companySelectOptions(companies) {
    return companies.map(company => ({ value: String(company.id), label: company.company_name }));
}
