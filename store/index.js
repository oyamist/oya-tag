export const state = () => {
    console.log(`dbg store default`);
    return {
        counter: 0,
    }
}

export const mutations = {
    increment (state) {
        console.log(`dbg store increment`, state.counter);
        state.counter++;
    }
}
