<template>
  <epic-research-widget
    :epicResearch="epicResearch"
    v-on:update-epic-research="onUpdateEpicResearch"
  />
</template>

<script lang="ts">
import _ from "lodash";
import { defineComponent } from 'vue';
import { useSectionVisibility } from 'ui/composables/section_visibility';
import CollapsibleSection from '@/components/CollapsibleSection.vue';
//
import EpicResearchWidget from '@/components/EpicResearchWidget.vue';

export default defineComponent({
  components: {
    CollapsibleSection,
    EpicResearchWidget,
  },

  props: {
    backup: {
      type: Object as any,
      required: true,
    },
  },

  data(props) {
    const { actualEpicResearch:rawER, backup } = this

    const actualEpicResearch = _.filter(rawER, ({ id }) => (! /^(epic_silo_quality|warp_shift)$/.test(id)))
    const epicResearch = _.fromPairs(_.map(actualEpicResearch, ({ id, level }) => (
      [id, { id, val: level, actual: level }]
    )))

    return { epicResearch }
  },

  methods: {

    onUpdateEpicResearch({ row, val }) {
      const max = row.info.levels
      console.log('epicResearchUpdate', row, val, this.epicResearch[row.id])
      this.epicResearch[row.id] = { ...this.epicResearch[row.id], val: _.clamp(val, 0, max) }
      console.log('epicResearchUpdate2', row, val, this.epicResearch[row.id], this.epicResearch[row.id].val)
    },

  },

  // This async component does not respond to playerId changes.
  /* eslint-disable vue/no-setup-props-destructure */
  setup({ backup }) {
    const { isVisibleSection, toggleSectionVisibility } = useSectionVisibility();

    const { epicResearch, currentMultiplier, boosts, soulEggsD, unclaimedSoulEggsD } = backup.game;

    const homeFarm = backup.farms[0]

    console.log('simdata', homeFarm, currentMultiplier, soulEggsD, unclaimedSoulEggsD)

    return {
      //
      actualEpicResearch: epicResearch,
      homeFarm,
      //
      isVisibleSection,
      toggleSectionVisibility,
    };
  },
});
</script>
