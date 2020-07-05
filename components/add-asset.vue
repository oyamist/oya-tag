<template>
  <v-dialog v-model="showAddAsset" persistent 
     @keydown.esc="cancelAsset"
  >
    <v-card >
      <v-card-text v-if="model">
        <v-tabs v-model="model.activeTab">
          <v-tab href="#plant">
            Plant
          </v-tab>
          <v-tab href="#crop">
            Crop
          </v-tab>
          <v-tab href="#site">
            Site
          </v-tab>
         <v-tab href="#site-type">
            SiteType
          </v-tab>

          <v-tab-item value="plant">
            <v-card flat>
              <v-card-text>
                <h3 class="mb-5">
                  Define a plant for classifying your crops:
                </h3>
                <v-text-field v-model="model.plant.name"
                  autofocus
                  outlined
                  label="Name"
                  :rules="nameRules"
                  placeholder="Enter plant and variety"
                  hint='E.g., "Tomato, Berkeley Tie Dye"'
                ></v-text-field>
                <v-text-field v-model="model.plant.id"
                  outlined
                  label="ID"
                  :rules="idRules"
                  placeholder="Enter nickname or short identifier"
                  hint="E.g., BTD for Berkeley Tie Dye"
                ></v-text-field>
                <v-text-field v-model="model.plant.tags[0].note"
                  outlined
                  label="Source"
                  placeholder="Enter product URL or description"
                  hint="E.g., https://www.rareseeds.com/store/vegetables/tomatoes/wild-boar-farms/pink-berkeley-tie-dye-tomato"
                ></v-text-field>
                <v-text-field v-model="model.plant.tags[0].name"
                  outlined
                  label="Batch ID"
                  placeholder="Enter asset barcode id or purchase reference"
                  hint="E.g., A0123"
                ></v-text-field>
                <date-field
                  label="Batch date"
                  :item="model.plant.tags[0]"
                  model="date"
                ></date-field>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item value="crop">
            <v-card flat>
              <v-card-text>
                <h3 class="mb-5">
                  Plant a new crop:
                </h3>
                {{model.crop}}
                <asset-picker propName="plant" :asset="model.crop"
                  label="Plant"
                  :rules="[requiredRule(`plant`)]"
                ></asset-picker>
                <date-field
                  label="Crop start date"
                  :item="model.site.tags[0]"
                  model="date"
                ></date-field>
                <v-text-field v-model="model.crop.tags[0].name"
                  outlined
                  label="Crop site ID"
                  placeholder="Enter container or location ID"
                  :hint="idHint(model.site.id)"
                ></v-text-field>
                <v-text-field v-model="model.crop.id"
                  outlined
                  label="Crop ID"
                  :rules="idRules"
                  @focus="cropId()"
                  placeholder="Enter unique crop ID"
                  hint="E.g., CIL20200423 for Cilantro planted on ${new Date(2020,3,23).toLocaleDateString()}"
                ></v-text-field>
                <v-text-field v-model="model.crop.name"
                  outlined
                  label="Name"
                  :rules="nameRules"
                  placeholder="Enter short crop name"
                  hint='E.g., "Tomato, Berkeley Tie Dye"'
                ></v-text-field>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item value="site">
            <v-card flat>
              <v-card-text>
                <h3 class="mb-5">
                  Define a new site. 
                  A site is a crop container or location:
                </h3>
                <asset-picker propName="site-type" :asset="model.site"
                  label="Site Type"
                  :rules="[requiredRule(`site-type`)]"
                ></asset-picker>
                <v-text-field v-model="model.site.id"
                  outlined
                  label="Site ID"
                  :rules="idRules"
                  placeholder="Enter new site ID"
                  hint="Enter barcode or asset ID"
                ></v-text-field>
                <v-text-field v-model="model.site.name"
                  outlined
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
                <v-text-field v-model="model['site-type'].type"
                  readonly outlined
                  label="Type"
                ></v-text-field>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-card-text>
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
        },
      },
    }
  },
  methods: {
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
      var opts = Object.assign({}, model[activeTab], {
        committed: asset => {
          $router.push(`/assets?search=${activeTab}`, ()=>{
            $router.push(`/assets#${asset.id}`);
          });
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
    idHint(id) {
      var asset = this.assetStore.assetOfId(id);
      return asset ? `${asset.name}` : `New asset ${id}`
    },
    requiredRule(field) {
      var that = this;
      var msg = `*${field} is required`;
      return (v=>that.validate(field, v&&v.length>0 || msg));
    },
    cropId() {
      var {
        crop,
      } = this.model;
      if (!crop.id) {
        var date = new Date(crop.tags[0].date);
        var year = date.getFullYear();
        var mm = date.toLocaleDateString(undefined, {
          month: "2-digit",
        });
        var dd = date.toLocaleDateString(undefined, {
          day: "2-digit",
        });
        var id = `${crop.plant}${year}${mm}${dd}`;
        Vue.set(crop, "id", id);
        console.log(`dbg crop id`, {id, year, mm,dd});
      }
    },
  },
  computed: {
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
      var validId = valid.id === true;
      var validSiteType = valid[`site-type`] === true;
      if (activeTab === 'plant') {
        return validName && validId;
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
