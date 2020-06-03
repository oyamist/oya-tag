<template>
  <div>
    <div class="gr-title" :style="cssTitle()"
        v-if="showTitle">
      {{label}}
    </div>
    <div v-if="showItems" class="gr-timeline" :style="cssTimeline()">
      <div v-for="day in days" :key="day" 
        class="gr-day" :style="cssDay(day)">
      <div>{{dateOfDay(day)}}</div>
    </div>
      <div v-for="asset in items" :key="asset.id"
        @click="onClickAsset(asset, $event)"
        class="gr-item" :style="cssItem(asset)">
        {{asset.id}}
      </div><!-- item -->
    </div><!-- timeline -->
  </div>
</template>

<script>
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
        default: 30,
      },
      items: Array,
      days: {
        type: Number,
        default: 50,
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
      cssItem(item) {
        var days = item.ageDays+this.daysFuture;
        var css = [
          `width:${this.itemW}px`,
          `top:${days*this.itemH}px`,
        ];
        var curAsset = this.$store.state.selection;
        if (curAsset === item) {
          css.push(`box-shadow: 0px 1px 1px 4px #18FFFF`);
        }
        if (item.started) {
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
      cssDay(day) {
        var d = this.dayDate(day);
        var css = [
          `height:${this.itemH}px`,
          `width:${this.itemW}px`,
        ];
        var pastColor = '#EFEBE9';
        if (day > this.daysFuture) {
            css.push(`background: ${pastColor}`);
        }
        if (day === this.daysFuture) {
            css.push(`border-top:1pt solid ${pastColor}`);
        }
        switch (d.getDay()) {
          case 0: // sunday
            css.push(`border-bottom: 1pt solid #ffffff`);
            css.push(`color: black`);
            break;
          case 6: // saturday
            css.push(`color: black`);
            break;
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
      dayDate(day) {
        var now = Date.now();
        var msDay = 24*60*60*1000;
        return new Date(now-(day-1)*msDay);
      },
      dateOfDay(day) {
        var d = this.dayDate(day-this.daysFuture);
        var ds = d.toLocaleDateString();
        var dateParts = ds.split(/[./]/);
        var dateSep = ds.charAt(dateParts[0].length);
        return `${dateParts[0]}${dateSep}${dateParts[1]}`;
      },
    },
    computed: {
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
