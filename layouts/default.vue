<template>
  <v-app>
    <script src="/lib/aws-sdk-2.715.0.min.js"></script>
    <v-app-bar dark fixed app>
      <div class="d-flex align-center">
        <v-img
          src="/leaf.png"
          alt="Oya-Tag logo"
          class="shrink mr-2"
          contain
          transition="scale-transition"
          width="40"
        />
        Oya-Tag
      </div>

      <s3></s3>
      <v-spacer />
      <div class="month">
        {{ new Date().toLocaleString(undefined, {month:"short"}) }}
      </div>
      <div class="calendar" :title="new Date().toLocaleDateString()">
        {{ new Date().getDate() }}
      </div>
      <v-spacer />
      <v-btn icon :color="pagesColor('/assets')"
        @click="$router.push('/assets')"
        title="Asset view"
      ><v-icon>mdi-view-list</v-icon></v-btn>
      <v-btn icon :color="pagesColor('/timelines')"
        @click="$router.push('/timelines')"
        title="Timeline view"
      ><v-icon>mdi-panorama</v-icon></v-btn>

      <v-menu bottom right nudge-bottom="40">
        <template v-slot:activator="{ on }">
          <v-btn dark icon v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item v-for="(menuItem, i) in viewMenu" :key="`view${i}`"
            :disabled="menuItemDisabled(menuItem)"
            @click="onMenu(menuItem)" >
            <v-list-item-title>{{ menuItem.title }}</v-list-item-title>
          </v-list-item>
          <v-divider/>
          <v-list-item v-for="(menuItem, i) in fileMenu" :key="`file${i}`"
            :disabled="menuItemDisabled(menuItem)"
            @click="onMenu(menuItem)" >
            <v-list-item-title>{{ menuItem.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-content>
      <v-container>
        <nuxt />
        <EditAsset v-if="curAsset" />
        <v-dialog v-model="askUpload" max-width="40em">
          <v-card >
            <v-card-title>
              Load Asset File 
            </v-card-title>
            <v-card-text>
              <p> Oya-Tag assets are stored in browser local storage.
              Save your assets regularly for backup or for transferring
              them to a new system.</p>
              <v-alert type="warning" 
                color="yellow darken-4">
                Uploaded assets will replace
                all assets in your browser local storage.</v-alert>
              <v-checkbox v-model="overwriteAssets"
                :label=
                "`Upload and replace ${assetCount} current assets?`"
              ></v-checkbox>
              <v-file-input 
                append-icon="mdi-upload"
                prepend-icon=""
                :disabled="!overwriteAssets"
                placeholder="Click HERE to choose JSON upload file"
                loading
                show-size
                accept=".json,.json5,application/json"
                outlined
                @change="uploadChanged()"
                v-model="uploadFile"
                >
              </v-file-input>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-container>
      <v-footer class="caption font-weight-light"
        absolute 
        padless
      >
        <v-spacer/>
        <a href="https://github.com/oyamist/oya-tag" target="_blank">
          Github version {{version}}
        </a>
        <v-spacer/>
      </v-footer>
      <settings v-if="!!assetStore"/>
    </v-content>
  </v-app>
</template>

<script>
const JSON5 = require( 'json5' );
import FileSaver from 'file-saver';
import EditAsset from '../components/edit-asset';
import S3 from '../components/s3';
import AssetStore from '../src/asset-store';
import Package from '../package';
import Settings from '../components/settings';

export default {
  name: 'App',
  components: {
    EditAsset,
    S3,
    Settings,
  },
  data () {
    return {
      overwriteAssets: false,
      askUpload: false,
      uploadFile: null,
      viewMenu: [{
        title: 'Help',
        route: '/'
      },{
        title: "Edit Settings",
        action: this.editSettings,
      }],
      fileMenu: [{
        title: 'Load Sample Data',
        action: this.loadSample,
      },{
        title: 'Load Assets',
        action: this.loadAssets,
      },{
        title: 'Save Assets',
        action: this.saveAssets,
      },{
        title: 'Clear Assets',
        action: this.clearAssets,
      }],
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js'
    }
  },
  computed: {
    version() {
      return Package.version;
    },
    curAsset() {
      return this.$store.state.selection;
    },
    assetCount() {
      var assets = this.$store.state.assets;
      return assets && assets.list.length || 0;
    },
    assetStore() {
      var storeState = this.$store.state;
      return storeState.assets.assetStore;
    },
  },
  mounted () {
    var {
      $store,
    } = this;
    var storage = window.localStorage;

    $store.subscribe((mutation, /*state*/)=>{
      var msStart = Date.now();
      var msElapsed = Date.now() - msStart;
      console.log([
          `subscribe mutation:${mutation.type}`,
          `${msElapsed}ms`,
      ].join(' '));
    });
    var localAssets = storage.getItem(`oya-tag`);
    if (localAssets) {
      try {
        var jsAssets = JSON5.parse(localAssets);
        var assetStore = new AssetStore(jsAssets);
        $store.commit("assets/set", assetStore);
        console.log("Loaded local assets.", assetStore);
      } catch(e) {
        console.error("could not load from localStorage", e.message);
      }
    } else {
      console.log("No local assets. Loading sample-data...");
      $store.commit('assets/load');
    }
  },
  methods: {
    editSettings() {
      this.$store.commit("showSettings", true);
    },
    uploadChanged() {
      var that = this;
      var {
        uploadFile,
        $store,
      } = that;
      if (uploadFile) {
        let reader = new FileReader();
        reader.onload = ()=>{
          try {
            var json = JSON5.parse(reader.result);
            var assetStore = new AssetStore(json);
            $store.commit('assets/set', assetStore);
            that.askUpload = false;
            that.overwriteAssets = false;
            var kb = uploadFile.size/1000;
            console.log(`uploaded ${uploadFile.name} ${kb}kB`);
            that.uploadFile = null;
          } catch (e) {
            alert(e.message);
          }
        }
        reader.readAsText(uploadFile);
      }
    },
    loadAssets() {
      this.askUpload = true;
    },
    saveAssets() {
      this.$store.commit("assets/save", json=>{
        var blob = new Blob([json], { type: "text/plain;charset=utf-8" });
        var now = new Date();
        var month = `0${now.getMonth()+1}`;
        var date = `0${now.getDate()}`;
        var dateStr = [
          now.getFullYear(),
          month.substring(month.length-2),
          date.substring(date.length-2),
        ].join('');
        FileSaver.saveAs(blob, `oya-tag-${dateStr}.json`);
      });
    },
    loadSample() {
      var msg = "Replace all asset records with sample data (DANGER!)?";
      confirm(msg) && this.$store
        .commit("assets/load", "/sample-data.json5");
    },
    clearAssets() {
      if (confirm("Clear all asset records (DANGER!)?")) {
        this.$store.commit("assets/load", "/clear-data.json5");
      }
    },
    onMenu (menuItem) {
      console.log(`onMenu`, menuItem);
      if (menuItem.route) {
        this.$router.push(menuItem.route)
      } else if (menuItem.action) {
        menuItem.action.call(this, menuItem);
      } else {
        console.error(`invalid menu item ${JSON.stringify(menuItem)}`);
      }
    },
    pagesColor(route) {
      return route && this.$route.path === route
        ? "green "
        : "";
    },
    menuItemDisabled (menuItem) {
      return menuItem.route && this.$route.path === menuItem.route
    }
  }

}
</script>
<style>
.month {
    margin-top: 5pt;
}
.calendar {
  margin-top: 5pt;
  width: 40px;
  height: 50px;
  background-image: url("/calendar.png");
  background-repeat: no-repeat;
  background-size:40px;
  text-align: center;
  padding-top: 15px;
}
.footer {
  position: absolute;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
  bottom: 0px;
  font-size: x-small;
}
</style>
