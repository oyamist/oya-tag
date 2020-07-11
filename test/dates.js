(typeof describe === 'function') && describe("dates", function() {
    const winston = require('winston');
    const should = require("should");
    const {
        Dates,
    } = require("../index");

    it("toMMDD(date) => locale mmdd", ()=>{
        var date = new Date(2020,0,2);
        should(Dates.toMMDD(date)).equal('1/2');
    });
    it("toMMDDYY(date) => locale mmddyy", ()=>{
        var date = new Date(2020,0,2);
        should(Dates.toMMDDYY(date)).equal('1/2/20');
    });
    it("fromYMD(iso) => locale 1AM", ()=>{
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
        var dstSecs = 60*60; // Daylight savings time fudge
        var mins = now.getHours()*60+now.getMinutes();
        var secs = mins*60+now.getSeconds();
        should((now-localeDate)/1000).above(secs-dstSecs);
        should((now-localeDate)/1000).below(secs+dstSecs);
    });
})
