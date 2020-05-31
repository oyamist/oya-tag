<template>
  <!--
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="fixed = !fixed"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-navigation-drawer
      v-model="rightDrawer"
      :right="right"
      temporary
      fixed
    >
      <v-list>
        <v-list-item @click.native="right = !right">
          <v-list-item-action>
            <v-icon light>
              mdi-repeat
            </v-icon>
          </v-list-item-action>
          <v-list-item-title>Switch drawer (click me)</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-footer
      :fixed="fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
  -->
  <v-app>
    <v-app-bar app color="green darken-4" flat dark>
      <div class="d-flex align-center">
        <v-img
          src="/leaf.png"
          alt="Crop-Log logo"
          class="shrink mr-2"
          contain
          transition="scale-transition"
          width="40"
        />
        Oya-Plan
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

    <v-container>
      <nuxt />
      <!--
      <router-view />
      <EditAsset v-if="g.selection.items.length" :g="g" />
      -->
    </v-container>
  </v-app>
</template>

<script>
// import EditAsset from './components/edit-asset';
import AppGlobal from '../src/app-global'
const g = AppGlobal.g()

export default {
  name: 'App',
  components: {
    //EditAsset
  },
  data () {
    return {
      g,
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
  },
  mounted () {
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
