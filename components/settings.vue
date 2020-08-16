<template>
  <v-dialog v-model="showSettings" max-width="40em">
    <v-card >
      <v-system-bar color="green darken-4" dark>
        Edit Settings
      </v-system-bar>
      <v-card-text class="mt-4">
        <v-text-field v-model="settings.farm" 
          id="farm-name"
          outlined
          clearable
          label="Farm Name"
          />

        <v-radio-group v-model="settings.archive" row>
          <v-radio value="localStorage" label="Store farm locally"/>
          <v-radio value="Github" label="Store farm in Github cloud"/>
        </v-radio-group>
        <div v-if="settings.archive==='localStorage'">
          Your farm information is private and stored only on this computer.
          WARNING: Clearing your browser cache will delete your farm.
          Be sure to save your data after making any changes!
        </div>
        <div v-if="settings.archive==='Github'">
          Your farm information will be publicly stored on Github.
          Thank you for sharing your farm with others.
          
          <v-text-field id="githubAccount"
            v-model="settings.githubAccount"
            label="Github account name"
            hint="Enter new or existing Github account name"
          ></v-text-field>
          <v-text-field id="githubRepo"
            v-model="settings.githubRepo"
            label="Github repository"
          ></v-text-field>
          <v-btn raised dark color="green darken-2"
            :href="loginUrl"
          >Login to Github</v-btn>
        </div>

        <div class="debug">
          settings:{{settings}}
          hasChanged:{{hasChanged}}
          loginUrl: {{loginUrl}}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="cancelSettings()"
          >Cancel</v-btn>
        <v-spacer/>
        <v-btn color="green darken-2 white--text" raised
          @click="saveSettings"
          >Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from "vue";
const { MerkleJson } = require("merkle-json");
const DEFAULT_SETTINGS = {
  saved: undefined,
  farm: "My Farm",
  archive: "localStorage",
  githubAccount: "",
  githubRepo: "oya-tag",
}

const CLIENT_ID_LOCAL = "e09323f45953b1bad4d5";
const CLIENT_ID_NETLIFY = "Iv1.4f3c43ace0d95b21";
const REDIRECT_LOCAL = "http://localhost:3000/login";
const REDIRECT_NETLIFY = "https://gifted-visvesvaraya-bb90f2.netlify.app/";

export default {
  name: 'Settings',
  props: {
    githubMode: {
      type: String,
      default: "test",
    },
  },
  components: {
  },
  data () {
    return {
      settings: {},
      mj: new MerkleJson(),
    }
  },
  computed: {
    loginUrl() {
      var login = this.settings.githubAccount;
      var parms = this.githubMode === "test" 
        ? {
          client_id: CLIENT_ID_LOCAL,
          redirect_uri: REDIRECT_LOCAL,
          state: Math.random(),
          login,
        } : {
          client_id: CLIENT_ID_NETLIFY,
          redirect_uri: REDIRECT_NETLIFY,
          state: Math.random(),
          login,
        };
      var query = Object.keys(parms)
        .map(p=>`${p}=${encodeURIComponent(parms[p])}`)
        .join("&");
      return `https://github.com/login/oauth/authorize?${query}`;
    },
    assetStore() {
      var storeState = this.$store && this.$store.state;
      return storeState && storeState.assets.assetStore;
    },
    showSettings: {
      get: function() {
        return this.$store.state.showSettings;
      },
      set: function(value) {
        console.log(`dbg showSettings should never be called`, value);
      },
    },
    hasChanged() {
      var { mj, assetStore } = this;
      return mj.hash(this.settings) !== mj.hash(assetStore.settings);
    },
  },
  mounted () {
    var { assetStore, } = this;
    if (!assetStore) {
      throw new Error("Settings requires assetStore");
    }
    var settings = Object.assign({}, 
      DEFAULT_SETTINGS, assetStore.settings);
    Vue.set(this, "settings", settings);
    console.log(`settings.mounted`, settings.farm);
  },
  methods: {
    cancelSettings() {
        this.$store.commit("showSettings", false);
    },
    saveSettings() {
        this.$store.commit("assets/saveSettings", this.settings);
        this.$store.commit("showSettings", false);
    },
  }

}
</script>
<style scoped>
.debug {
  border: 1pt solid red;
  border-radius: 5px;
}
</style>
