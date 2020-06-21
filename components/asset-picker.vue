<template>
  <v-autocomplete
    v-model="asset[propName]"
    label="Plant"
    outlined
    :items="typeList(propName)"
    :loading="false"
    color="white"
    :rules="rules"
    item-text="name"
    item-value="id"
    placeholder="Start typing to Search"
  ></v-autocomplete>
</template>

<script>
  export default {
    name: "AssetPicker",
    props: {
      asset: Object,
      propName: String,
    },
    data: ()=>{ 
      return {};
    },
    methods: {
      typeList(type) {
        var values = this.assetStore.assetsOfType(type);
        return values;
      },
    },
    computed: {
      rules() {
        return [
          v => !!v,
        ];
      },
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
