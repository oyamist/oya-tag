<template>
  <div>
    <a :href="tagUrl" v-if="tagUrl">
      {{ tagName }}
    </a>
    <span v-if="!tagUrl"> 
      {{ tagName }}
    </span>
  </div>
</template>
<script>
export default {
  name: 'TagName',
  props: {
    tag: Object,
  },
  computed: {
    assetStore() {
      var storeState = this.$store.state;
      return storeState.assets.assetStore;
    },
    tagName() {
      var {
        tag,
        assetStore,
      } = this;
      var asset = assetStore.assetOfId(tag.name);
      return asset ? asset.name : tag.name;
    },
    tagUrl() {
      var {
        tag,
        assetStore,
      } = this;
      var asset = assetStore.assetOfId(tag.name);
      return asset ? `/assets#${asset.guid}` : null;
    },
  },
}
</script>
<style>
</style>
