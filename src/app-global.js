(function(exports) {
    const Selection = require("./selection");
    const Crop = require("./crop");
    const CropStore = require("./crop-store");

    class AppGlobal {
        constructor() {
            this.selection = new Selection();
        }

        static g() {
            return window.g = window.g || new AppGlobal();
        }

        load(vue, http) {
            return new Promise((resolve,reject) => {
                var url = `/sample-data.json`;
                var assetMap = {
                    crop: Crop,
                }
                http.get(url).then(res => {
                  var assetStore = new CropStore(res.data, assetMap);
                  vue.$nextTick(()=>{
                      vue.$set(vue.g, "assetStore", assetStore);
                      console.log('g.load() => CropStore', url, vue.$set);
                      resolve(assetStore);
                  });
                }).catch(e => {
                  var data = e.response && e.response.data || `Not found.`;
                  console.error(e.stack, data);
                  reject(e);
                });
            });
        }
    }

    module.exports = exports.AppGlobal = AppGlobal;
})(typeof exports === "object" ? exports : (exports = {}));

