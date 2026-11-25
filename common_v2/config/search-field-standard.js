// Central search-field classification. Modules provide filter IDs, values and data only.
// Add new semantic identifiers here; never infer widths from translated labels.
export const SEARCH_WIDTH_BY_FIELD = Object.freeze({
    company: 'compact', companyId: 'compact', status: 'compact', activeYn: 'compact',
    customer: 'party', customerId: 'party', vendor: 'party', vendorId: 'party', supplier: 'party',
    partName: 'part-name', part_name: 'part-name',
    part: 'part', partNo: 'part', part_no: 'part', partId: 'part',
    po: 'document', customerPo: 'document', customer_po: 'document',
    orderNo: 'document', purchaseNo: 'document', receiptNo: 'document', shipmentNo: 'document',
    invoiceNo: 'document', documentNo: 'document',
    dateFrom: 'date', dateTo: 'date', from: 'date', to: 'date',
    baseDate: 'date', closingMonth: 'date', orderDate: 'date',
    remark: 'long', spec: 'long'
});
export const SEARCH_WIDTH_BY_TYPE = Object.freeze({ date: 'date', month: 'date' });
export const SEARCH_WIDTH_KINDS = Object.freeze(['auto', 'compact', 'normal', 'date', 'party', 'document', 'part', 'part-name', 'long', 'wide', 'full']);
export function searchFieldWidthKind(field = {}) {
    // fieldType is a stable semantic category for new modules whose filter IDs differ.
    // The existing IDs are resolved centrally to avoid changing any business filter keys.
    const semanticId = field.fieldType || field.id;
    return SEARCH_WIDTH_BY_FIELD[semanticId] || SEARCH_WIDTH_BY_TYPE[field.type] || 'normal';
}
