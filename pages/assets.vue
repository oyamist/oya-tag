<template>
    <v-card v-if="g.assetStore && assets" flat>
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
      <v-data-table class="elevation-1" v-if="g.assetStore"
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
            @click="$router.push(`/assets/${item.id}`)"
          >
            mdi-pencil
          </v-icon>
        </template>
      </v-data-table>
    </v-card>
</template>

<script>
import AppGlobal from "../src/app-global"

const g = AppGlobal.g();

export default {
  name: 'ViewAssets',

  props: {
  },
  data: () => {
    return {
      g,
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
      var id = this.$route.params.id;
      var asset = g.assetStore && g.assetStore.assetOfId(id);
      if (asset) {
        asset && this.editItem(asset);
      }
    },
    editItem(item) {
      console.log(`editItem`, item);
      g.selection.clear().add(item);
    },
    click(...args) {
      console.log(`click`, args);
    },
    addAsset() {
      var type = prompt("New asset type", "crop");
      if (!type) {
        return;
      } 
      this.$store.commit('assets/add', {type});
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
    this.$store.commit('increment');
    this.routeAsset();
  },
  components: {
  },
}
</script>
<style>
</style>
