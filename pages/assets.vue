<template>
    <v-card v-if="assets" flat>
      <v-card-title>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search assets"
          single-line
          clearable
          hide-details
          ></v-text-field>
        <v-spacer/>
        <v-btn color="green darken-2" icon class="mb-2" 
          title="Add Asset"
          @click="addAsset()"
          ><v-icon>mdi-clipboard-plus</v-icon></v-btn>
      </v-card-title>
      <v-data-table class="elevation-1" 
        :search="search"
        :headers="headers"
        single-expand
        show-expand :expanded.sync="expanded"
        :items="assets" 
        :items-per-page.sync="assetsPerPage"
        >
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length"> <div class="asset-expanded">
            <div>
              {{item.type}}
              {{item.lastTag.name}}:
              {{item.lastTag.date.toLocaleDateString()}}
            </div>
            <v-btn small class="mr-2" color="primary"
              @click="$router.push(`/assets#${item.id}`)"
              > 
                <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </div></td>
        </template>
        <template v-slot:item.id="{ item }">
            {{ item.id }} / {{ item.name }}
        </template>
        <template v-slot:item.ageDays="{ item }">
          <v-chip :color="getAgeColor(item)" small dark>
            {{ ageDays(item) }}
          </v-chip>
        </template>
      </v-data-table>
        {{$store.state.selection}}
    </v-card>
</template>

<script>
export default {
  name: 'ViewAssets',

  props: {
  },
  data: () => {
    return {
      search: '',
      assetsPerPage: -1,
      expanded: [],
      headers: [
        { text: "Age", value: "ageDays", },
        { text: "Asset", value: "summary", },
        { text: '', value: 'data-table-expand', },
      ],
    }
  },
  watch: {
    $route(/*to, from*/) {
      this.routeAsset();
    },
  },
  methods: {
    ageDays(item) {
      return item.ageDays;
    },
    validNotes: v=> v ? true : true,
    routeAsset() {
      var hash = this.$route.hash;
      var id = hash && hash.substring(1);
      var store = this.$store;
      var assetStore = store.state.assets.assetStore;
      if (assetStore) {
          var asset = assetStore && assetStore.assetOfId(id);
          asset && store.commit('select', asset);
          console.log(`assets.routeAsset`, this.$route, id, asset);
      } else {
          console.log(`assets.routeAsset (waiting for assetStore...)`);
      }
    },
    click(...args) {
      console.log(`click`, args);
    },
    addAsset() {
      var type = prompt("New asset type", "crop");
      if (!type) {
        return;
      } 
      var $router = this.$router;
      var opts = {
        type, 
        name: `${type}_name?`,
        committed: asset => {
          $router.push(`/assets#${asset.id}`);
        },
      };
      this.$store.commit('assets/add', opts);
    },
    save () {
      console.log('Dialog saved')
    },
    cancel () {
      console.log('Dialog cancelled')
    },
    open () {
      console.log('Dialog opened')
    },
    close () {
      console.log('Dialog closed')
    },
    getAgeColor(item) {
      var {
        started,
      } = item;
      var age = item.ageDays;
      if (age == null) {
        return '#eee';
      } else if (age < 0) {
        return 'grey lighten-2 black--text'
      } else {
        return started 
          ? 'green darken-4'
          : 'orange darken-4';
      }
    },
    cssScrollY() {
      var css = [
      ];
      return css.join(';');
    },
  },
  computed: {
    assets() {
      return this.$store.state.assets.list;
    },
  },
  mounted() {
    var {
      $store,
    } = this;
    $store.state.assets.assetStore && this.routeAsset(); 
    this.$store.watch(
      ()=>($store.state.assets.assetStore),
      (/*assetStore, getters*/)=>(this.routeAsset())
    );
  },
  components: {
  },
}
</script>
<style>
.v-data-table tbody tr.v-data-table__expanded__content {
  background-color: #eee;
  box-shadow: none;
}
.asset-expanded {
  display:flex; 
  align-items: center; 
  justify-content: space-between;
}
</style>
