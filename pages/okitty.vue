<template>
  <v-card flat>
    <v-card-title>
      OKitty
    </v-card-title>
    <v-card-text>
      <v-text-field v-model="parms.login" label="login" />
      <v-text-field v-model="parms.client_id" label="client_id" />
      <v-text-field v-model="parms.redirect_uri" label="redirect_uri" />
      <v-text-field v-model="parms.state" label="state" />
      <v-btn raised dark color="green darken-2"
        @click="onAuthenticate()"
        >Authenticate</v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'OKitty',

  props: {
  },
  data: () => {
    return {
      search: '',
      parms: {
        client_id: "e09323f45953b1bad4d5",
        //redirect_uri: "https://localhost/okitty",
        redirect_uri: "https://gifted-visvesvaraya-bb90f2.netlify.app/okitty",
        state: Math.random(),
        login: "oyamist",
      },
    }
  },
  methods: {
    onAuthenticate() {
      var that = this;
      var {
        parms,
      } = that;
      (async function() { try {
        var query = Object.keys(parms)
          .map(p=>`${p}=${encodeURIComponent(parms[p])}`)
          .join("&");
        console.log(`dbg query`, query);
        var url = `https://github.com/login/oauth/authorize?${query}`;
        var res = await that.$axios.get(url);
        console.log(`dbg authenticate`, res);
      } catch(e) {
        console.error(e);
      }})();
    },
  },
  computed: {
  },
  mounted() {
  },
  components: {
  },
}
</script>
<style>
</style>
