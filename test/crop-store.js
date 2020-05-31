(typeof describe === 'function') && describe("view-timeline", ()=> {
    const fs = require('fs');
    const path = require('path');
    //const winston = require('winston');
    const should = require("should");
    const {
        Asset,
        Crop,
        AssetStore,
        CropStore,
        TValue,
    } = require("../index");
    const SAMPLE_PATH = path.join(__dirname, '../static/sample-data.json');

    it("default ctor", ()=> {
        var store = new CropStore();
        should(store).instanceOf(CropStore);
        should(store).instanceOf(AssetStore);
    });
    it("parses sample-data.json", ()=>{
        var json = JSON.parse(fs.readFileSync(SAMPLE_PATH));
        var store = new CropStore(json);
        var asset = store.assetOfId('BRC-1');
        should(asset).properties({
            "guid": "42d77a7e-ee7a-4a6c-b376-771fd1ebf62a",
            "id": "BRC-1",
            "crop": "Broccoli",
            "type": "crop",
        });
        should(asset).instanceOf(Crop);
    });
    it("timelines() => crop timelines", ()=>{
        var json = JSON.parse(fs.readFileSync(SAMPLE_PATH));
        var store = new CropStore(json);
        var crops = store.crops();
        should(crops.length).equal(5);
        should(crops[0]).properties({
            guid: '42d77a7e-ee7a-4a6c-b376-771fd1ebf62a',
            id: 'BRC-1',
        });
        should(crops[0]).instanceOf(Crop);
    });
    it("timelines() => crop timelines", ()=>{
        var json = JSON.parse(fs.readFileSync(SAMPLE_PATH));
        var store = new CropStore(json);
        var timelines = store.timelines();
        should.deepEqual(timelines.map(t=>t.name), [
            "Broccoli", "Tomato"]);
        should.deepEqual(timelines[0].items.map(item=>item.id), [
            "BRC-1", "BRC-2", "BRC-3", "BRC-4" ]);
        timelines[0].items.forEach(item=>{
            should(item).instanceOf(Crop);
        });
    });
})
