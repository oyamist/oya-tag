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
        constructor(map = {}, factoryMap={}) {
            this.jsonMap = {};
            this.idMap = {};
            this.guidAbbreviation = map.guidAbbreviation || 6;
            this.typeMap = {};
            Object.defineProperty(this, "factoryMap", {
                value: factoryMap,
            });
            Object.keys(map).forEach(k=>{
                var v = map[k];
                this.registerAsset(v, k);
            });
            this.jsonMap.ID_TEMPLATES = this.jsonMap.ID_TEMPLATES || {};
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
                let typeList = this.typeMap[type];
                if (typeList) {
                    this.typeMap[type].push(asset);
                } else {
                    this.typeMap[type] = [asset];
                }
            }
            this.jsonMap[uk] = asset;
            return asset;
        }
        
        toJSON() {
            return this.jsonMap;
        }

        assetOfId(key) {
            if (key == null) {
                return undefined;
            }
            key = key.toUpperCase();
            return this.jsonMap[key] || this.idMap[key];
        }

        createId(template = "A0000") {
            template = template.toUpperCase();
            var templates = this.jsonMap.ID_TEMPLATES;
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

        assets() {
            var {
                jsonMap,
            } = this;
            return Object.keys(jsonMap).reduce((a,k)=>{
                var v = jsonMap[k];
                var guid = v.guid && v.guid.toUpperCase();
                if (k === guid) {
                    a.push(v);
                }
                return a;
            }, []);
        }

        assetsOfType(type) {
            return this.typeMap[type].slice() || [];
        }

        timelines(type="crop", group="crop") {
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

