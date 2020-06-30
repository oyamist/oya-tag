<template>
    <div class="gr-board" v-if="timelines">
      <div class="gr-timelines">
        <v-row class="gr-board-pane align-flex-end"><!-- title -->
          <timeline v-for="tl in timelines" :key="tl.name"
              :id="tl.id"
              :label="tl.name"
              :showItems="false"
              :g="g"
          />
        </v-row><!-- title -->
      </div>
      <div class="gr-timelines" :style="cssScrollY()"
        id="scroll-target-y" >
        <v-row class="gr-board-pane"><!-- items -->
          <timeline v-for="tl in timelines" :key="tl.name"
              :id="tl.id"
              :label="tl.name"
              :items="tl.items" 
              :showTitle="false"
              :g="g"
          />
        </v-row><!-- items -->
      </div>
    </div><!-- gr-board -->
</template>

<script>
import Timeline from "../components/timeline";

var g = window.g;

export default {
name: 'ViewTimeline',
data: () => {
  return {
    days: 120,
    g,
  }
},
methods: {
  cssScrollY() {
    var h = window.innerHeight - 100;
    var css = [
      `height: ${h}px`,
      `border-top: 1pt solid gray`,
      `overflow: scroll`,
    ];
    return css.join(';');
  },
},
computed: {
    assetStore() {
        return this.$store.state.assets.assetStore;
    },
    timelines() {
        var assetStore = this.assetStore;
        return assetStore && assetStore.timelines() || [];
    }
},
mounted() {
},
components: {
  Timeline,
},
}
</script>
<style>
.gr-board {
  padding: 5px;
}
.gr-timelines{
  padding: 0;
  margin: 0;
  padding-left: 5px;
}
.gr-board-pane{
  padding-left: 0.5em;
  padding-top: 5px;
  padding-bottom: 5px;
  width: 100%;
}
.align-flex-end {
  align-items: flex-end;
}
</style>
