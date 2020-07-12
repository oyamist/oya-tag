<template>
  <div>
    <v-card v-if="assets" flat>
      <v-card-title>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search..."
          solo-line
          solo
          clearable
          class="search-field"
          @keypress="onSearchKey"
          @input="onSearchInput"
          hide-details
          ></v-text-field>
        <v-spacer/>
        <v-btn color="green darken-2" icon class="pl-3 " 
          title="Add Asset"
          @click="addAsset()"
          ><v-icon large>mdi-plus-circle</v-icon></v-btn>
      </v-card-title>
      <v-data-table v-if="assetStore"
        class="elevation-1" 
        :search="search"
        :headers="assetHeaders"
        single-expand
        show-expand :expanded.sync="expanded"
        :items="assets" 
        item-key="guid"
        :items-per-page.sync="assetsPerPage"
        :custom-filter="assetFilter"
        >
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length"> <div class="asset-expanded">
            <table class="tag-table">
              <caption class="tag-caption">
                {{item.type.toUpperCase()}}: {{item.guid}}
              </caption>
              <tr v-for="(tag,i) in item.tagList" :key="i" >
                <td style="max-width: 6em">
                  {{tag.date.toLocaleDateString()}}
                </td>
                <td style="max-width: 6em">{{tag.name}}</td>
                <td>{{tag.note}}</td>
              </tr>
            </table>
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
        <template v-slot:item.lastTag="{ item }">
          <a v-if="tagUrl(item.lastTag)"
            :href="tagUrl(item.lastTag)">
            {{tagText(item.lastTag)}}
          </a>
          <span v-if="!tagUrl(item.lastTag)">
            {{tagText(item.lastTag)}}
          </span>
        </template>
        <template v-slot:item.ageDays="{ item }">
          <v-chip :color="getAgeColor(item)" small dark>
            {{ ageDays(item) }}
          </v-chip>
        </template>
      </v-data-table>
        {{$store.state.selection}}
      <add-asset/>
    </v-card>
  </div>
</template>

<script>
import Vue from "vue";
import AddAsset from "../components/add-asset";
export default {
  name: 'ViewAssets',

  props: {
  },
  data: () => {
    return {
      search: '',
      newAsset: {},
      assetsPerPage: -1,
      expanded: [],
      tagHeaders: [
        { text: "Date", value: "localeDate", }, 
        { text: "Tag", value: "name", }, 
        { text: "Note", value: "note", }, 
      ],
      assetHeaders: [
        { text: "Start Days", value: "ageDays", },
        { text: "Asset", value: "summary", },
        { text: "LastTag", value: "lastTag", },
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
    onSearchInput(input) {
      this.$router.replace({
        path: "assets",
        query: {
          search: input,
        },
      });
    },
    onSearchKey(event) {
      if (event.charCode === 13) { // Enter
        event.target.select();
      }
    },
    tagText(tag) {
      var {
        assetStore,
      } = this;
      var asset = assetStore.assetOfId(tag.name);
      return asset
        ? `${asset.name} @ ${tag.date.toLocaleDateString()}`
        : `${tag.name} @ ${tag.date.toLocaleDateString()}`;
    },
    tagUrl(tag) {
      var {
        assetStore,
      } = this;
      var asset = assetStore.assetOfId(tag.name);
      return asset ? `/assets#${asset.guid}` : null;
    },
    ageDays(item) {
      return item.ageDays;
    },
    validNotes: v=> v ? true : true,
    routeAsset() {
      var hash = this.$route.hash;
      var id = hash && hash.substring(1);
      var store = this.$store;
      var assetStore = this.assetStore;
      if (assetStore) {
          var asset = assetStore.assetOfId(id);
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
      this.$store.commit("showAddAsset", true);
    },
    getAgeColor(item) {
      var {
        started,
        lastTag,
      } = item;
      var age = item.ageDays;
      if (lastTag.name === 'end') {
        return '#888';
      } else if (age == null) {
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
    assetFilter(value,search,item) {
      var assetStore = this.assetStore;
      return assetStore.assetFilter(assetStore, search, item);
    }
  },
  computed: {
    assets() {
      return this.$store.state.assets.list;
    },
    assetStore() {
      var storeState = this.$store.state;
      return storeState.assets.assetStore;
    },
  },
  mounted() {
    var {
      $store,
      $route,
    } = this;
    var search = $route.query.search;
    var that = this;
    if (search) {
      this.$nextTick(() => {
        Vue.set(that, "search", search);
      });
      console.log(`dbg mounted`, search);
    }
    $store.state.assets.assetStore && this.routeAsset(); 
    this.$store.watch(
      ()=>($store.state.assets.assetStore),
      (/*assetStore, getters*/)=>(this.routeAsset())
    );
  },
  components: {
    AddAsset,
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
  flex-flow: column nowrap;
  align-items: center; 
  xjustify-content: space-between;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
}
tbody tr:hover {
  background-color: #ffe !important;
}
.tag-caption {
  border-bottom: 1pt solid #ffffff;
  text-align: left;
}
.tag-table {
  border-left: 1pt solid #ffffff;
  margin-bottom: 0.5em;
}
.tag-table td {
  height: 1.2em;
}
.search-field {
  max-width: 280px;
}
</style>
