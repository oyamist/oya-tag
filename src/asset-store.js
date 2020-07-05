(function(exports) {
    const Asset = require('./asset');
    const mixedCase = {
        nextId: true,
    };

    function callNew(ctor, ...args) {
        var factoryFunction = ctor.bind.apply(ctor, [null, ...args]);
        return new factoryFunction();
    }

    function match(value='', re) {
        var result = false;
        if (value == null) {
            // do nothing
        } else if (typeof value === 'string') {
            result =  re.test(value);
        } else {
            result = match(JSON.stringify(value), re);
        }
        return result;
    }
    
    class AssetStore {
        constructor(opts = {}, factoryMap={}) {
            // serialized properties
            var assetMap = (opts.assetMap || {});
            this.assetMap = {};
            this.settings = AssetStore.appliedSettings(opts.settings);
            this.guidAbbreviation = opts.guidAbbreviation || 6;

            // non-serialized properties
            Object.defineProperty(this, "assetFilter", {
                value: opts.assetFilter || AssetStore.assetFilter,
            });

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

        static assetFilter(assetStore, search, asset) {
            var re = new RegExp(`\\b(${search})`, "uig");
            return Object.keys(asset).reduce((a,k)=>{
                if (a) {
                    // skip
                } else if (k === 'tags') {
                    var tags = asset.tags;
                    a = Object.keys(tags).reduce((a,tk)=> {
                        var tag = tags[tk];
                        a = a || 
                            match(tag.name, re) || 
                            match(tag.note, re);
                        if (!a && assetStore) {
                            var tagAsset = assetStore.assetOfId(tag.name);
                            a = tagAsset && match(tagAsset.name, re);
                        }
                        return a;
                    }, a);
                } else {
                    var v = asset[k];
                    a = a || match(v, re);
                }
                return a;
            }, false);
        }

        static appliedSettings(opts={}) {
            return Object.assign({
                idTemplates: {
                    "A0000": 1,
                }
            }, opts);
        }

        filter(search) {
            var that = this;
            var {
                assetFilter,
            } = that;
            return that.assets()
                .filter(a=>assetFilter(that, search, a));
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
            var uk = key.toUpperCase();
            return this.assetMap[uk] || this.idMap[uk];
        }

        static createName(asset) {
            var id = asset.id;
            if (id) {
                var suffix = asset.id.replace(/[^0-9]*/ug, "");
                var customKeys = Asset.customKeys(asset);
                var customVal0 = customKeys && asset[customKeys[0]];
                var prefix = (customVal0 || asset.type).toUpperCase();
                return `${prefix}${suffix}`;
            } else {
                return ``;
            }
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
            var cropMap = {};
            var assets = this.assetsOfType(type);
            assets.forEach(asset=>{
                var id = asset[group];
                var valRef = this.assetOfId(id);
                var name = valRef && valRef.name || id;
                var timeline = cropMap[name];
                if (!timeline) {
                    timeline = {
                        id,
                        name,
                        items: [],
                    }
                    cropMap[name] = timeline;
                    timelines.push(timeline);
                }
                timeline.items.push(asset);
            });
            return timelines.sort((a,b) => {
                return a.name.localeCompare(b.name);
            });
        }

    } // class AssetStore

    module.exports = exports.AssetStore = AssetStore;
})(typeof exports === "object" ? exports : (exports = {}));

