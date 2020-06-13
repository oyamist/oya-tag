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
        :items="assets" :items-per-page.sync="assetsPerPage"
        >
        <template v-slot:item.ageDays="{ item }">
          <v-chip :color="getAgeColor(item)" small dark>
            {{ item.ageDays }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon
            small
            class="mr-2"
            @click="$router.push(`/assets#${item.id}`)"
          >
            mdi-pencil
          </v-icon>
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
      assetsPerPage: 6,
      headers: [{
        text: "Age",
        value: "ageDays",
      },{
        text: "ID",
        value: "id",
      },{
        text: "Asset",
        value: "type",
      },{
        text: "Notes",
        value: "notes",
      },{
        text: "Actions",
        value: "actions",
        sortable: false,
      }],
    }
  },
  watch: {
    $route(/*to, from*/) {
      this.routeAsset();
    },
  },
  methods: {
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
        return 'grey'
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
</style>
