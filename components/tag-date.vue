<template>
  <div :title="title">
    {{date}}
  </div>
</template>
<script>
export default {
  name: 'TagDate',
  props: {
    tag: Object,
  },
  computed: {
    date() {
      var { tag, } = this;
      var ymd = tag.date.toLocaleDateString(undefined, {
        year: "2-digit",
        month: "numeric",
        day: "numeric",
      });
      var suffix = tag.applies ? "" : "?";
      return `${ymd}${suffix}`;
    },
    title() {
      var { tag, } = this;
      var ymd = tag.date.toLocaleDateString(undefined, {
        year: "numeric",
        weekday: "short",
        month: "long",
        day: "numeric",
      });
      var msDay = 24 * 60 * 60 * 1000;
      var ago = Math.round((Date.now() - tag.date) / msDay);
      return `${ymd} (${ago} days)`;
    },
  },
}
</script>
<style>
</style>
