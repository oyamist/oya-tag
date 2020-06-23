(typeof describe === 'function') && describe("Asset", function() {
    const winston = require('winston');
    const should = require("should");
    const JSON5 = require('json5');
    const {
        Asset,
        Plant,
        AssetDefs,
        Tag,
    } = require("../index");

    it("TESTTESTAsset() asset default ctor", function() {
        // Default ctor
        var asset = new Asset();
        should(asset.type).equal("asset"); // Default type
        var guidPrefix = asset.guid.substr(0,6).toUpperCase();
        should(asset.id).equal(guidPrefix); // Default id 
        should(asset.name)
            .equal(`asset_${guidPrefix}`); // Default name

        // serializable keys
        should.deepEqual(Object.keys(asset).sort(), [ 
            "guid",
            "id",
            "name",
            "tags",
            "type",
        ].sort());

        // Asset name is generated if not provided
        should.deepEqual(asset.name, `asset_${guidPrefix}`); 

        should(asset.tagList.length).equal(1);
        should(asset.ageMillis).above(-1).below(5);
        should(asset.ageDays).equal(0);
    });
    it("Asset(opts) asset custom ctor", function() {
        var purchased = new Tag({
            name: "purchased", 
            applies: true,
        });
        var tags = {
            purchased,
        };

        var asset = new Asset({
            id: 'A0001',
            tags,
        });
        should.deepEqual(asset.name, `asset_A0001`); 
        asset.name = 'asdf';
        should.deepEqual(asset.name, `asdf`); 
        var tag = asset.getTag('purchased');
        should.deepEqual(tag, purchased);
        should(tag).not.equal(purchased);
        should.deepEqual(asset.tagList, [purchased]);
        should(asset.tags).not.equal(tags);

        var asset2 = new Asset();
        should(asset.guid).not.equal(asset2.guid);

        // ctor options can set asset properties
        asset = new Asset({
            name: 'TomatoA',
            id: 'A0001', // if provided, id overrides guid prefix
            tags,
        });
        should.deepEqual(asset.name, `TomatoA`);
        should.deepEqual(asset.id, `A0001`); // current id

        // copy constructor
        var assetCopy = new Asset(asset);
        should.deepEqual(assetCopy, asset);
    });
    it("TESTTESTage(...) returns age", function() {
        var MSDAY = 24*60*60*1000;
        var msAge = 2*MSDAY;
        var tags = { // age is determined by earliest tag
            testTag: {
                name: "testTag",
                date: -msAge, // relative date
            }
        }

        var asset = new Asset({
            id: 'A0001',
            tags,
        });
        should(asset.ageMillis).above(msAge-1).below(msAge+10);
        should(asset.ageDays).equal(2);
    });
    it("Asset is serializable", function() {
        var purchased = new Tag({
            name: "purchased", 
            applies: true,
        });
        var tags = {
            purchased,
        };

        var asset = new Asset({
            type: "plant",
            id: 'A0001',
            name: 'tomatoA',
            tags,
        });
        var json = JSON5.parse(JSON.stringify(asset));
        var asset2 = new Asset(json);
        should.deepEqual(asset2, asset);

        var json = JSON.stringify(asset);
        var asset2 = new Asset(JSON5.parse(json));
        should.deepEqual(asset2, asset);
        should(asset2.name).equal('tomatoA');
    });
    it("addTag(tag) adds a tag", ()=>{
        var asset = new Asset();
        var tags = [
            new Tag({ name: "tag0",}),
            new Tag({ name: "tag1",}),
            new Tag({ name: "tag2",}),
        ];

        // Tags are cloned
        var tag = asset.addTag(tags[0]);
        should.deepEqual(asset.getTag("tag0"), tags[0]);
        should.deepEqual(asset.getTag("tag1"), null);
        should.deepEqual(asset.getTag("tag2"), null);
        should.deepEqual(tag, tags[0]);
        should(tag).not.equal(tags[0]);
        var asset1 = new Asset(asset);

        asset.addTag(tags[1]);
        should.deepEqual(asset.getTag("tag0"), tags[0]);
        should.deepEqual(asset.getTag("tag1"), tags[1]);
        should.deepEqual(asset.getTag("tag2"), null);
    });
    it("deleteTag(name) adds a tag", ()=>{
        var tagList = [
            new Tag({ name: "tag0",}),
            new Tag({ name: "tag1",}),
            new Tag({ name: "tag2",}),
        ];
        var asset = new Asset({
            tags: {
                tag0: tagList[0],
                tag1: tagList[1],
            },
        });
        var asset2 = new Asset(asset); // post-deletion state
        asset.addTag(tagList[2]); // tag to delete
        should.deepEqual(asset.getTag("tag0"), tagList[0]);
        should.deepEqual(asset.getTag("tag1"), tagList[1]);
        should.deepEqual(asset.getTag("tag2"), tagList[2]);

        asset.deleteTag("tag2");
        should.deepEqual(asset.getTag("tag0"), tagList[0]);
        should.deepEqual(asset.getTag("tag1"), tagList[1]);
        should.deepEqual(asset.getTag("tag2"), null);
    });
    it("TESTTESTcustomKeys() returns non-core keys", ()=>{
        var color = "red";
        var size = "large";
        var asset = new Asset({
            color,
            size,
        });
        should.deepEqual(asset.customKeys(), [
            "color", "size",
        ]);
        should(asset).properties({
            color,
            size,
        });
    });
    it("TESTTESTfirstTag => earliest tag", ()=>{
        var tags = {
            "A001": {
                name: "A001",
                date: -1,
            },
            "A002": {
                name: "A002",
                date: -3,
                applies: false,
            },
            "A003": {
                name: "A003",
                date: -2,
            }
        }
        var asset = new Asset({tags});
        should(asset.firstTag.name).equal("A002");
    });
    it("TESTTESTlastTag => latest tag", ()=>{
        var tags = {
            "A001": {
                name: "A001",
                date: -1,
            },
            "A002": {
                name: "A002",
                date: -3,
                applies: false,
            },
            "A003": {
                name: "A003",
                date: -2,
            }
        }
        var asset = new Asset({tags});
        should(asset.lastTag.name).equal("A001");
    });
    it("TESTTESTstarted => earliest tag applies", ()=>{
        var tags = {
            "A001": {
                name: "A001",
                date: -1,
            },
            "A002": {
                name: "A002",
                date: -3,
                applies: false,
            },
            "A003": {
                name: "A003",
                date: -2,
            }
        }
        var asset = new Asset({tags});
        should(asset.firstTag.name).equal("A002");
        should(asset.started).equal(false);
        asset.getTag("A002").applies = true;
        should(asset.started).equal(true);
    });

})
