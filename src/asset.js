(function(exports) {
    const uuidv4 = require("uuid/v4");
    const Tag = require('./tag');
    const MSDAY = 24 * 60 * 60 * 1000;
    const SHORT_GUID_DIGITS = 6; // one less than git default
    const JSON_DATE = /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d/;
    const own = (obj,prop)=>Object.prototype.hasOwnProperty.call(obj,prop);
    const CORE_KEYS = {
        guid: true,
        name: true,
        id: true,
        type: true,
        tagList: true,
        tags: true,
    }
    
    class Asset {
        constructor(opts = {}) {
            // core properties
            this.guid = opts.guid || this.guid || uuidv4();
            if (own(opts, 'type')) {
                this.type = opts.type;
            } else {
                this.type = "asset";
            }
            var optTagList = opts.tagList || [];
            var tagList = [];
            var tags = {};
            if (optTagList.length) {
                optTagList.forEach(t => {
                    var tag = new Tag(t);
                    tags[tag.name] = tag;
                    tagList.push(tag);
                });
                tagList.sort(Asset.compareTag);
            } else {
                var srcTags = opts.tags || {};
                Object.keys(srcTags).forEach(k=>{
                    var value = new Tag(srcTags[k]);
                    tags[k] = value;
                    tagList.push(value);
                });
            }
            Object.defineProperty(this, "tagList", {
                enumerable: true,
                writable: true,
                value: tagList,
            });
            Object.defineProperty(this, "tags", {
                value: tags,
            });
            this.id = opts.id || 
                this.guid.substr(0,SHORT_GUID_DIGITS).toUpperCase();

            // ctor properties are non-temporal
            var keys = Object.keys(opts).filter(k=>!CORE_KEYS[k]); 
            keys.forEach(key => {
                this[key] = opts[key];
            });

            if (own(opts, 'name')) {
                this.name = opts.name;
            } else {
                this.name = `${this.namePrefix(opts)}${this.id}`;
            }
            if (tagList.length === 0) {
                var enteredTag = new Tag({
                    name: 'entered',
                    applies: true,
                });
                this.addTag(enteredTag);
            }
        }

        static get JSON_DATE() { return JSON_DATE; }

        static compareTag(a,b) {
            return a.date - b.date;
        }

        static compareId(a,b) {
            if (a.id < b.id) {
                return -1;
            }
            return  (a.id === b.id) ? 0 : 1;
        }
        static compareGuid(a,b) {
            if (a.guid < b.guid) {
                return -1;
            }
            return  (a.guid === b.guid) ? 0 : 1;
        }

        get summary() {
            return [
                this.id,
                this.name,
            ].join(' / ');
        }

        get firstTag() {
            return this.tagList.reduce((a,tag) => {
                return a && a.date < tag.date ? a : tag;
            }, null);
        }

        get lastTag() {
            return this.tagList.reduce((a,tag) => {
                return a && a.date > tag.date ? a : tag;
            }, this.tagList[0]);
        }

        get started() {
            var firstTag = this.firstTag;
            return firstTag && firstTag.applies;
        }

        get ageMillis() {
            var firstTag = this.firstTag;
            return firstTag ? new Date() - firstTag.date : 0;
        }

        get ageDays() {
            return Math.trunc(this.ageMillis/MSDAY);
        }

        get startDate() {
            return new Date(Date.now() - this.ageMillis);
        }

        age(msAge=MSDAY) {
            return Math.round(this.ageMillis/msAge);
        }

        static customKeys(asset) {
            return Object.keys(asset).filter(k=>!CORE_KEYS[k]);
        }

        customKeys() {
            return Asset.customKeys(this);
        }

        validateTag(tag) {
            if (tag == null) {
                throw new Error("Temporal value tag is required");
            }
            if (own(this, tag)) {
                throw new Error(
                    `Property "${tag}" is not a temporal property`);
            }
            return tag;
        }

        namePrefix() {
            return `${this.type}_`;
        }

        getTag(name) {
            var tag = this.tagList.filter(t => t.name === name)[0];
            return tag instanceof Tag ? tag : null;
        }

        addTag(tag) {
            var name = tag.name;
            var newTag = new Tag(tag);
            if (!this.tags[name]) {
                this.tagList.push(newTag);
                this.tagList.sort(Asset.compareTag);
            }
            this.tags[name] = newTag;

            return newTag;
        }

        deleteTag(arg) {
            var name = arg instanceof Tag ? arg.name : arg;
            var {
                tags,
                tagList,
            } = this;
            var tag = tags[name];
            if (tag) {
                this.tagList = tagList.filter(t=>t.name !== name);
                delete tags[name];
            }
            return tag;
        }

        toJSON() {
            return this;
        }


    } //// class Asset

    module.exports = exports.Asset = Asset;
})(typeof exports === "object" ? exports : (exports = {}));

