<template>
  <the-nav-bar />
  <div class="flex flex-col flex-1">
    <router-view />
  </div>
  <the-footer />
  <the-coop-selector />
  <the-notification-tray />
</template>

<script lang="ts">
import { computed, defineComponent, provide } from 'vue';
import { useStore } from 'vuex';

import { devmodeKey } from './symbols';
import { key } from '@/store';
import TheNavBar from '@/components/TheNavBar.vue';
import TheFooter from '@/components/TheFooter.vue';
import TheCoopSelector from '@/components/TheCoopSelector.vue';
import TheNotificationTray from '@/components/TheNotificationTray.vue';

export default defineComponent({
  name: 'App',
  components: {
    TheNavBar,
    TheFooter,
    TheCoopSelector,
    TheNotificationTray,
  },
  setup() {
    const store = useStore(key);
    const devmode = computed(() => store.state.devmode.on);
    provide(devmodeKey, devmode);
  },
});
</script>
