(typeof describe === 'function') && describe("crop", function() {
    const should = require("should");
    const {
        Crop,
    } = require("../index");

    it("TESTTESTdefault ctor",()=>{
        var crop = new Crop();
        should(crop).properties({
            type: "crop",
            plant: "",
        });
    });
    it("TESTTESTcustom ctor", ()=>{
        var guid = "152b7fe8-2849-4128-9de2-5cb5770d85ff";
        var id = "A0001";
        var plant = "tomato";
        var variety = "Berkeley Tie Dye";
        var crop = new Crop({
            guid,
            id,
            plant,
            variety,
        });
        should(crop).instanceOf(Crop);
        should(crop).properties({
            guid,
            id,
            plant,
            variety,
        });
    })


});
