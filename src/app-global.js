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

        load(http) {
            var url = `/sample-data.json`;
            var assetMap = {
                crop: Crop,
            }
            http.get(url).then(res => {
              var assetStore = new CropStore(res.data, assetMap);
              this.assetStore = assetStore;
              console.log('g.load() => CropStore', url);
            }).catch(e => {
              var data = e.response && e.response.data || `Not found.`;
              console.error(e.stack, data);
            });
        }
    }

    module.exports = exports.AppGlobal = AppGlobal;
})(typeof exports === "object" ? exports : (exports = {}));

