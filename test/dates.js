(typeof describe === 'function') && describe("dates", function() {
    const winston = require('winston');
    const should = require("should");
    const {
        Dates,
    } = require("../index");

    it("TESTTESTtoMMDD(date) => locale mmdd", ()=>{
        var date = new Date(2020,0,2);
        should(Dates.toMMDD(date)).equal('1/2');
    });
    it("TESTTESTtoMMDDYY(date) => locale mmddyy", ()=>{
        var date = new Date(2020,0,2);
        should(Dates.toMMDDYY(date)).equal('1/2/20');
    });
    it("TESTTESTfromYMD(iso) => locale Date", ()=>{
        var now = new Date();
        var iso = now.toISOString().substring(0,10);
        var localeDate = Dates.fromYMD(iso);
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        var msTime = ((hours*60+minutes)*60+seconds)*1000;
        //console.log(`dbg now`, iso, now, localeDate, msTime);
        should(now-localeDate-msTime).above(-1).below(1000);
    });
})
