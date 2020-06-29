(function(exports) {

    class Dates {
        static toMMDD(date=new Date()) {
            return date.toLocaleDateString(undefined, {
                month: "numeric",
                day: "numeric",
            });
        }

        static toMMDDYY(date=new Date()) {
            return date.toLocaleDateString(undefined, {
                year: "2-digit",
                month: "numeric",
                day: "numeric",
            });
        }

        static fromYMD(iso) {
            var msMinute = 60*1000;
            var tzoffset = (new Date()).getTimezoneOffset() * msMinute;
            var ms = new Date(iso).getTime()+tzoffset;
            return new Date(ms);
        }

    } // class Dates

    module.exports = exports.Dates = Dates;
})(typeof exports === "object" ? exports : (exports = {}));

