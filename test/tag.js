(typeof describe === 'function') && describe("tag", function() {
    const winston = require('winston');
    const should = require("should");
    const {
        Tag,
    } = require("../index");

    it("default ctor", ()=>{
        var st = new Tag();
        var now = new Date();
        should(st.date-now).above(-1).below(1);
        should(st.applies).equal(false);
        should(st.name).equal("");
        should(st.note).equal(undefined);
    });
    it("custom ctor", ()=>{
        var date = new Date(2020, 3, 1);
        var name = "testname";
        var note = "testnote";
        var applies = true;

        // Date
        var opts = { date, name, applies, note};
        var st = new Tag(opts);
        should(st).properties(opts);

        // Date string
        var st = new Tag({
            date: date.toString(),
            name,
            applies,
            note,
        });
        should(st).properties(opts);

        // Number
        var now = Date.now();
        var offset = 1234;
        var offsetDate = new Date(now+offset);
        var st = new Tag({
            date: offsetDate,
            name,
            applies
        });
        should(st.date-now).above(offset-1).below(offset+1);
        should(st.name).equal(name);
        should(st.applies).equal(true);
    });
    it("is serializable", ()=>{
        var name = "testname";
        var applies = true;
        var note = "testnote";
        var st = new Tag({name, applies, note});
        var st2 = new Tag(JSON.parse(JSON.stringify(st)));
        should.deepEqual(st, st2);
    });
})
