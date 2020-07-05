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
        a private but shareable Oya-Tag online journal:
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
          <td :colspan="headers.length-1">&nbsp;</td>
          <td> {{ item.notes }} </td>
        </template>
      </v-data-table>
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
    }],
    features: [{
      done: true,
      text: `Typed assets`,
      notes: `Assets have customizable types such as: 
        crop, plant, site`,
    },{
      done: true,
      text: `Instant search`,
      notes: `Search results are shown as you type. 
        Search by id, guid, type description, etc.`,
    },{
      done: true,
      text: `Autonumber assets`,
      notes: `New assets are assigned unique ids
        to match pre-printed barcode labels:
        A0001, A0002, ...`,
    },{
      done: true,
      text: `Track asset lifecycle`,
      notes: `Use tags to track events over the lifetime of an asset.
        Record growth stages for individual plants 
        (e.g., sow, sprout, flower, harvest, etc.).
        or manage inventory assets in general
        (e.g., purchase date, plan maintenance, etc.)
        `,
    },{
      done: true,
      text: `Link assets effortlessly`,
      notes: `Tag an asset with related asset ids to link them.
        For example, 
        you can tag tomato A0001
        with netpot A0002 
        and bucket A0003 
        and planter A0004`
    },{
      done: true,
      text: `Tags are dated`,
      notes: `Each tag has an editable date which
        can be designated as "planned" or "actual"`,
    },{
      done: true,
      text: `Tags have notes`,
      notes: `Add arbitrary notes such as: "planted 3 seeds in netpot"`,
    },{
      done: true,
      text: `Open file format`,
      notes: `Load/save your assets with the Oya-Tag JSON
        open file format. You can even edit it with any JSON editor.`,
    },{
      done: true,
      text: `Privacy`,
      notes: `Your assets are stored in your browser local storage.
        You can save them as you wish.  It's your data`,
    },{
      done: true,
      text: 'Automatic "To-Do" list',
      notes: `Incomplete tasks are sorted by planned date
        so that you know what to do when
        (e.g. plant Broccoli today)`,
    },{
      done: false,
      text: `Timeline suggestions`,
      notes: `Crop timelines suggest action based
        on recent and historical activity.
        E.g. plant Broccoli today!
        `,
    },{
      done: false,
      text: `Scan barcodes`,
      notes: `Save time and effort by using a barcode reader.
        Scan a barcode to find an asset.
        Scan a barcode to add a new asset tag.
        Beep beep and you're done.
        `,
    },{
      done: false,
      text: `Print asset labels`,
      notes: `Print individual asset labels with barcodes`,
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
