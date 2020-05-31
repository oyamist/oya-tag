(function(exports) {
    const MSDAY = 24 * 60 * 60 * 1000;
    const Asset = require('./asset');

    function createUUID() {
       return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
             .replace(/[xy]/g, c=>{
                 let r = Math.random() * 16 | 0;
                 let v = c == 'x' ? r : (r & 0x3 | 0x8);
                 return v.toString(16).toUpperCase();
              });
    }
    
    class Crop extends Asset {
        constructor(opts ={}) {
            super(opts);
            this.type = "crop";
            this.guid = opts.guid || createUUID();
            this.plant = opts.plant || "";
            this.history = opts.history || [];
            this.msAge = opts.msAge || MSDAY;
            if (opts.startDate instanceof Date) {
                this.startDate = opts.startDate;
            } else if (typeof opts.startDate === 'string') {
                this.startDate = new Date(opts.startDate);
            } else {
                this.startDate = new Date();
            }
            this.notes = opts.notes;
        }

        get startDay() {
            return this.startDate.toLocaleDateString();
        }

        get summary() {
            var {
              started,
              ageDays,
            } = this;
            var days = ageDays === 1 
                ? `1 day` : `${ageDays} days`;
            if (started) {
                return `${days} old`;
            } else if (ageDays === 0) {
                return `Start today`;
            } else if (ageDays < 0) {
                return `Start in ${days}`;
            } else {
                return `Delayed by ${days}`;
            }
        }
    }

    module.exports = exports.Crop = Crop;
})(typeof exports === "object" ? exports : (exports = {}));

