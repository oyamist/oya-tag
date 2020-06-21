(function(exports) {
    const Asset = require('./asset');
    const mixedCase = {
        nextId: true,
    };

    function callNew(ctor, ...args) {
        var factoryFunction = ctor.bind.apply(ctor, [null, ...args]);
        return new factoryFunction();
    }
    
    class AssetStore {
        constructor(opts = {}, factoryMap={}) {
            // serialized properties
            var assetMap = (opts.assetMap || {});
            this.assetMap = {};
            this.settings = AssetStore.appliedSettings(opts.settings);
            this.guidAbbreviation = opts.guidAbbreviation || 6;

            // non-serialized properties
            Object.defineProperty(this, "idMap", {
                value: {},
            });
            Object.defineProperty(this, "factoryMap", {
                value: factoryMap,
            });
            Object.keys(assetMap).forEach(k=>{
                var v = assetMap[k];
                this.registerAsset(v, k);
            });
        }

        static appliedSettings(opts={}) {
            return Object.assign({
                idTemplates: {
                    "A0000": 1,
                }
            }, opts);
        }

        registerAsset(asset, id=asset.guid) {
            var {
                factoryMap,
            } = this;
            var uk = mixedCase[id] ? id : id.toUpperCase();
            var guid = (asset.guid || '').toUpperCase();
            if (uk === guid) {
                let type = asset.type;
                let factory = factoryMap[type];
                asset = factory
                    ? callNew(factory, asset)
                    : asset = new Asset(asset);
                var guidAbbrev = uk.substring(0, this.guidAbbreviation);
                this.idMap[guidAbbrev] = asset;
                this.idMap[asset.id.toUpperCase()] = asset;
            }
            this.assetMap[uk] = asset;
            return asset;
        }
        
        toJSON() {
            return this;
        }

        assetOfId(key) {
            if (key == null) {
                return undefined;
            }
            key = key.toUpperCase();
            return this.assetMap[key] || this.idMap[key];
        }

        createId(template = "A0000") {
            template = template.toUpperCase();
            var templates = this.settings.idTemplates;
            var nextId = templates[template];
            if (nextId == null) {
                templates[template] = nextId = 1;
            }
            var prefix = template.replace(/0+.*/,'');
            var zeros = template.replace(/[^0]/g,'');
            var suffix = template.replace(/.*0/,'');
            do {
                var num = zeros + nextId;
                var id = [
                    prefix,
                    num.substring(num.length-zeros.length),
                    suffix,
                ].join('');
                nextId++;
            } while (this.assetOfId(id));
            templates[template] = nextId;
            return id;
        }

        createAsset(opts={}) {
            if (opts.id == null) {
                opts = Object.assign({}, opts, {
                    id: this.createId(),
                });
            }
            var asset = new Asset(opts);
            return this.registerAsset(asset);
        }

        removeAsset(id) {
            var asset = this.assetOfId(id);
            if (!asset) {
                return undefined;
            }

            delete this.idMap[asset.id.toUpperCase()];
            delete this.assetMap[asset.guid.toUpperCase()];

            return asset;
        }

        updateAsset(asset) {
            this.removeAsset(asset.guid);
            return this.createAsset(asset);
        }

        assets() {
            var {
                assetMap,
            } = this;
            return Object.keys(assetMap).reduce((a,k)=>{
                var v = assetMap[k];
                var guid = v.guid && v.guid.toUpperCase();
                if (k === guid) {
                    a.push(v);
                }
                return a;
            }, []);
        }

        assetsOfType(type) {
            var assets = this.assets().filter(a=>a.type===type);
            return assets || [];
        }

        timelines(type="crop", group="plant") {
            var timelines = [];
            var map = {};
            var assets = this.assetsOfType(type);
            assets.forEach(asset=>{
                var key = asset[group];
                var timeline = map[key];
                if (!timeline) {
                    let name = key;
                    timeline = {
                        name,
                        items: [],
                    }
                    map[name] = timeline;
                    timelines.push(timeline);
                }
                timeline.items.push(asset);
            });
            return timelines;
        }

    } //// class Asset

    module.exports = exports.AssetStore = AssetStore;
})(typeof exports === "object" ? exports : (exports = {}));

