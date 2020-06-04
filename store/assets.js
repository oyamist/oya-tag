const AssetStore = require('../src/asset-store');
const Crop = require('../src/crop');
const Axios = require('axios');

const COMPARE_ASSETS = (a,b)=>{
    return a.ageMillis - b.ageMillis;
}

export const state = () => ({
    list: [],
    assetStore: null,
})

export const mutations = {
    set(state, assetStore) {
        state.assetStore = assetStore;
        state.list = state.assetStore.assets().sort(COMPARE_ASSETS);
        console.log(`state.assetStore.set() assets:`, state.list.length);
    },
    load(state, url=`/sample-data.json`) {
        var assetMap = {
            crop: Crop,
        }
        console.log('assets.load() url:', url);
        var that = this;
        Axios.get(url).then(res => {
            var assetStore = new AssetStore(res.data, assetMap);
            that.commit(`assets/set`, assetStore);
        }).catch(e => {
            var data = e.response && e.response.data || `Not found.`;
            console.error(e.stack, data);
        });
    },
    add (state, opts) {
        var asset = state.assetStore.createAsset(opts);
        console.log(`state.assetStore.add`, asset);
        state.list = state.assetStore.assets().sort(COMPARE_ASSETS);
    },
    remove (state, { asset }) {
        state.list.splice(state.list.indexOf(asset), 1)
    },
}
