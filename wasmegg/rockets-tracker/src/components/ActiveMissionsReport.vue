<template>
  <template v-if="missions.length > 0">
    <ul
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 mx-4 xl:mx-0 my-4"
      :class="[missions.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3']"
    >
      <li
        v-for="(mission, index) in missions"
        :key="index"
        class="col-span-1 flex flex-col text-center bg-gray-50 rounded-2xl shadow-lg divide-y divide-gray-200"
      >
        <div class="flex-1 flex flex-col p-6">
          <div
            class="w-36 h-36 flex-shrink-0 mx-auto relative"
            :class="missionDurationTypeFgClass(mission)"
          >
            <img
              class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
              :src="iconURL(mission.shipIconPath, 256)"
            />
            <progress-ring
              v-if="mission.durationSeconds && mission.returnTimestamp"
              :radius="72"
              :stroke-width="2"
              :duration-seconds="mission.durationSeconds"
              :deadline="mission.returnTimestamp"
            />
            <progress-ring-empty v-else :radius="72" :stroke-width="2" />
          </div>
          <h3 class="mt-4 text-gray-900 text-sm font-medium">{{ mission.shipName }}</h3>
          <div class="mt-1 flex-grow flex flex-col">
            <div>
              <span
                class="px-2 py-1 text-white text-xs font-medium rounded-full"
                :class="missionDurationTypeBgClass(mission)"
              >
                {{ mission.durationTypeName }}
              </span>
            </div>
            <div class="mt-2 text-gray-500 text-xs">Capacity: {{ mission.capacity }}</div>
            <div class="mt-1 text-gray-500 text-xs">
              Duration:
              <template v-if="mission.durationSeconds !== null">
                {{ mission.durationDisplay }}
              </template>
              <template v-else> &ndash; </template>
            </div>
            <div class="mt-1 text-gray-700 text-sm font-medium">{{ mission.statusName }}</div>
            <div
              v-if="mission.returnTimestamp !== null"
              v-tippy="{
                content: mission.hasReturned
                  ? 'Mission has returned.'
                  : `Mission is scheduled to return at ${mission.returnTime?.format('LLL')}.`,
              }"
              class="mt-1 text-gray-700 text-sm font-medium tabular-nums"
            >
              <countdown-timer :deadline="mission.returnTimestamp" />
            </div>
            <div v-else-if="mission.statusIsFueling && mission.fuels.length > 0" class="mt-1">
              <img
                v-for="fuel in mission.fuels"
                :key="fuel.egg"
                v-tippy="{ content: fuel.amountDisplay }"
                class="inline h-4 w-4 align-text-top"
                :src="iconURL(fuel.eggIconPath, 64)"
              />
            </div>
          </div>
        </div>
      </li>
    </ul>

    <mission-notifications :missions="missions" />
  </template>

  <div v-else class="text-center text-sm">No active mission. You should start one!</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from 'vue';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import { ei, iconURL, Mission } from 'lib';
import { missionDurationTypeFgClass, missionDurationTypeBgClass } from '@/utils';
import CountdownTimer from '@/components/CountdownTimer.vue';
import ProgressRing from '@/components/ProgressRing.vue';
import ProgressRingEmpty from '@/components/ProgressRingEmpty.vue';
import MissionNotifications from '@/components/MissionNotifications.vue';

dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);

export default defineComponent({
  components: {
    CountdownTimer,
    ProgressRing,
    ProgressRingEmpty,
    MissionNotifications,
  },
  props: {
    activeMissions: {
      type: Array as PropType<ei.IMissionInfo[]>,
      required: true,
    },
  },
  setup(props) {
    const { activeMissions } = toRefs(props);
    const missions = computed(() => activeMissions.value.map(m => new Mission(m)));
    return {
      missions,
      missionDurationTypeFgClass,
      missionDurationTypeBgClass,
      iconURL,
    };
  },
});
</script>