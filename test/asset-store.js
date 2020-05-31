(typeof describe === 'function') && describe("asset-store", ()=> {
    const fs = require('fs');
    const path = require('path');
    //const winston = require('winston');
    const should = require("should");
    const {
        Asset,
        Crop,
        AssetStore,
        Tag,
        TValue,
    } = require("../index");
    const SAMPLE_DATA = path.join(__dirname, 
        '..', 'static', 'sample-data.json');

    it("default ctor", ()=> {
        var as = new AssetStore();
    });
    it("custom ctor", ()=> {
        var as = new AssetStore({
            "test-key": "test-value",
        });
    });
    it("is serializable", ()=> {
        var guid = "f5689832-79e2-48a5-bf5f-655cacec940f";
        var id = "a0001";
        var type = "crop";
        var name = "purchased";
        var date = new Date().toISOString();
        var tags = {
            [name]: {
                name,
                date,
            }
        }
        var asset = { guid, id, type, tags };
        var json = {
            "TEST-KEY": "TEST-VALUE",
            [guid]: asset,
        };
        var as = new AssetStore(json);
        var jsonCopy = JSON.parse(JSON.stringify(as));
        var as2 = new AssetStore(jsonCopy);
        
        should.deepEqual(as, as2);
    });
    it("assetOfId(key) => asset", ()=> {
        var testValue = "test-value";
        var guid = "f5689832-79e2-48a5-bf5f-655cacec940f";
        var id = guid.substr(0,6).toUpperCase();
        var asset = { guid, }; // Assets are objects with a guid
        var as = new AssetStore({
            "test-key": testValue,
            [guid] : asset,
        });

        // non-Assets are just themselves
        should(as.assetOfId("test-key")).equal(testValue);

        // Assets are keyed by guid
        var asset2 = as.assetOfId(guid);
        should(asset2).instanceOf(Asset);
        should(asset2.guid).equal(guid);
        should(asset2.id).equal(id);

        // Assets are keyed by id
        should(as.assetOfId(id)).equal(asset2);
    });
    it("TESTTESTcreateId() => new Asset id", ()=>{
        var as = new AssetStore();
        should(as.createId()).equal('A0001');
        should(as.createId()).equal('A0002');

        // next id is serialized
        var as2 = new AssetStore(JSON.parse(JSON.stringify(as)));
        should(as2.createId()).equal('A0003');

        // createId won't give existing id
        var a4 = as.createAsset({id:"A0003"});
        should(as2.createId()).equal('A0004');

        should(as.createId("abc000def")).equal("ABC001DEF");
        should(as.createId("abc000def")).equal("ABC002DEF");
    });
    it("TESTTESTcreateAsset(...) => new Asset", ()=>{
        var as = new AssetStore();
        var asset = as.createAsset();
        should(asset).instanceOf(Asset);
        should(asset.id).equal("A0001");
        should(asset.guid.length).equal(36);
        should(as.assets().indexOf(asset)).equal(0);

        var asset2 = as.createAsset();
        should(asset2).instanceOf(Asset);
        should(asset2.id).equal("A0002");
        should(asset2.guid.length).equal(36);
        should(as.assets().indexOf(asset2)).equal(1);
    });
    it("parses sample-data.json", ()=>{
        var json = JSON.parse(fs.readFileSync(SAMPLE_DATA));
        var as = new AssetStore(json);
        var asset = as.assetOfId('A0001');
        should(asset).properties({
            guid: "dc4fea06-d104-44b8-af75-2fc514746c0e",
            id: "A0001",
            type: "bucket",
        });
        var purchased = asset.getTag('purchased');
        should(purchased).instanceOf(Tag);
        should(purchased).properties({
            name: 'purchased',
            applies: true,
            note: "https://www.uline.com/Product/Detail/S-9941BL",
        });
    });
    it("parses sample-data.json with factoryMap", ()=>{
        var factoryMap = {
            crop: Crop,
        };
        var json = JSON.parse(fs.readFileSync(SAMPLE_DATA));
        var as = new AssetStore(json, factoryMap);

        // mapped asset 
        var asset = as.assetOfId('BRC-1');
        should(asset).properties({
            "guid": "42d77a7e-ee7a-4a6c-b376-771fd1ebf62a",
            "id": "BRC-1",
            "crop": "Broccoli",
            "type": "crop",
        });
        should(asset).instanceOf(Crop);

        // unmapped asset
        var asset = as.assetOfId('A0001');
        should(asset).properties({
            "guid": "dc4fea06-d104-44b8-af75-2fc514746c0e",
            "id": "A0001",
            "type": "bucket",
        });
        should(asset).instanceOf(Asset);
    });
    it("callNew", ()=>{
        var aclass = Crop;
        var guid = "152b7fe8-2849-4128-9de2-5cb5770d85ff";
        var id = "A0001";
        var startDate = new Date();
        function callNew(ctor, ...args) {
            var factoryFunction = ctor.bind.apply(ctor, [null, ...args]);
            return new factoryFunction();
        }
        var cropOpts = {
            guid,
            id,
            startDate,
        };
        var crop = callNew(aclass, cropOpts);
        var cropExpected = new Crop(cropOpts);
        should(crop).instanceOf(Crop);
        should(crop.guid).equal(cropExpected.guid);
        should(crop.id).equal(cropExpected.id);
        should(crop.type).equal(cropExpected.type);
    });
    it("assetsOfType(...) => asset list", ()=>{
        var json = JSON.parse(fs.readFileSync(SAMPLE_DATA));
        var as = new AssetStore(json);
        var assets = as.assetsOfType('bucket');
        should.deepEqual(assets.map(a=>a.id).sort(),[
            "A0001", "A0002", "A0003", "A0004", ]);
        var assets = as.assetsOfType('crop');
        should.deepEqual(assets.map(a=>a.id).sort(),[
            "BRC-1", "BRC-2", "BRC-3", "BRC-4", "TOM-1", ]);
    });
    it("assetsOfType(...) => asset list", ()=>{
        var json = JSON.parse(fs.readFileSync(SAMPLE_DATA));
        var as = new AssetStore(json);
        var assets = as.assets();
        should(assets.length).equal(16);
        should(assets[0]).properties({
            id: 'A0001',
            type: 'bucket',
        });
        var tag = assets[0].getTag('purchased');
        var dateDiff = -1209600000;
        should(tag.date - Date.now())
            .above(dateDiff-2)
            .below(dateDiff+2);
        should(tag).properties({
            name: "purchased",
            applies: true,
        });
    });
})
