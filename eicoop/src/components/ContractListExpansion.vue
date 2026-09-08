<template>
  <table class="my-2" :style="{ width: 'initial' }">
    <thead>
      <tr v-if="named" class="divide-x divide-gray-200 dark:divide-gray-600">
        <th
          v-for="tier in tiers"
          :key="tier.name"
          :colspan="2"
          class="px-3 py-2 whitespace-nowrap text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        >
          {{ tier.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
        <template v-for="(goal, tierIndex) in row" :key="tierIndex">
          <td
            class="pl-3 pr-2 py-1 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-200 tabular-nums"
            :style="{ minWidth: '4rem' }"
          >
            {{ goal ? formatEIValue(goal.targetAmount!, { trim: true }) : '' }}
          </td>
          <td
            class="pl-2 pr-3 py-1 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-200 tabular-nums"
            :class="
              tierIndex < tiers.length - 1
                ? 'border-r border-gray-200 dark:border-gray-600'
                : null
            "
            :style="{ minWidth: '6rem' }"
          >
            <span v-if="goal" class="flex items-center space-x-1">
              <base-icon
                v-tippy="{ content: rewardName(goal) }"
                :icon-rel-path="rewardIconPath(goal)"
                :size="64"
                class="h-5 w-5"
              />
              <span class="text-sm text-gray-500 dark:text-gray-200">
                {{ rewardAmountDisplay(goal) }}
              </span>
            </span>
          </td>
        </template>
      </tr>

      <tr>
        <td
          :colspan="tiers.length * 2"
          class="px-3 py-2 whitespace-nowrap text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        >
          Required rate
        </td>
      </tr>

      <tr class="divide-x divide-gray-200 dark:divide-gray-600">
        <td
          v-for="(rate, tierIndex) in requiredHourlyRates"
          :key="tierIndex"
          :colspan="2"
          class="px-3 py-1 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-200 tabular-nums"
        >
          {{ formatEIValue(rate) }}/hr
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from 'vue';

import { rewardAmountDisplay, rewardIconPath, rewardName } from 'lib';
import { Contract, contractTiers, ei, formatEIValue } from '@/lib';
import BaseIcon from 'ui/components/BaseIcon.vue';

export default defineComponent({
  components: {
    BaseIcon,
  },
  props: {
    contract: {
      type: Object as PropType<Contract>,
      required: true,
    },
  },
  setup(props) {
    type Goal = ei.Contract.IGoal;

    const { contract } = toRefs(props);

    const tiers = computed(() => contractTiers(contract.value));
    const named = computed(() => tiers.value.some(tier => tier.name));
    // One row per goal, one cell per tier. Tiers have always agreed on how many
    // goals they offer, but a short tier would leave holes rather than misalign
    // the rest of the column.
    const rows = computed<(Goal | undefined)[][]>(() => {
      const height = Math.max(...tiers.value.map(tier => tier.goals.length));
      return Array.from({ length: height }, (_, i) => tiers.value.map(tier => tier.goals[i]));
    });
    const requiredHourlyRates = computed(() =>
      tiers.value.map(tier => {
        const finalGoal = tier.goals[tier.goals.length - 1];
        return finalGoal ? finalGoal.targetAmount! / (tier.durationSeconds / 3600) : 0;
      })
    );

    return {
      tiers,
      named,
      rows,
      requiredHourlyRates,
      formatEIValue,
      rewardIconPath,
      rewardName,
      rewardAmountDisplay,
    };
  },
});
</script>
