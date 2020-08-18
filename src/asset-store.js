(function(exports) {
    const Asset = require('./asset');
    const MerkleJson = require('merkle-json').MerkleJson;
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
            var mj = new MerkleJson();

            // serialized properties
            var assetMap = (opts.assetMap || {});
            this.assetMap = {};
            this.settings = AssetStore.appliedSettings(opts.settings);
            this.importUpdate = !!opts.importUpdate;
            this.guidAbbreviation = opts.guidAbbreviation || 6;
            this[mj.hashTag] = opts[mj.hashTag];

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
            Object.defineProperty(this, "mj", {
                value: mj,
            });
            Object.keys(assetMap).forEach(k=>{
                var v = assetMap[k];
                this.registerAsset(v, k);
            });
        }

        static sanitizePattern(pattern) {
            if (!pattern) {
                throw new Error("SuttaStore.search() pattern is required");
            }
            const MAX_PATTERN = 1024;
            var excess = pattern.length - MAX_PATTERN;
            if (excess > 0) {
                throw new Error(
                    `Search text too long by ${excess} characters.`);
            }
            // replace parentheses (code injection on grep argument)
            pattern = pattern.replace(/[(){}[\]]/g,'.'); 
            // replace quotes (code injection on grep argument)
            pattern = pattern.replace(/["']/g,'.'); 
            // eliminate tabs, newlines and carriage returns
            pattern = pattern.replace(/\s/g,' '); 
            // remove control characters
            /* eslint-disable no-control-regex */
            pattern = pattern.replace(/[\u0000-\u001f\u007f]+/g,''); 
            /* eslint-enable no-control-regex */
            // must be valid

            return pattern;
        }

        static assetFilter(assetStore, search, asset) {
            var pattern = AssetStore.sanitizePattern(search);
            var re = new RegExp(`\\b(${pattern})`, "uig");
            return Object.keys(asset).reduce((a,k)=>{
                if (a) {
                    // skip
                } else if (k === 'tagList') {
                    a = asset.tagList.reduce((a, tag) => {
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
            var { mj, assetMap, } = this;
            var ignoreCase = { ignorePunctuation: true };
            var guids = Object.keys(assetMap)
                .sort((a,b) => a.localeCompare(b, 'en', ignoreCase));
            var json = Object.assign({}, this);
            json.assetMap = guids.reduce((a,g) => {
                a[g] = assetMap[g];
                return a;
            }, {});
            this[mj.hashTag] = json[mj.hashTag] = mj.hash(json, false);
            return json;
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
                var key0 = customKeys[0];
                var customVal0 = customKeys && asset[key0];
                var prefix = (customVal0 || asset.type).toUpperCase();
                return `${prefix}-${suffix}`;
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
            for(;;) {
                var num = zeros + nextId;
                var id = [
                    prefix,
                    num.substring(num.length-zeros.length),
                    suffix,
                ].join('');
                if (!this.assetOfId(id)) {
                    break;
                }
                nextId++;
            }
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

        importAssets(src) {
            var dst = this;
            var keys = src && Object.keys(src.assetMap);
            if (!keys || !keys.length) {
                throw new Error("expected { assetMap }")
            }
            keys.forEach(k=>{
                var srcAsset = src.assetMap[k];
                var dstAsset = dst.assetMap[k];
                if (srcAsset) {
                    if (dst.importUpdate) {
                        if (dstAsset) {
                            Object.assign(dstAsset, srcAsset);
                        } else {
                            dst.registerAsset(srcAsset);
                        }
                    } else {
                        if (!dstAsset) {
                            dst.registerAsset(srcAsset);
                        }
                    }
                }
            });
        }

    } // class AssetStore

    module.exports = exports.AssetStore = AssetStore;
})(typeof exports === "object" ? exports : (exports = {}));

