/** Common hierarchical screen history. Modules supply snapshots of their own state. */
export function createScreenHistory() {
    const parents = [];
    return {
        enter(snapshot) { parents.push(snapshot); },
        back() { return parents.pop(); },
        reset() { parents.length = 0; },
        get canGoBack() { return parents.length > 0; },
    };
}
