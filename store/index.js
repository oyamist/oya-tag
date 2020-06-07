export const state = () => {
    return {
        selection: null,
    }
}

export const mutations = {
    select(state, value) {
        console.log(`$store.select`, value && value.name);
        state.selection = value;
    },
    update(state, value) {
        console.log(`$store.update`, value && value.name, state);
        Object.assign(state.selection, value);
    },
}
