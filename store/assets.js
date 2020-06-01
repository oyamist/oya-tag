const CropStore = require('../src/crop-store');
const Crop = require('../src/crop');
const Axios = require('axios');

export const state = () => ({
    list: [],
    assetStore: null,
})

export const mutations = {
    set(state, assetStore) {
        state.assetStore = assetStore;
        state.list = state.assetStore.assets();
        console.log('state.assetStore.set() ', state.list.length);
    },
    load(state, url=`/sample-data.json`) {
        var assetMap = {
            crop: Crop,
        }
        console.log('state.assetStore.load() get ', url);
        var that = this;
        Axios.get(url).then(res => {
            var assetStore = new CropStore(res.data, assetMap);
            that.commit(`assets/set`, assetStore);
        }).catch(e => {
            var data = e.response && e.response.data || `Not found.`;
            console.error(e.stack, data);
        });
    },
    add (state, text) {
        state.list.push({
            text,
        })
    },
    remove (state, { asset }) {
        state.list.splice(state.list.indexOf(asset), 1)
    },
}
