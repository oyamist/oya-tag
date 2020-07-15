(function(exports) {

    class Dates {
        static toMM(date=new Date()) {
            return date.toLocaleDateString(undefined, {
                month: "2-digit",
            });
        }

        static toDD(date=new Date()) {
            return date.toLocaleDateString(undefined, {
                day: "2-digit",
            });
        }

        static toMD(date=new Date()) {
            if (typeof date === 'string') {
                date = new Date(date);
            }
            return date.toLocaleDateString(undefined, {
                month: "numeric",
                day: "numeric",
            });
        }
        static toMMDD(date=new Date()) {
            if (typeof date === 'string') {
                date = new Date(date);
            }
            var mm = date.toLocaleDateString(undefined, {
                month: "2-digit",
            });
            var dd = date.toLocaleDateString(undefined, {
                day: "2-digit",
            });
            return `${mm}${dd}`;
        }

        static toMMDDYY(date=new Date()) {
            return date.toLocaleDateString(undefined, {
                year: "2-digit",
                month: "numeric",
                day: "numeric",
            });
        }

        static fromYMD(iso) {
            var dst = 60; /* Daylight savings fudge */
            var tzminutes = (new Date()).getTimezoneOffset() + dst;
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

