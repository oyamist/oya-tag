(typeof describe === 'function') && describe("asset-store", ()=> {
    const fs = require('fs');
    const path = require('path');
    const JSON5 = require('json5');
    //const winston = require('winston');
    const should = require("should");
    const {
        Asset,
        AssetStore,
        Tag,
        TValue,
    } = require("../index");
    const SAMPLE_DATA = path.join(__dirname, 'sample-data.json5');

    it("TESTTESTdefault ctor", ()=> {
        var as = new AssetStore();
        should.deepEqual(as.settings, AssetStore.appliedSettings());
        should(as.assetFilter).equal(AssetStore.assetFilter);
    });
    it("TESTTESTcustom ctor", ()=> {
        var settings = {
            color: "brown",
        };
        var testKey = "test-value";
        var assetFilter = ()=>true;
        var as = new AssetStore({
            settings,
            assetFilter,
            assetMap: {
                testKey,
            },
        });
        should.deepEqual(as.settings, 
            AssetStore.appliedSettings(settings));
        should(as.assetOfId("testKey")).equal("test-value");
        should(as.assetFilter).equal(assetFilter);
    });
    it("appliedSettings() applies defaults ", ()=>{
        var settings = AssetStore.appliedSettings();
        should.deepEqual(settings, {
            idTemplates: {
                "A0000": 1,
            },
        });

        var settings = AssetStore.appliedSettings({
            color: "brown",
            idTemplates: {
                "B000": 1,
            },
        });
        should.deepEqual(settings, {
            color: "brown",
            idTemplates: {
                "B000": 1,
            },
        });
    });
    it("is serializable", ()=> {
        var guid = "f5689832-79e2-48a5-bf5f-655cacec940f";
        var id = "a0001";
        var type = "crop";
        var name = "purchased";
        var settings = {
            color: "brown",
        };
        var date = new Date().toISOString();
        var tags = {
            [name]: {
                name,
                date,
            }
        }
        var asset = { guid, id, type, tags };
        var json = {
            settings,
            assetMap: {
                "TEST-KEY": "TEST-VALUE",
                [guid]: asset,
            }
        };
        var as = new AssetStore(json);
        var jsonCopy = JSON5.parse(JSON.stringify(as));
        var as2 = new AssetStore(jsonCopy);
        should(as2.settings.color).equal("brown");
        
        should.deepEqual(as, as2);
    });
    it("assetOfId(key) => asset", ()=> {
        var testValue = "test-value";
        var guid = "f5689832-79e2-48a5-bf5f-655cacec940f";
        var id = guid.substr(0,6).toUpperCase();
        var asset = { guid, }; // Assets are objects with a guid
        var as = new AssetStore({
            assetMap: {
                "test-key": testValue,
                [guid] : asset,
            },
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
    it("createId() => new Asset id", ()=>{
        var as = new AssetStore();
        should(as.createId()).equal('A0001');
        should(as.createId()).equal('A0002');

        // next id is serialized
        var json = JSON5.parse(JSON.stringify(as));
        var as2 = new AssetStore(json);
        should(as2.createId()).equal('A0003');

        // createId won't give existing id
        var a4 = as.createAsset({id:"A0003"});
        should(as2.createId()).equal('A0004');

        should(as.createId("abc000def")).equal("ABC001DEF");
        should(as.createId("abc000def")).equal("ABC002DEF");
    });
    it("createAsset(...) => new Asset", ()=>{
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
    it("parses sample-data.json5", ()=>{
        var json = JSON5.parse(fs.readFileSync(SAMPLE_DATA));
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
    it("parses sample-data.json5 with factoryMap", ()=>{
        var json = JSON5.parse(fs.readFileSync(SAMPLE_DATA));
        var as = new AssetStore(json);

        // mapped asset 
        var asset = as.assetOfId('BRC-1');
        should(asset).properties({
            "guid": "42d77a7e-ee7a-4a6c-b376-771fd1ebf62a",
            "id": "BRC-1",
            "plant": "BROC",
            "type": "crop",
        });

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
        class Crop extends Asset{
            constructor(opts) {
                super(opts);
            }
            
        };
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
        };
        var crop = callNew(aclass, cropOpts);
        var cropExpected = new Crop(cropOpts);
        should(crop).instanceOf(Crop);
        should(crop.guid).equal(cropExpected.guid);
        should(crop.id).equal(cropExpected.id);
        should(crop.type).equal(cropExpected.type);
    });
    it("assetsOfType(...) => asset list", ()=>{
        var json = JSON5.parse(fs.readFileSync(SAMPLE_DATA));
        var as = new AssetStore(json);
        var assets = as.assetsOfType('bucket');
        should.deepEqual(assets.map(a=>a.id).sort(),[
            "A0001", "A0002", "A0003", "A0004", ]);
        var assets = as.assetsOfType('crop');
        should.deepEqual(assets.map(a=>a.id).sort(),[
            "BRC-1", "BRC-2", "BRC-3", "BRC-4", "TOM-1", ]);
    });
    it("assetsOfType(...) => asset list", ()=>{
        var json = JSON5.parse(fs.readFileSync(SAMPLE_DATA));
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
    it("timelines() => crop timelines", ()=>{
        var json = JSON5.parse(fs.readFileSync(SAMPLE_DATA));
        var store = new AssetStore(json);
        var crops = store.assetsOfType("crop");
        should(crops.length).equal(5);
        should(crops[0]).properties({
            guid: '42d77a7e-ee7a-4a6c-b376-771fd1ebf62a',
            id: 'BRC-1',
        });
        should(crops[0]).instanceOf(Asset);
    });
    it("timelines() => crop timelines", ()=>{
        var json = JSON5.parse(fs.readFileSync(SAMPLE_DATA));
        var store = new AssetStore(json);
        var timelines = store.timelines();
        should.deepEqual(timelines.map(t=>t.name), [
            "BROC", "PBTD"]);
        should.deepEqual(timelines[0].items.map(item=>item.id), [
            "BRC-1", "BRC-2", "BRC-3", "BRC-4" ]);
        timelines[0].items.forEach(item=>{
            should(item).instanceOf(Asset);
        });
    });
    it("removeAsset(id) removes asset", ()=>{
        var asEmpty = new AssetStore();
        var asFull = new AssetStore();
        asFull.createAsset({
            id: "test-asset",
        });
        asFull.removeAsset("test-asset");
        should.deepEqual(asFull, asEmpty);
    });
    it("updateAsset(asset) updates asset", ()=>{
        var as = new AssetStore();
        var asset1 = as.createAsset({ id: "test-asset"});

        // Copy asset to mutate
        var asset2 = new Asset(asset1);
        asset2.color = 'brown';
        asset2.id = 'test-asset-2';

        // Update asset-store
        var asset3 = as.updateAsset(asset2);
        should.deepEqual(asset3, asset2);
        should(asset3).not.equal(asset2);
        should(as.assetOfId('test-asset-2')).equal(asset3);
        should(as.assetOfId('test-asset')).equal(undefined);
    });
    it("TESTTESTassetFilter(...) => filters assets", ()=>{
        var assets = [
            new Asset({ id: "A0001", color: "red", }), 
            new Asset({ id: "A0002", color: "red", }), 
            new Asset({ id: "A0003", color: "blue", }),
            new Asset({ id: "A0011", color: "green", tags:[{
                name: "created",
                date: new Date(2020,1,1),
            },{
                name: "A0012",
                date: new Date(2020,2,1),
            }]}),
            new Asset({ id: "A0012", color: "purple", }),
        ];
        var assetMap = {};
        assets.forEach(a=>assetMap[a.guid] = a);

        var as = new AssetStore({
            assetMap,
        });

        // filter by asset properties
        should.deepEqual(as.filter("A0001").map(a=>a.id),
            [ "A0001", ]);
        should.deepEqual(as.filter("red").map(a=>a.id),
            [ "A0001", "A0002", ]);
        should.deepEqual(as.filter("blue").map(a=>a.id),
            [ "A0003", ]);

        // filter by tag name
        should.deepEqual(as.filter("A0012").map(a=>a.id),
            [ "A0011", "A0012"]);

        // filter by partial word
        should.deepEqual(as.filter("001").map(a=>a.id),
            [ ]);

        // filter by regexp
        should.deepEqual(as.filter(".*001").map(a=>a.id),
            [ "A0001",  "A0011", "A0012", ]);
        should.deepEqual(as.filter("blue|red").map(a=>a.id),
            [ "A0001",  "A0002", "A0003", ]);
    });
    

})
