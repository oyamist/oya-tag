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
            var tzminutes = (new Date()).getTimezoneOffset();
            var tzms = tzminutes * 60*1000;
            if (iso.length === 10) {
                iso = `${iso}T00:00:00.000Z`;
            }
            var ms = new Date(iso).getTime() + tzms;
            var date = new Date(ms);
            return date;
        }

    } // class Dates

    module.exports = exports.Dates = Dates;
})(typeof exports === "object" ? exports : (exports = {}));
