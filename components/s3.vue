<template>
  <div class="s3 ml-1 pb-3">
    <script src="/lib/aws-sdk-2.715.0.min.js"></script>
    <v-icon v-if="AWS" small color="light-green darken-2" 
        title="AWS S3 backup enabled"
        >mdi-cloud-check</v-icon>
    <v-icon small color="grey darken-2" >
        mdi-cloud
    </v-icon>
  </div>
</template>
<script>
import Vue from "vue";

export default {
  name: 'S3',
  props: {
  },
  data: () => {
    return {
      AWS: null,
    }
  },
  created() {
    console.log(`default.created()`);
    if (!Object.prototype.hasOwnProperty.call(window, "AWS")) {
        console.log(`adding AWS get/set`);
        Object.defineProperty(window, "AWS", {
            get: ()=>{
                return this.AWS;
            },
            set: (value) => {
                console.log(`default.AWS`, value);
                Vue.set(this, "AWS", value);
            },
        });
    }
  },
  mounted(){
  },
  methods: {
  },
  computed: {
  },
}
</script>
<style scoped>
.s3 {
}
</style>

