const AssetStore = require('../src/asset-store');
const JSON5 = require("json5");
//const Crop = require('../src/crop');
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
        console.log(`$store.state.assetStore.set() assets:`, 
            state.list.length);
    },
    touch(/*state, value*/) {
        console.log(`$store.assets.touch`);
    },
    updateAsset(state, value) {
        var assetStore = state.assetStore;
        if (assetStore) {
            console.log(`$store.updateAsset`, value );
            assetStore.updateAsset(value);
            state.list = assetStore.assets().sort(COMPARE_ASSETS);
        }
    },
    clear(state) {
        mutations.load.apply(this, state);
    },
    load(state, url=`/sample-data.json5`) {
        var factoryMap = {
            //crop: Crop,
        }
        var that = this;
        Axios.get(url).then(res => {
            var json = JSON5.parse(res.data);
            var assetStore = new AssetStore(json, factoryMap);
            console.log('$store.assets.load() url:', url, json,);
            that.commit(`assets/set`, assetStore);
        }).catch(e => {
            var data = e.response && e.response.data || `Not found.`;
            console.error(e.stack, data);
        });
    },
    add (state, opts) {
        var asset = state.assetStore.createAsset(opts);
        console.log(`$store.state.assetStore.add`, asset);
        state.list = state.assetStore.assets().sort(COMPARE_ASSETS);
        opts.committed && opts.committed(asset);
    },
    remove (state, id) {
        var assetStore = state.assetStore;
        var asset = assetStore.removeAsset(id);
        console.log(`removed asset`, asset);
        state.list = assetStore.assets().sort(COMPARE_ASSETS);
    },
}
