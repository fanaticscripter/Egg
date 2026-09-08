<template>
  <span
    v-if="label"
    class="px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
    :class="colorClass"
  >
    {{ label }}
  </span>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from 'vue';

import { ContractGrade, ContractLeague, ei, gradeName } from '@/lib';

// Grades run from easiest to hardest, so the badge warms up as it climbs.
const gradeColorClasses: Record<number, string> = {
  [ei.Contract.PlayerGrade.GRADE_C]: 'bg-gray-500',
  [ei.Contract.PlayerGrade.GRADE_B]: 'bg-green-600',
  [ei.Contract.PlayerGrade.GRADE_A]: 'bg-blue-600',
  [ei.Contract.PlayerGrade.GRADE_AA]: 'bg-purple-600',
  [ei.Contract.PlayerGrade.GRADE_AAA]: 'bg-red-600',
};

export default defineComponent({
  props: {
    league: {
      type: Number as PropType<ContractLeague | null>,
      default: null,
    },
    grade: {
      type: Number as PropType<ContractGrade | null>,
      default: null,
    },
  },
  setup(props) {
    const { league, grade } = toRefs(props);
    const label = computed(() => {
      if (grade.value) {
        return gradeName(grade.value);
      }
      if (league.value === null) {
        return '';
      }
      return league.value === ContractLeague.Elite ? 'Elite' : 'Standard';
    });
    const colorClass = computed(() => {
      if (grade.value) {
        return gradeColorClasses[grade.value] ?? 'bg-gray-500';
      }
      return league.value === ContractLeague.Elite ? 'bg-purple-600' : 'bg-blue-600';
    });
    return { label, colorClass };
  },
});
</script>
