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
    it("TESTTESTfromYMD(iso) => locale midnight", ()=>{
        var now = new Date();
        var year = `0${now.getFullYear()}`;
        year = year.substring(year.length-4);
        var month = `0${now.getMonth()+1}`;
        month = month.substring(month.length-2);
        var day = `0${now.getDate()}`;
        day = day.substring(day.length-2);
        var iso = `${year}-${month}-${day}`;
        var localeDate = Dates.fromYMD(iso);
        var tzminutes = (new Date()).getTimezoneOffset();
        var tzms = tzminutes * 60*1000;
        var mins = now.getHours()*60+now.getMinutes();
        var secs = mins*60+now.getSeconds()
        var time = secs*1000 ;
        should(now-localeDate).above(time).below(time+1000);
    });
})
