(function(exports) {
    const Asset = require('./asset');

    class Crop extends Asset {
        constructor(opts ={}) {
            super(opts);
            this.type = "crop";
            this.plant = opts.plant || "";
        }

    }

    module.exports = exports.Crop = Crop;
})(typeof exports === "object" ? exports : (exports = {}));

