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
}
