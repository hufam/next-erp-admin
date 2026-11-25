/** 공용 문서 작성일자 선택 모달. 확인 전에는 업무 데이터에 영향이 없다. */
export function chooseDocumentDate({ title, label, initialDate, description }) {
    return new Promise(resolve => {
        const dialog = document.createElement('dialog');
        dialog.className = 'cv2-document-date-dialog';
        dialog.innerHTML = `<form method="dialog" class="cv2-document-date-dialog__body">
   <h2></h2><p class="cv2-document-date-dialog__description"></p>
   <label class="cv2-document-date-dialog__label"><span></span><input type="date" required /></label>
   <div class="cv2-document-date-dialog__actions"><button type="button" data-action="cancel">취소</button><button type="submit" data-action="confirm">확인</button></div>
  </form>`;
        dialog.querySelector('h2').textContent = title;
        dialog.querySelector('.cv2-document-date-dialog__description').textContent = description ?? '';
        dialog.querySelector('.cv2-document-date-dialog__label span').textContent = label;
        const input = dialog.querySelector('input');
        input.value = initialDate;
        let result = null;
        dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => dialog.close());
        dialog.querySelector('form').addEventListener('submit', e => {
            e.preventDefault();
            if (!input.checkValidity()) {
                input.reportValidity();
                return;
            }
            result = input.value;
            dialog.close();
        });
        dialog.addEventListener('close', () => { dialog.remove(); resolve(result); }, { once: true });
        document.body.append(dialog);
        dialog.showModal();
        input.focus();
    });
}
