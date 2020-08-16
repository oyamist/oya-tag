#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const express = require('express');
const app = module.exports = express();

global.__appdir = path.dirname(__dirname);

// set up application
/*
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", [
        "X-Requested-With",
        "Content-Type",
        "Access-Control-Allow-Headers",
        "Authorization",
    ].join(","));
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS, PUT, POST");
    next();
});
*/
function now (req, res, next) {
    var now = new Date();
    console.log(`Now`, now);
    res.send(now);
    next()
}

var staticDir = path.join(__dirname, "../static");
var distDir = path.join(__dirname, "../dist");
if (!fs.existsSync(staticDir)) {
    throw new Error("content not found", staticDir);
}
if (!fs.existsSync(distDir)) {
    throw new Error("content not found", distDir);
}
app.use("/", express.static(path.join(__dirname, "../dist")));
app.use("/now", now);

var port = 80;
var httpServer = app.listen(port)
.on('error', e=>{
    console.error(`sadness`, e);
    throw error;
})


console.log(`listening on port`, port, httpServer.listening);

