<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-card max-width="60em" flat>
      <v-card-title>
        <div class="title">
         <img src="/leaf-beta.png" height="40px"/>
         Oya-Tag
        </div>
        <v-spacer/>
      </v-card-title>
      <v-card-text>
        Track and tag your plants, supplies and whatever with
        a private but shareable Oya-Tag online journal. 
        
      </v-card-text>
      <v-card-text>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search features"
          single-line
          clearable
          hide-details
          ></v-text-field>
      </v-card-text>
      <v-data-table 
        :search="search"
        :expanded.sync="expanded"
        show-expand
        item-key="text"
        class="feature-table"
        :headers="headers"
        :items="features"
        :items-per-page="15"
        :custom-filter="filter"
      >
        <template v-slot:item.done="{ item }">
            <v-simple-checkbox v-model="item.done" disabled>
            </v-simple-checkbox>
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length" class="feature-container"> 
            <div class="feature-content">
              {{ item.notes }} 
              <img v-if="item.img" 
                class="feature-image"
                :width="item.imgW"
                :src="`/${item.img}`" />
            </div><!-- feature-content -->
          </td>
          
        </template>
      </v-data-table>
      <v-card-text>
        <v-row>
          <v-spacer/>
          <v-btn color="green darken-2" dark
            @click="$router.push('/assets')"
            >
            Got it!
          </v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script>
export default {
  data() {return {
    search: '',
    expanded: [],
    headers: [{
      text: "Status",
      value: "done",
    },{
      text: "Feature",
      value: "text",
    },{
      text: '',
      value: "data-table-expand",
      align: 'end',
    }],
    features: [{
      done: true,
      text: `Instant search`,
      notes: `
        Search results are shown as you type. 
        Search your assets by id, guid, type description, etc.
        `,
      img: `eg-search.png`,
      imgW: `500px`,
    },{
      done: true,
      text: `Asset creation wizard`,
      notes: `
        Create different types of assets with the asset creation wizard.
        `,
      img: `eg-add-asset.png`,
      imgW: `400px`,
    },{
      done: true,
      text: `Autonumber assets`,
      notes: `
        Assign your own unique asset IDs 
        or click "NEW" to automatically create a new
        ID matching pre-printed barcode labels:
        A0001, A0002, ...`,
      img: `eg-new-site-id.png`,
      imgW: `400px`,
    },{
      done: true,
      text: `Tag your assets`,
      notes: `
        Tag assets with one or more tags.
        Each tag has a date, a name, and an optional note.
        Link assets by naming a tag with another asset's ID.
        `,
      img: `eg-edit-plant.png`,
      imgW: `400px`,
    },{
      done: true,
      text: `View crop timelines`,
      notes: `
        Crop timelines show you what you've planted and when.
        Use timelines to know when to sow.
        `,
      img: `eg-timelines.png`,
      imgW: `400px`,
    },{
      done: true,
      text: `Load/save your data for sharing or backup`,
      notes: `Your assets are not stored in the cloud.
        Your assets are stored privately
        in your own computer's browser local storage.
        It's your data and nobody can see it but you.
        Save your assets for backup or sharing.
        Oya-Tag uses a human readable JSON open file format. 
        `,
      img: `eg-menu.png`,
      imgW: "200px",
    }],
  }},
  methods: {
    filter(value, search, item) {
      if (value == null || search == null) {
        return false;
      }
      var re = new RegExp(search, "iu");
      return item.text && item.text.match(re) || 
        item.notes && item.notes.match(re);
    },
  },
  components: {
  }
}
</script>
<style>
.feature-table {
  max-width: 40em;
}
.feature-image {
  display: block;
  padding-bottom: 0.8em;
}
.v-data-table tbody tr.v-data-table__expanded__content {
  background-color: #eee;
  box-shadow: none;
}
.feature-content {
  display: inline-block;
  padding-left: 1em;
}
.feature-container {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: wrap;
}
</style>
