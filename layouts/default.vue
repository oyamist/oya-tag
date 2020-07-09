<template>
  <v-app>
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

      <v-spacer />
      <div class="month">
        {{ new Date().toLocaleString(undefined, {month:"short"}) }}
      </div>
      <div class="calendar" :title="new Date().toLocaleDateString()">
        {{ new Date().getDate() }}
      </div>
      <v-spacer />

      {{ $route.path }}
      <v-menu bottom right>
        <template v-slot:activator="{ on }">
          <v-btn dark icon v-on="on">
            <v-icon>mdi-menu</v-icon>
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
    </v-content>
  </v-app>
</template>

<script>
const JSON5 = require( 'json5' );
import FileSaver from 'file-saver';
import EditAsset from '../components/edit-asset';
import AssetStore from '../src/asset-store';
import Package from '../package';

export default {
  name: 'App',
  components: {
    EditAsset
  },
  data () {
    return {
      overwriteAssets: false,
      askUpload: false,
      uploadFile: null,
      viewMenu: [{
        title: 'Help',
        route: '/'
      }, {
        title: 'Timelines',
        route: '/timelines'
      }, {
        title: 'Assets',
        route: '/assets'
      }],
      fileMenu: [{
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
  },
  mounted () {
    var {
      $store,
    } = this;
    var storage = window.localStorage;

    $store.subscribe((mutation, /*state*/)=>{
      var msStart = Date.now();
      var json = JSON.stringify($store.state.assets.assetStore);
      storage.setItem(`oya-tag`, json);
      var msElapsed = Date.now() - msStart;
      console.log(`dbg subscribe mutation:${mutation.type} ${msElapsed}ms`);
    });
    var localAssets = storage.getItem(`oya-tag`);
    if (localAssets) {
      try {
        var jsAssets = JSON5.parse(localAssets);
        var assetStore = new AssetStore(jsAssets);
        $store.commit("assets/set", assetStore);
        console.log("Loaded local assets.", assetStore);
      } catch(e) {
        console.error("could not load from localStorage");
      }
    } else {
      console.log("No local assets. Loading sample-data...");
      $store.commit('assets/load');
    }
  },
  methods: {
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
      var assetStore = this.$store.state.assets.assetStore;
      var indent = 2; // simplify edit and search
      var json = JSON.stringify(assetStore, null, indent);
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
    },
    clearAssets() {
      if (confirm("Clear all asset records (DANGER!)?")) {
        this.$store.commit("assets/clear");
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
