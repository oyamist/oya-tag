export const state = () => {
    return {
        selection: null,
        showAddAsset: false,
    }
}

export const mutations = {
    select(state, value) {
        console.log(`$store.select`, value && value.name);
        state.selection = value;
    },
    showAddAsset(state, value) {
        state.showAddAsset = value;
    },
}
