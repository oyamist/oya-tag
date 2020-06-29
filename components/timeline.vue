<template>
  <div>
    <div v-if="showTitle" class="gr-title" :style="cssTitle()">
      {{label}}
    </div>
    <div v-if="showItems" 
      class="gr-timeline" :style="cssTimeline()">
      <div v-for="day1 in days" :key="day1" 
        class="gr-day" :style="cssDay(day1)">
        <div>
          &nbsp;
        </div>
      </div>
      <div v-for="start in starts" :key="start.dateStr"
        @click="onClickAsset(start, $event)"
        class="gr-item" :style="start.style">
        {{start.dateStr}}
      </div><!-- starts -->
    </div><!-- timeline -->
  </div>
</template>

<script>
const Dates = require('../src/dates');

export default {
  name: "Timeline",
  props: {
    label: {
      type: String,
      default: "Timeline",
    },
    itemW: {
      type: Number,
      default: 90,
    },
    itemH: {
      type: Number,
      default: 5,
    },
    items: Array,
    days: {
      type: Number,
      default: 7*26,
    },
    daysFuture: {
      type: Number,
      default: 7,
    },
    showTitle: {
      type: Boolean,
      default: true,
    },
    showItems: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
  }),
  methods: {
    onClickAsset(asset, /*event*/) {
      this.$router.push(`/assets#${asset.id}`);
    },
    cssTitle() {
      return [
          `width:${this.itemW}px`,
      ].join(';');
    },
    cssStart(start) {
      if (!start) {
        return [
          `background: red`,
        ].join(';');
      }
      var days = start.ageDays+this.daysFuture;
      var css = [
        `width:${this.itemW}px`,
        `top:${days*this.itemH}px`,
      ];
      var curAsset = this.$store.state.selection;
      if (curAsset === start) {
        css.push(`box-shadow: 0px 1px 1px 4px #18FFFF`);
      }
      if (start.started) {
        css.push(`background:#1b5e20`);
      } else {
        css.push(`color:#aaaaaa`);
        css.push(`border: 1px solid #aaaaaa`);
        var dark = "#eeeeee";
        var light = "#ffffff";
        var gradArgs = [
          `45deg`,
          `${light} 25%`,
          `${dark} 25%`,
          `${dark} 50%`,
          `${light} 50%`,
          `${light} 75%`,
          `${dark} 75%`,
          `${dark} 100%`,
        ].join(',');
        gradArgs || 0;
        css.push(`background-repeat: repeat`);
        css.push(`background-image: linear-gradient(${gradArgs})`);
        css.push(`background-size: 5.66px 5.66px`);
      }
      
      return css.join(';');
    },
    cssDay(day1) {
      var d = this.dayDate(day1);
      var css = [
        `height:${this.itemH}px`,
        `width:${this.itemW}px`,
      ];
      var sunday = d.getDay() === 0;
      var sundayCSS = `
      background-image: linear-gradient(45deg, #eeeeee 25%, #cccccc 25%, #cccccc 50%, #eeeeee 50%, #eeeeee 75%, #cccccc 75%, #cccccc 100%);
      background-size: 14.14px 14.14px;
      background-repeat: repeat-x;
      `
      if (day1 === this.daysFuture+1) { // today
        css.push('background: #C6FF00');
      } else if (day1 > this.daysFuture) { // past
        css.push(sunday ? sundayCSS : `background: #EFEBE9`);
      } else {
        css.push(sunday ? sundayCSS : `color: #FFFFFF`);
      }
      return css.join(';');
    },
    cssTimeline() {
      var itemW = this.itemW;
      var css = [
        `width:${itemW}px`,
      ];
      return css.join(';');
    },
    dayDate(day1) {
      var now = Date.now();
      var msDay = 24*60*60*1000;
      return new Date(now-(day1-1)*msDay);
    },
    dateOfDay(day) {
      var d = this.dayDate(day-this.daysFuture);
      return Dates.toMMDD(d);
    },
  },
  computed: {
    starts() {
      var items = (this.items||[]).slice().sort((a,b) => 
        a.firstTag.date.getTime() - b.firstTag.date.getTime());
      var dateMap = {};
      var that = this;
      var starts = items.reduce((a,asset) => {
        var date = asset.firstTag.date;
        var dateStr = Dates.toMMDDYY(date);
        var start = dateMap[dateStr];
        if (!start) {
          dateMap[dateStr] = true;
          start = {
            started: asset.started,
            ageDays: asset.ageDays,
            assets: [],
            dateStr,
          };
          a.push(start);
        }
        start.started = start.started && asset.started;
        start.style = that.cssStart(start);
        start.assets.push(asset);
        return a;
      }, []);
      console.log(`dbg starts`, starts);
      return starts;
    },
    assetStore() {
        return this.$store.state.assets.assetStore;
    },
  },
  mounted() {
      console.log(`mounted Timeline ${this.days} `);
  },
}
</script>
<style>
.gr-title {
  text-align: center;
}
.gr-day{
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: x-small;
  color: #888;
}
.gr-timeline {
  position: relative;
  display: flex;
  flex-flow: column;
  align-items: center;
  padding:0;
  margin: 0;
  margin-left: 5px;
  margin-right: 5px;
}
.gr-item {
  padding: 0;
  margin: 0;
  cursor: pointer;
  position: absolute;
  border-radius: 2px;
  color: #fff;
  text-align: center;
  width: 100%;
}
</style>
