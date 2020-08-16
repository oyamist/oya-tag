<template>
  <v-card flat>
    <v-card-title>
      Github Login
    </v-card-title>
    <v-card-text>
      <div>code: {{code}}</div>
      <div>state: {{state}}</div>
    </v-card-text>
  </v-card>
</template>

<script>
import Vue from "vue";

const CLIENT_ID_LOCAL = "e09323f45953b1bad4d5";
const CLIENT_ID_NETLIFY = "Iv1.4f3c43ace0d95b21";
const REDIRECT_LOCAL = "http://localhost:3000/login";
const REDIRECT_NETLIFY = "https://gifted-visvesvaraya-bb90f2.netlify.app/";
const TOKEN_URL = "https://github.com/login/oauth/access_token";
const ISLOCAL = true;

var CLIENT_SECRET = "TODO"; // this can't be in the code

export default {
  name: 'Login',

  props: {
  },
  data: () => {
    return {
      code: '',
      state: '',
    }
  },
  methods: {
  },
  computed: {
  },
  mounted() {
    var { $route, $axios, } = this;
    var { code, state, } = $route.query;
    Vue.set(this, "code", code);
    Vue.set(this, "state", state);
    (async function() { try {
      var data = ISLOCAL 
        ? {
          client_id: CLIENT_ID_LOCAL,
          client_secret: CLIENT_SECRET,
          code,
          state,
          redirect_url: REDIRECT_LOCAL,
        }
        : {
        client_id: CLIENT_ID_NETLIFY,
        client_secret: CLIENT_SECRET,
        code,
        state,
        redirect_url: REDIRECT_NETLIFY,
      };
      var res = $axios.get(TOKEN_URL, data);
      console.log(`dbg res`, res);
    } catch(e) {
      console.error(`login.mounted() ERROR`, e.message);
    }})();
    console.log("login.mounted", {code, state});
  },
  components: {
  },
}
</script>
<style>
</style>
