<template>
<main>
  <p>{{ nickname }}</p>
  <p class="text-sm">
    Last synced to server:
    <span v-tippy="{ content: lastRefreshed.format('LLL') }" class="whitespace-nowrap">
      {{ lastRefreshedRelative }}
    </span>
  </p>
  <p>
    <span
      v-tippy="{
               content: `
               <p>The game, while active, saves to Egg, Inc.&rsquo;s server every couple of minutes if network condition allows.
                 Other than soon after a fresh launch of the game, such server syncs are unpredictable from the user&rsquo;s point of view.
                 <span class='text-blue-300'>You can force close then reopen the app to reasonably reliably trigger a sync</span>
                 (search for &ldquo;iOS force close app&rdquo; or &ldquo;Android force close app&rdquo; if you need help).</p>

      <p>However, even after an app-initiated sync, it may take an unpredicatible amount of time
        (usually within a minute or so) for the game&rsquo;s server to serve the updated save through its API,
        which is then picked up by this tool. There is no solution other than clicking &ldquo;Load Player Data&rdquo;
        periodically until the fresh save shows up. Please do not refresh too fast, which is not helpful.</p>`,
      allowHTML: true,
      }"
      class="inline-flex items-center space-x-1"
      >
      <base-info />
      <span class="text-xs text-gray-500">Why is my save out of date?</span>
    </span>
  </p>

  <hr />

  <simulator
    :backup="backup"
  />

</main>
</template>

<script lang="ts">
// import _ from "lodash";
import { defineComponent, onBeforeUnmount, ref } from 'vue';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { iconURL, UserBackupEmptyError } from 'lib';
import {
  requestFirstContact,
} from 'lib/api';
import { useSectionVisibility } from 'ui/composables/section_visibility';
//
import BaseInfo           from 'ui/components/BaseInfo.vue';
import Simulator          from '@/components/Simulator.vue';

// Note that timezone abbreviation may not work due to
// https://github.com/iamkun/dayjs/issues/1154, in which case the GMT offset is
// shown.
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);

export default defineComponent({
  components: {
    BaseInfo,
    Simulator,
  },

  props: {
    playerId: {
      type: String,
      required: true,
    },
  },

  // This async component does not respond to playerId changes.
  /* eslint-disable vue/no-setup-props-destructure */
  async setup({ playerId }) {
    // Validate and sanitize player ID.
    if (!playerId.match(/^EI\d+$/i)) {
      throw new Error(
        `ID ${playerId} is not in the form EI1234567890123456; please consult "Where do I find my ID?"`
      );
    }
    playerId = playerId.toUpperCase();

    // Interval id used for refreshing lastRefreshedRelative.
    let refreshIntervalId: number | undefined;
    onBeforeUnmount(() => {
      clearInterval(refreshIntervalId);
    });

    const data = await requestFirstContact(playerId);
    if (!data.backup || !data.backup.game) {
      throw new UserBackupEmptyError(playerId);
    }
    const backup = data.backup;
    const nickname = backup.userName;
    const progress = backup.game;
    if (!progress) {
      throw new Error(`${playerId}: no game progress in backup`);
    }
    if (!backup.farms || backup.farms.length === 0) {
      throw new Error(`${playerId}: no farm info in backup`);
    }

    const farm = backup.farms[0]; // Home farm
    const egg = farm.eggType!;
    const lastRefreshedTimestamp = farm.lastStepTime! * 1000;
    const lastRefreshed = dayjs(Math.min(lastRefreshedTimestamp, Date.now()));
    // const currentTimestamp = ref(Date.now());
    const lastRefreshedRelative = ref(lastRefreshed.fromNow());

    const { isVisibleSection, toggleSectionVisibility } = useSectionVisibility();

    return {
      backup,
      nickname,
      lastRefreshed,
      lastRefreshedTimestamp,
      lastRefreshedRelative,
      egg,
      //
      isVisibleSection,
      toggleSectionVisibility,
      iconURL,
    };
  },
});
</script>
