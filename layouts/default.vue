<template>
  <v-app>
    <v-app-bar dark fixed app>
      <div class="d-flex align-center">
        <v-img
          src="/leaf.png"
          alt="Crop-Log logo"
          class="shrink mr-2"
          contain
          transition="scale-transition"
          width="40"
        />
        Oya-Tag
      </div>

      <v-spacer />
      <div class="calendar" :title="new Date().toLocaleDateString()">
        {{ new Date().getDate() }}
      </div>
      <v-spacer />

      {{ $route.path }}
      <v-menu bottom right>
        <template v-slot:activator="{ on }">
          <v-btn dark icon v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            v-for="(item, i) in menu"
            :key="i"
            :disabled="itemDisabled(item)"
            @click="onMenu(item)"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-content>
        <v-container>
          <nuxt />
          <EditAsset v-if="curAsset" />
        </v-container>
    </v-content>
  </v-app>
</template>

<script>
import EditAsset from '../components/edit-asset';

export default {
  name: 'App',
  components: {
    EditAsset
  },
  data () {
    return {
      menu: [{
        title: 'Home',
        route: '/'
      }, {
        title: 'Timelines',
        route: '/timelines'
      }, {
        title: 'Assets',
        route: '/assets'
      }],
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js'
    }
  },
  computed: {
    curAsset() {
      return this.$store.state.selection;
    },
  },
  mounted () {
    this.$store.commit('assets/load');
  },
  methods: {
    onMenu (item) {
      this.$router.push(item.route)
    },
    itemDisabled (item) {
      return this.$route.path === item.route
    }
  }

}
</script>
<style>
.calendar {
  margin-top: 5pt;
  width: 40px;
  height: 50px;
  background-image: url("/calendar.png");
  background-repeat: no-repeat;
  background-size:40px;
  text-align: center;
  padding-top: 15px;
}
</style>
