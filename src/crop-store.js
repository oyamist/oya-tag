(function(exports) {
    const Crop = require('./crop');
    const AssetStore = require('./asset-store');

    class CropStore extends AssetStore {
        constructor(map = {}, factoryMap=CropStore.FACTORY_MAP) {
            super(map, factoryMap);
        }

        static get FACTORY_MAP() {
            return {
                crop: Crop,
            }
        }

        crops() {
            return this.assetsOfType("crop");
        }

        timelines() {
            var timelines = [];
            var map = {};
            this.crops().forEach(c=>{
                var timeline = map[c.crop];
                if (!timeline) {
                    let name = c.crop;
                    timeline = {
                        name,
                        items: [],
                    }
                    map[name] = timeline;
                    timelines.push(timeline);
                }
                timeline.items.push(c);
            });
            return timelines;
        }

    } //// class CropStore

    module.exports = exports.CropStore = CropStore;
})(typeof exports === "object" ? exports : (exports = {}));

