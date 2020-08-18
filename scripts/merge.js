#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  AssetStore,
} = require('../index');

var [ nodeExec, script, path1, path2 ] = process.argv;

if (!fs.existsSync(path1)) { 
    throw new Error(`not found path1:${path1}`) 
};
var json1 = JSON.parse(fs.readFileSync(path1));
if (!fs.existsSync(path2)) { 
    throw new Error(`not found path2:${path2}`) 
};
var json2 = JSON.parse(fs.readFileSync(path2));

var as = new AssetStore(json1);
as.importAssets(json2);

console.log(JSON.stringify(as, null, 2));

