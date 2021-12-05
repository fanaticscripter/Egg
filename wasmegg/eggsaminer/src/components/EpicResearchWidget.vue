<template>

  <collapsible-section
    section-title="Epic Research"
    :visible="isVisibleSection('epic_research')"
    class="my-2 text-sm"
    @toggle="toggleSectionVisibility('epic_research')"
    >
    <stats-matrix
      :rows="rows"
      :data-headers="dataHeaders"
      class="my-2"
      @update-rowval="updateLevel"
      />
    <p>Note that amount paid may not reflect discounts or any changes to the game</p>
  </collapsible-section>

  <!-- <collapsible-section section-title="Raw Data" :visible="isVisibleSection('raw_data')" class="my-2 text-sm" @toggle="toggleSectionVisibility('raw_data')"> -->
  <!--   {{ scenarioA.game.epicResearch }} -->
  <!-- </collapsible-section> -->
</template>

<script lang="ts">

import _ from "lodash";
import { useSectionVisibility } from 'ui/composables/section_visibility';
import { defineComponent, PropType } from 'vue'; // toRefs
import CollapsibleSection from '@/components/CollapsibleSection.vue';
//
import researchesData from '@/researches.json';
import StatsMatrix from '@/components/StatsMatrix.vue';

export default defineComponent({
  components: {
    CollapsibleSection,
    StatsMatrix,
  },

  props: {
    scenarioA: {
      type: Object as PropType<Backup>,
      required: true,
    },
    scenarioB: {
      type: Object as PropType<Backup>,
      required: true,
    },
  },

  emits: ['update-list-by-id'],

  setup() {
    const { isVisibleSection, toggleSectionVisibility } = useSectionVisibility(false);

    const dataHeaders = _.map([
      'Level A', 'Level B', 'Max Levels', 'Effect', 'Stacks?', 'Next Price', 'Paid', 'Remaining', 'Action',
    ], (text) => ({ text }))

    return {
      // titleHeader: { text: 'Name' },
      dataHeaders,
      isVisibleSection,
      toggleSectionVisibility,
    };
  },

  computed: {
    rows() {
      const { epicResearch } = this.scenarioA.game
      console.warn('regenerating EpicResearchWidget', epicResearch)
      return _.compact(_.map(epicResearch, ({ id, level }) => {

        const alt = 1 // this.scenarioB.game.epicResearch[id].level

        const info = researches[id]
        if (! info) { return { title: _.startCase(id), values: [level, alt, id, '(Problem understanding this research)'] } }
        const {
          name:title, levels, categories, description, effect_type, per_level, levels_compound, prices,
          // serial_id, type, id,
        } = info

        const paidPriceTot = sum(prices.slice(0, level))
        const leftPriceTot = sum(prices.slice(level))

        const nextPrice = numOrQuiet(prices[level], '--',   level < levels)
        const paidPrice = numOrQuiet(paidPriceTot,  '0',    paidPriceTot > 0)
        const leftPrice = numOrQuiet(leftPriceTot,  'done', leftPriceTot > 0)

        const symbol = effectSymbols[effect_type] || effect_type
        const effect = `${symbol} ${per_level}`

        const stacks = isStacking(levels_compound)

        const action = categories ? _.startCase(categories) : epicResearchActions[id]

        const cells = [
          { val: level },
          { val: alt,     class: ['text-center'] },
          { val: levels,  class: ['text-center'] },
          { val: effect },
          { val: stacks },
          nextPrice,
          paidPrice,
          leftPrice,
          { val: action },
          // { val: id },
          // { val: sum(prices) },
          // { val: description },
          // { val: prices },
        ]

        return { id, val: level, title, cells, tip: description, info }
      }));
    },
  },

  methods: {
    updateLevel({ row, val }) {
      const max = row.info.levels
      const level = _.clamp(val, 0, max)
      console.warn('updateLevel', row, max, level)
      // epicResearch[idx] = { ...research, level }
      // updateByID(this.scenarioA.game.epicResearch, row.id, { level })
      this.$emit('update-list-by-id', { path: 'scenarioA.game.epicResearch', id: row.id, updates: { level } })
    },
  },

});

const researches = _.mapKeys(researchesData, 'id')

const epicResearchActions = {
  hold_to_hatch:           	"Hold to Hatch Rate",
  epic_hatchery:           	"Hatchery Refill Rate",
  epic_internal_incubators:	"Internal Hatchery Rate",
  video_doubler_time:      	"Duration of Video 2x Bonus",
  epic_clucking:           	"Running Chicken Bonus",
  epic_multiplier:         	"Running Chicken Bonus",
  cheaper_contractors:     	"Housing Cost Reduction",
  bust_unions:             	"Vehicle Cost Reduction",
  cheaper_research:        	"Research Cost Reduction",
  silo_capacity:           	"Silo Away Time",
  int_hatch_sharing:       	"Internal Hatchery Sharing",
  int_hatch_calm:          	"Internal Hatchery Rate",
  accounting_tricks:       	"Farm Valuation",
  soul_eggs:               	"Soul Egg Bonus",
  prestige_bonus:          	"Prestige Reward",
  drone_rewards:           	"Drone Rewards",
  epic_egg_laying:         	"Egg Laying Rate",
  transportation_lobbyist: 	"Shipping Capacity",
  prophecy_bonus:          	"Prophecy Egg Bonus",
  hold_to_research:        	"Hold to Research Rate",
  afx_mission_time:        	"FTL Mission Time",
  afx_mission_capacity:    	"Mission Capacity",
};

const effectSymbols = { additive: '+', multiplicative: '×' }

const isStackingStrs = { additive: 'N', multiplicative: 'Y' }

function sum(arr) { return _.reduce(arr, (tot, val) => (tot + val)) }

function isStacking(val) {
  return isStackingStrs[val] || val
}

const quietClass = 'text-gray-400'

function numOrQuiet(val, replacement, test) {
  if (test) {
    return { val, class: ['text-right'] }
  }
  return { val: replacement, class: quietClass }
}

</script>
