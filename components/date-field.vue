<template>
  <div>
    <v-text-field :label="label" v-model="date"
      class="date-field"
      hide-details="true"
      outlined
      @click:append="onClickText()"
      append-icon="mdi-calendar"/>
    <v-dialog v-model="showPicker">
      <v-date-picker v-model="pickerDate" 
        :show-current="true" />
    </v-dialog>
  </div>
</template>

<script>
  const Dates = require('../src/dates');
  export default {
    name: "DateField",
    props: {
      item: Object,
      model: String,
      label: String,
      max: undefined,
    },
    data: () => ({
      showPicker: false,
    }),
    methods: {
      onClickText() {
        this.showPicker = true;
      },
    },
    computed: {
      date: {
        get: function() {
          var field = this.item[this.model];
          return field.toLocaleDateString();
        },
        set: function(value) {
          this.item[this.model] = new Date(value);
        },
      },
      pickerDate: {
        get: function() {
          var field = this.item[this.model];
          return field.toISOString().substr(0, 10);
        },
        set: function(isoYMD) {
          var saveDate = Dates.fromYMD(isoYMD);
          console.log(`dbg set pickerDate`, isoYMD, saveDate.toLocaleString());
          this.item[this.model] = saveDate;
        },
      },
    },
    mounted() {
    },
  }
</script>
<style scoped>
.date-field {
    min-width: 9em;
}
</style>
