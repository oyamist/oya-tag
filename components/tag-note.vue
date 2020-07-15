<template>
  <div>
    <a v-if="tag.noteUrl" :href="tag.noteUrl"
      target="_blank">
      {{noteSummary}}
    </a>
    <span v-if="!tag.noteUrl">
      {{noteSummary}}
    </span>
  </div>
</template>
<script>
export default {
  name: 'TagNote',
  props: {
    tag: Object,
  },
  data: () => {
    return {
      asset: null,
    }
  },
  mounted(){
  },
  methods: {
  },
  computed: {
    assetStore() {
      var storeState = this.$store.state;
      return storeState.assets.assetStore;
    },
    noteSummary() {
      var {
        tag,
      } = this;
      var maxNote = 40;
      if (tag.noteUrl) {
        return tag.noteUrl.hostname;
      } else {
        return tag && tag.note && tag.note.length > maxNote
          ? tag.note.substring(0, maxNote) + '...'
          : tag.note;
      }
    },
  },
}
</script>
<style>
</style>
