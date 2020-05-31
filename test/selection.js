(typeof describe === 'function') && describe("selection", function() {
    const should = require("should");
    const {
        Selection,
    } = require("../index");

    var fruits = [{
        "name": "Apple1",
        "type": "apple",
    },{
        "name": "Apple2",
        "type": "apple",
    },{
        "name": "Orange1",
        "type": "orange",
    }];
    it("default ctor",()=>{
        var sel = new Selection();
        should(sel).properties({
            name: "Selection",
            type: "empty",
            items: [],
            maxItems: 1,
        });
    });
    it("custom ctor", ()=>{
        var maxItems = 10;
        var sel = new Selection({
            maxItems,
        });
        should(sel).properties({
            name: "Selection",
            type: "empty",
            items: [],
            maxItems,
        });
    });
    it("add(item) adds item", ()=>{
        var maxItems = 10;
        var sel = new Selection({
            maxItems,
        });

        // add return selection
        should(sel.items.length).equal(0);
        should(sel.add(fruits[0])).equal(sel);
        should(sel.items.length).equal(1);

        should(sel.type).equal('apple');
        should(sel.items[0]).equal(fruits[0]);
        sel.add(fruits[1]);
        should(sel.items.length).equal(2);
        should(sel.type).equal('apple');
        should(sel.items[0]).equal(fruits[0]);
        should(sel.items[1]).equal(fruits[1]);
        sel.add(fruits[2]);
        should(sel.items.length).equal(1);
        should(sel.type).equal('orange');
        should(sel.items[0]).equal(fruits[2]);
    });
    it("clear() removes all items", ()=>{
        var sel = new Selection();
        should(sel.items.length).equal(0);
        sel.add(fruits[0]);
        sel.add(fruits[1]);

        // non-empty selection
        should(sel.clear()).equal(sel);
        should(sel.items.length).equal(0);
        should(sel.type).equal('empty');

        // empty selection
        sel.clear();
        should(sel.items.length).equal(0);
        should(sel.type).equal('empty');
    });
    it("contains(item) returns boolean", ()=>{
        var maxItems = 5;
        var sel = new Selection({
            maxItems,
        });
        should(sel.items.length).equal(0);
        should(sel.contains(fruits[0])).equal(false);
        should(sel.contains(fruits[1])).equal(false);

        sel.add(fruits[0]);
        should(sel.contains(fruits[0])).equal(true);
        should(sel.contains(fruits[1])).equal(false);
        should(sel.items[0]).equal(fruits[0]);

        sel.add(fruits[1]);
        should(sel.contains(fruits[0])).equal(true);
        should(sel.contains(fruits[1])).equal(true);

        sel.clear();
        should(sel.contains(fruits[0])).equal(false);
        should(sel.contains(fruits[1])).equal(false);
    });
    it("click(...) handles single selection",()=>{
        var sel = new Selection();

        // single selection
        var event = {};
        sel.handleClick(fruits[0], event);
        should.deepEqual(sel.items,[fruits[0]]);
        should(sel.type).equal("apple");
        sel.handleClick(fruits[0], event);
        should.deepEqual(sel.items,[fruits[0]]);
        should(sel.type).equal("apple");
        sel.handleClick(fruits[1], event);
        should.deepEqual(sel.items,[fruits[1]]);
        should(sel.type).equal("apple");

        // shift selection
        sel.clear();
        event = {shiftKey: true};
        sel.handleClick(fruits[0], event);
        should.deepEqual(sel.items,[fruits[0]]);
        should(sel.type).equal("apple");
        sel.handleClick(fruits[0], event);
        should.deepEqual(sel.items,[fruits[0]]);
        should(sel.type).equal("apple");
        sel.handleClick(fruits[1], event);
        should.deepEqual(sel.items,[fruits[1]]);
        should(sel.type).equal("apple");

        // ctrl selection
        sel.clear();
        event = {ctrlKey: true};
        sel.handleClick(fruits[0], event);
        should.deepEqual(sel.items,[fruits[0]]);
        should(sel.type).equal("apple");
        sel.handleClick(fruits[0], event);
        should.deepEqual(sel.items,[fruits[0]]);
        should(sel.type).equal("apple");
        sel.handleClick(fruits[1], event);
        should.deepEqual(sel.items,[fruits[1]]);
        should(sel.type).equal("apple");

        // shift ctrl selection
        sel.clear();
        event = {shiftKey: true, ctrlKey: true};
        sel.handleClick(fruits[0], event);
        should.deepEqual(sel.items,[fruits[0]]);
        should(sel.type).equal("apple");
        sel.handleClick(fruits[0], event);
        should.deepEqual(sel.items,[fruits[0]]);
        should(sel.type).equal("apple");
        sel.handleClick(fruits[1], event);
        should.deepEqual(sel.items,[fruits[1]]);
        should(sel.type).equal("apple");

    });
});
