(function(exports) {

    class Tag {
        constructor(opts={}) {
            if (opts.date == null) {
                this.date = new Date();
            } else if (opts.date instanceof Date) {
                this.date = opts.date;
            } else if (typeof opts.date === 'string') {
                this.date = new Date(opts.date);
            } else if (typeof opts.date === 'number') {
                this.date = new Date(Date.now() + opts.date);
            } else {
                throw new Error(`Provided date must be `+
                    `Date, string or number`);
            }

            this.applies = opts.applies === 'true' || opts.applies === true;
            this.name = opts.name || '';
            this.note = opts.note;
        }

    } // class Tag

    module.exports = exports.Tag = Tag;
})(typeof exports === "object" ? exports : (exports = {}));

