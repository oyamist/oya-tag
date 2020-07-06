<template>
  <v-autocomplete
    v-model="asset[propName]"
    :label="label"
    solo
    :autofocus="autofocus"
    :items="typeList(propName)"
    :loading="false"
    color="white"
    :rules="rules"
    item-text="name"
    item-value="id"
    :placeholder="`Enter ${propName}`"
  ></v-autocomplete>
</template>

<script>
  export default {
    name: "AssetPicker",
    props: {
      asset: Object,
      propName: String,
      label: String,
      rules: Array,
      autofocus: Boolean,
    },
    data: ()=>{ 
      return {};
    },
    methods: {
      typeList(type) {
        var values = this.assetStore.assetsOfType(type);
        return values.sort((a,b) => a.name.localeCompare(b.name));
      },
    },
    computed: {
      assetStore() {
        return this.$store.state.assets.assetStore;
      },
    },
    mounted() {
    },
    components: {
    }
  }
</script>
<style>
</style>
