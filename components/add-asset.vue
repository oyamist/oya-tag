<template>
  <v-dialog v-model="showAddAsset" persistent 
     @keydown.esc="cancelAsset"
  >
    <v-system-bar color="green darken-2" dark>
      Add Asset
    </v-system-bar>
    <v-tabs v-if="model" v-model="model.activeTab" 
      grow show-arrows
      >
      <v-tab href="#crop" v-if="hasPlants"
        title="Add crop">
        <v-icon color="green darken-2">mdi-leaf</v-icon>
      </v-tab>
      <v-tab href="#plant"
        title="Add plant">
        <v-icon color="green darken-2">mdi-leaf</v-icon>
        <v-icon color="green darken-2">mdi-folder</v-icon>
      </v-tab>
      <v-tab href="#site"
        title="Add crop site or location">
        <v-icon color="green darken-2">mdi-cup-water</v-icon>
      </v-tab>
      <v-tab href="#site-type"
        title="Add site type">
        <v-icon color="green darken-2">mdi-cup-water</v-icon>
        <v-icon color="green darken-2">mdi-folder</v-icon>
      </v-tab>

      <v-tab-item value="crop">
        <v-card flat>
          <v-card-text>
            <h3 class="mb-5">
              Add new crop for plant.
            </h3>
            <asset-picker :asset="model.crop" propName="plant" 
              autofocus
              label="Plant"
              :rules="[requiredRule(`plant`)]"
            ></asset-picker>
            <date-field
              label="Crop start date"
              :item="model.crop.tags[0]"
              model="date"
            ></date-field>
            <h4 class="mb-5" >
              TIP: Label your crop with:
            </h4>
            <v-text-field v-model="model.crop.id" 
              :disabled="!model.crop.plant"
              label="Crop ID"
              :rules="idRules"
              @focus="cropIdFocus()"
              placeholder="Enter unique crop ID"
              hint="A unique ID for all time"
            ></v-text-field>
            <v-text-field v-model="model.crop.tags[0].name"
              :disabled="!model.crop.plant"
              label="Crop site ID"
              :rules="[requiredRule('CropSiteId')]"
              placeholder="Enter container or location ID"
              append-outer-icon="mdi-new-box"
              @click:append-outer=
                "createAsset(model.crop.tags[0], 'name')"
              :hint="idHint(model.crop.tags[0].name)"
            ></v-text-field>
            <v-text-field v-model="model.crop.name"
              :disabled="!model.plant || !model.crop.tags[0].name"
              label="Crop Name"
              :rules="nameRules"
              @focus="cropNameFocus()"
              placeholder="Enter short crop name"
              hint="E.g., plant ID and site ID"
            ></v-text-field>

            <h4 class="mb-5" >
              TIP: Note anything memorable
            </h4>
            <v-text-field v-model="model.crop.tags[0].note"
              :disabled="!model.plant || !model.crop.tags[0].name"
              label="Crop Notes"
              hint="E.g., number of seeds, temperature, etc."
            ></v-text-field>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item value="plant">
        <v-card flat>
          <v-card-text>
            <h3 class="mb-5">
              Add new plant type:
            </h3>
            <v-text-field v-model="model.plant.name"
              autofocus
              label="Name"
              :rules="nameRules"
              placeholder="Enter plant and variety"
              hint='E.g., "Tomato, Berkeley Tie Dye"'
            ></v-text-field>
            <v-text-field v-model="model.plant.id"
              label="ID"
              :rules="idRules"
              placeholder="Enter nickname or short identifier"
              hint="E.g., BTD for Berkeley Tie Dye"
            ></v-text-field>
            <v-text-field v-model="model.plant.tags[0].note"
              label="Source"
              placeholder="Enter product URL or description"
              hint="E.g., https://www.rareseeds.com/store/vegetables/tomatoes/wild-boar-farms/pink-berkeley-tie-dye-tomato"
            ></v-text-field>
            <date-field
              label="Batch date"
              :item="model.plant.tags[0]"
              model="date"
            ></date-field>
            <v-text-field v-model="model.plant.tags[0].name"
              label="Batch ID"
              @focus="batchIdFocus()"
              hint="Purchase reference"
            ></v-text-field>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item value="site">
        <v-card flat>
          <v-card-text>
            <h3 class="mb-5">
              Add new site for growing crop.
              <div class="caption">
                Identify each site with a label and/or barcode.
              </div>
            </h3>
            <asset-picker propName="site-type" :asset="model.site"
              label="Site Type"
              autofocus
              :rules="[requiredRule(`site-type`)]"
            ></asset-picker>
            <v-text-field v-model="model.site.id"
              label="Site ID"
              :rules="idRules"
              placeholder="Enter new site ID"
              hint="Enter barcode or asset ID"
            ></v-text-field>
            <v-text-field v-model="model.site.name"
              label="Site Name"
              :rules="nameRules"
              placeholder="Enter site name"
              hint="Enter site name"
              @focus="siteFocus('name')"
            ></v-text-field>
            <date-field
              label="Site start date"
              :item="model.site.tags[0]"
              model="date"
            ></date-field>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item value="site-type">
        <v-card flat>
          <v-card-text>
            <h3 class="mb-5">
              TIP: If you have many sites of the same type 
              (e.g., "NETPOT"),
              define that type here:
            </h3>
            <v-text-field v-model="model['site-type'].name"
              label="Site Type Name"
              :rules="nameRules"
              placeholder="Describe site type"
              hint="E.g., Net pot, 76mm"
              @focus="siteFocus('name')"
            ></v-text-field>
            <v-text-field v-model="model['site-type'].id"
              label="Site Type ID"
              :rules="idRules"
              placeholder="Enter short ID for site type"
              hint="E.g.,. NETPOT"
            ></v-text-field>
            <h3 class="mb-5">
              TIP: Track your acquisitions/purchases of this site type:
            </h3>
            <v-text-field v-model="model['site-type'].tags[0].note"
              label="Source"
              placeholder="Enter product URL or description"
              hint="E.g., https://www.rareseeds.com/store/vegetables/tomatoes/wild-boar-farms/pink-berkeley-tie-dye-tomato"
            ></v-text-field>
            <v-text-field v-model="model['site-type'].tags[0].name"
              label="Acquisition"
              placeholder="Enter asset barcode id or purchase reference"
              hint="E.g., A0123"
            ></v-text-field>
            <date-field
              label="Acquisition date"
              :item="model['site-type'].tags[0]"
              model="date"
            ></date-field>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs>
    <v-card >
      <v-card-actions v-if="model">
        <v-btn text @click="cancelAsset">Cancel</v-btn>
        <v-spacer></v-spacer>
        &nbsp;
        <v-spacer></v-spacer>
        <v-btn color="green darken-2 white--text" raised
          @click="commitAsset"
          :disabled="!isValid"
          >Add {{model.activeTab}}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from "vue";
import DateField from "./date-field";
import AssetPicker from "./asset-picker";
const AssetStore = require("../src/asset-store");
const uuidv4 = require("uuid/v4");
const Dates = require("../src/dates");

export default {
  name: 'AddAsset',

  props: {
  },
  data: () => {
    return {
      showAddAsset: false,
      valid: {},
      model: null,
      defaultModel: {
        activeTab: 'plant',
        plant: {
          type: 'plant',
          name: '',
          id: '',
          tags: [{
            name: '',
            note: '',
            date: new Date(),
            applies: true,
          }]
        },
        crop: {
          type: 'crop',
          plant: '',
          name: '',
          id: '',
          tags: [{
            name: '',
            note: '',
            date: new Date(),
            applies: true,
          }]
        },
        site: {
          type: 'site',
          "site-type": '',
          name: '',
          id: '',
          tags: [{
            name: 'started',
            note: '',
            date: new Date(),
            applies: true,
          }]
        },
        "site-type": {
          type: 'site-type',
          id: '',
          name: '',
          tags: [{
            name: 'purchased',
            note: '',
            date: new Date(),
            applies: true,
          }]
        },
      },
    }
  },
  methods: {
    createAsset(obj, prop) {
      this.$store.commit("assets/createId", id=>(obj[prop]=id));
    },
    siteFocus(field) {
        var site = this.model.site;
        if (field === 'name') {
            if (!site.name) {
                Vue.set(site, "name", AssetStore.createName(site));
            }
        }
    },
    commitAsset() {
      var model = this.model;
      var activeTab = model.activeTab;
      console.log(`dbg asset`,{model, activeTab});
      var $router = this.$router;
      var search = activeTab;
      if (search === 'crop') {
        search = model.crop.plant;
      }
      var $nextTick = this.$nextTick;
      var opts = Object.assign({}, model[activeTab], {
        committed: asset => {
          console.log(`Created new asset, search:`, search);
          $router.push(`/assets?search=${search}`, $nextTick(()=>{

            console.log(`Created new asset`, asset);
            $router.push(`/assets#${asset.id}`);
          }));
        },
      });
      this.$store.commit('assets/add', opts);
      this.$store.commit("showAddAsset", false);
    },
    cancelAsset() {
      this.$store.commit("showAddAsset", false);
    },
    clearModel() {
      var model = JSON.parse(JSON.stringify(this.defaultModel));
      Vue.set(this, "model", model);
      console.log(`AddAsset.clearModel =>`, model);
    },
    validate(key, value) {
      Vue.set(this.valid, key, value);
      return value;
    },
    idHint(id, idNone="") {
      if (id) {
        var asset = this.assetStore.assetOfId(id);
        return asset ? `${asset.name}` : `New asset ${id}`
      } else {
        return idNone;
      }
    },
    requiredRule(field) {
      var that = this;
      var msg = `*${field} is required`;
      return (v=>that.validate(field, v&&v.length>0 || msg));
    },
    cropNameFocus() {
      var {
        crop,
      } = this.model;
      var tag0 = crop.tags[0];
      if (tag0.name && crop.plant && !crop.name) {
        var name = `${crop.plant}${tag0.name.replace(/[^0-9]/ug,'')}`;
        Vue.set(crop, "name", name);
      }
    },
    cropIdFocus() {
      var {
        crop,
      } = this.model;
      if (crop.plant && !crop.id) {
        crop.guid = uuidv4();
        var id = `${crop.plant}-${crop.guid.substring(0,6)}`;
        Vue.set(crop, "id", id);
      }
    },
    batchIdFocus() {
      var {
        plant,
      } = this.model;
      var tag0 = plant.tags[0];

      if (!tag0.name) {
        var id = plant.id;
        var mm = Dates.toMM(tag0.date);
        var dd = Dates.toDD(tag0.date);
        Vue.set(tag0, "name", `${id}${mm}${dd}`);
      }
    },
  },
  computed: {
    hasPlants() {
      return this.assets.reduce((a,asset)=>{
        return a || asset.type === 'plant'
      }, false);
    },
    assets() {
      return this.$store.state.assets.list;
    },
    assetStore() {
      var storeState = this.$store.state;
      return storeState.assets.assetStore;
    },
    createName(asset) {
      return asset
        ? asset.name || AssetStore.createName(asset)
        : `n/a`;
    },
    nameRules() {
      return [this.requiredRule(`name`)];
    },
    idRules() {
      return [
        (v=>{
          var asset = this.assetStore.assetOfId(v);
          return this.validate(`id`, v
            ? asset==null || `${v} conflicts with ${asset.name}`
            : v&&v.length>0 || `*id is required`
          );
        }),
      ];
    },
    isValid() {
      var {
        valid,
        model,
      } = this;
      var activeTab = model.activeTab;
      var validName = valid.name === true;
      var validPlant = valid.plant === true;
      var validId = valid.id === true;
      var validSiteType = valid[`site-type`] === true;
      var validCropSiteId = valid[`CropSiteId`] === true;
      if (activeTab === 'plant') {
        return validName && validId;
      } else if (activeTab === 'crop') {
        return validName && validId && validPlant && validCropSiteId;
      } else if (activeTab === 'site') {
        return validName && validId && validSiteType;
      }
      return true;
    },
  },
  created() {
    this.$store.subscribe((mutation, /*state*/)=>{
      if (mutation.type === "showAddAsset") {
        var showAddAsset = mutation.payload;
        if (this.hasPlants) {
          this.defaultModel.activeTab = 'crop';
        }
        showAddAsset && this.clearModel();
        Vue.set(this, "showAddAsset", showAddAsset);
        console.log("subscribe:", mutation.type, showAddAsset);
      }
    });
  },
  mounted() {
  },
  components: {
    AssetPicker,
    DateField,
  },
}
</script>
<style>
</style>
