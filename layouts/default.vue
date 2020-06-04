<template>
  <v-app>
    <v-app-bar dark fixed app>
      <div class="d-flex align-center">
        <v-img
          src="/leaf.png"
          alt="Crop-Log logo"
          class="shrink mr-2"
          contain
          transition="scale-transition"
          width="40"
        />
        Oya-Tag
      </div>

      <v-spacer />
      <div class="calendar" :title="new Date().toLocaleDateString()">
        {{ new Date().getDate() }}
      </div>
      <v-spacer />

      {{ $route.path }}
      <v-menu bottom right>
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
          <v-dialog v-model="askUpload" persistent >
            <v-card>
              <v-card-title>
                Choose assets file and upload
              </v-card-title>
              <v-card-text>
                <v-file-input 
                  append-icon="mdi-upload"
                  prepend-icon=""
                  placeholder="Click to choose file"
                  loading
                  show-size
                  accept="application/json"
                  outlined
                  @change="uploadChanged()"
                  v-model="uploadFile"
                  >
                </v-file-input>
              </v-card-text>
            </v-card>
          </v-dialog>
        </v-container>
    </v-content>
  </v-app>
</template>

<script>
import FileSaver from 'file-saver';
import EditAsset from '../components/edit-asset';
import AssetStore from '../src/asset-store';

export default {
  name: 'App',
  components: {
    EditAsset
  },
  data () {
    return {
      askUpload: false,
      uploadFile: null,
      viewMenu: [{
        title: 'Home',
        route: '/'
      }, {
        title: 'Timelines',
        route: '/timelines'
      }, {
        title: 'Assets',
        route: '/assets'
      }],
      fileMenu: [{
        title: 'Load',
        action: this.load,
      },{
        title: 'Save',
        action: this.save,
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
    curAsset() {
      return this.$store.state.selection;
    },
  },
  mounted () {
    var {
      $store,
    } = this;
    var storage = window.localStorage;

    $store.subscribe((mutation, /*state*/)=>{
      var msStart = Date.now();
      storage.setItem(`oya-tag.json`, $store.state.assets.assetStore);
      var msElapsed = Date.now() - msStart;
      console.log(`dbg subscribe mutation:${mutation.type} ${msElapsed}ms`);
    });
    $store.commit('assets/load');
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
            var json = JSON.parse(reader.result);
            var assetStore = new AssetStore(json);
            $store.commit('assets/set', assetStore);
            that.askUpload = false;
            var kb = uploadFile/1000;
            console.log(`uploaded ${uploadFile.name} ${kb}kB`);
          } catch (e) {
            alert(e.message);
          }
        }
        reader.readAsText(uploadFile);
      }
    },
    load() {
      this.askUpload = true;
    },
    save() {
      var assetStore = this.$store.state.assets.assetStore;
      var json = JSON.stringify(assetStore, null, 2);
      var blob = new Blob([json], { type: "text/plain;charset=utf-8" });
      FileSaver.saveAs(blob, "oya-tag.json");
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
</style>
