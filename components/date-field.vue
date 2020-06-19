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
        set: function(value) {
          var tzoffset = (new Date()).getTimezoneOffset() * 60000;
          var ms = new Date(value).getTime()+tzoffset;
          var saveDate = new Date(ms);
          console.log(`dbg set pickerDate`, value, saveDate);
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
