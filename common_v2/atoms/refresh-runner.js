/** 공통 새로고침 실행부. DB/RPC 조회는 각 모듈이 콜백으로 제공한다. */
export async function runRefresh(options) {
    if (options.isBusy())
        return;
    options.setBusy(true);
    options.render();
    try {
        await options.reload();
    }
    catch (error) {
        options.onError(error);
    }
    finally {
        options.setBusy(false);
        options.render();
    }
}
/** 공통 초기화 실행부. 변경값 확인 및 초기 상태 구성은 각 모듈이 제공한다. */
export async function runReset(options) {
    if (options.isBusy() || (options.confirmDiscard && !options.confirmDiscard()))
        return;
    options.resetState();
    if (!options.reload) {
        options.render();
        return;
    }
    options.setBusy?.(true);
    options.render();
    try {
        await options.reload();
    }
    catch (error) {
        options.onError(error);
    }
    finally {
        options.setBusy?.(false);
        options.render();
    }
}
