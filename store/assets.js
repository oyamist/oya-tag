const AssetStore = require('../src/asset-store');
const JSON5 = require("json5");
const Axios = require('axios');

const COMPARE_ASSETS = (a,b)=>{
    return a.ageMillis - b.ageMillis;
}

export const state = () => ({
    list: [],
    assetStore: null,
})

function saveLocal(state, onSave) {
    var storage = window.localStorage;
    var assetStore = state.assetStore;
    if (assetStore) {
        var json = JSON.stringify(assetStore);
        storage.setItem(`oya-tag`, json);
        console.log(`saveLocal() ${json.length}B`);
        typeof onSave === 'function' && onSave(json);
    }

    return assetStore;
}

export const mutations = {
    set(state, assetStore) {
        state.assetStore = assetStore;
        state.list = state.assetStore.assets().sort(COMPARE_ASSETS);
        saveLocal(state);
        console.log(`$store.state.assetStore.set() assets:`, 
            state.list.length);
    },
    touch(/*state, value*/) {
        console.log(`$store.assets.touch`);
    },
    save(state, onSave) {
        var assetStore = state.assetStore;
        if (assetStore) {
            assetStore.saved = new Date();
            var indent = 2; // simplify edit and search
            var json = JSON.stringify(assetStore, null, indent);
            console.log(`assets/save ${json.length}B`);
            typeof onSave === 'function' && onSave(json);
        }
    },
    saveSettings(state, settings) {
        var assetStore = state.assetStore;
        if (assetStore) {
            Object.assign(assetStore.settings, settings);
            saveLocal(state);
            console.log(`assets/saveSettings`);
        }
    },
    updateAsset(state, value) {
        var assetStore = state.assetStore;
        if (assetStore) {
            console.log(`$store.updateAsset`, value );
            assetStore.updateAsset(value);
            state.list = assetStore.assets().sort(COMPARE_ASSETS);
            saveLocal(state);
        }
    },
    createId(state, payload) {
        var assetStore = state.assetStore;
        var id = assetStore ? assetStore.createId() : '';
        console.log(`dbg assetStore createId`, id);
        (payload instanceof Function) && payload(id);
    },
    load(state, url=`/sample-data.json5`) {
        var that = this;
        Axios.get(url).then(res => {
            var json = typeof res.data === 'string'
                ? JSON5.parse(res.data)
                : res.data;
            var assetStore = new AssetStore(json);
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
        saveLocal(state);
        opts.committed && opts.committed(asset);
    },
    remove (state, id) {
        var assetStore = state.assetStore;
        var asset = assetStore.removeAsset(id);
        console.log(`removed asset`, asset);
        saveLocal(state);
        state.list = assetStore.assets().sort(COMPARE_ASSETS);
    },
}
