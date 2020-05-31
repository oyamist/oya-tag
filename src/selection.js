(function(exports) {
    const {
        logger,
    } = require('just-simple').JustSimple;
    
    class Selection {
        constructor(opts ={}) {
            this.name = opts.name || "Selection";
            this.maxItems = opts.maxItems || 1;
            logger.logInstance(this);
            this.clear();
        }

        static get TYPE_EMPTY() { return "empty";}

        add(item) {
            if (item.type !== this.type) {
                this.clear();
                this.type = item.type;
            }
            if (this.items.length+1 > this.maxItems) {
                this.clear();
            }
            this.items.push(item);
            return this;
        }

        clear() {
            this.type = Selection.TYPE_EMPTY;
            this.items = [];
            return this;
        }

        contains(item) {
            return this.items.reduce((a,it) => (
                a || it === item
            ), false);
        }

        handleClick(item, event) {
            if (this.items.length >= this.maxItems) {
                this.clear();
            }
            if (this.contains(item)) {
                if (event.ctrlKey || event.shiftKey) {
                    this.items = this.items.filter(it => it !== item);
                } else {
                    this.clear();
                    this.add(item);
                }
            } else {
                if (!event.ctrlKey && !event.shiftKey) {
                    this.clear();
                }
                this.add(item);
            }
        }

    }

    module.exports = exports.Selection = Selection;
})(typeof exports === "object" ? exports : (exports = {}));

