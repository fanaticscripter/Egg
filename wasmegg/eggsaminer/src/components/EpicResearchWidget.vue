<template>

  <collapsible-section
    section-title="Epic Research"
    :visible="isVisibleSection('epic_research')"
    class="my-2 text-sm"
    @toggle="toggleSectionVisibility('epic_research')"
    >
    <stats-matrix
      :title-header="titleHeader"
      :rows="rows"
      :data-headers="dataHeaders"
      :inputs="inputs"
      class="my-2"
      @update-rowval="$emit('update-epic-research', $event)"
      />
    <p>Note that amount paid may not reflect discounts or any changes to the game</p>
  </collapsible-section>

  <!-- <collapsible-section -->
  <!--   section-title="Raw Data" -->
  <!--   :visible="isVisibleSection('raw_data')" -->
  <!--   class="my-2 text-sm" -->
  <!--   @toggle="toggleSectionVisibility('raw_data')" -->
  <!--   > -->
  <!--   {{ researches }} -->
  <!-- </collapsible-section> -->
</template>

<script lang="ts">

import _ from "lodash";
import { useSectionVisibility } from 'ui/composables/section_visibility';
import { defineComponent, PropType, toRefs } from 'vue';
import CollapsibleSection from '@/components/CollapsibleSection.vue';
import researchesData from '@/researches.json';
import { ScenarioValue } from '@/lib'

import StatsMatrix from '@/components/StatsMatrix.vue';

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

export default defineComponent({
  components: {
    CollapsibleSection,
    StatsMatrix,
  },

  props: {
    epicResearch: {
      type: Object as PropType<ScenarioValue[]>,
      required: true,
    },
  },

  setup(props) {
    const { epicResearch } = toRefs(props);
    const { isVisibleSection, toggleSectionVisibility } = useSectionVisibility(false);

    const dataHeaders = _.map([
      'Level', 'Actual', 'Max Levels', 'Effect', 'Stacks?', 'Next Price', 'Paid', 'Remaining', 'Action',
    ], (text) => ({ text }))

    return {
      // rows:        epicResearchRows,
      inputs:      epicResearch,
      titleHeader: { text: 'Name' },
      dataHeaders,
      researches,
      //
      isVisibleSection,
      toggleSectionVisibility,
    };
  },

  computed: {
    rows() {
      return _.map(this.epicResearch, ({ id, val, actual }) => {

        const info = researches[id]
        if (! info) { return { title: _.startCase(id), values: [val, actual, id, '(Problem understanding this research)'] } }
        const {
          name:title, levels, categories, description, effect_type, per_level, levels_compound, prices,
          // serial_id, type, id,
        } = info

        const level = val

        const paidPriceTot = sum(prices.slice(0, level))
        const leftPriceTot = sum(prices.slice(level))

        // const paidPrice = (paidPriceTot > 0)  ? { val: paidPriceTot, class: ['text-right']  } : { val: '0', class: [quietClass] }
        // const nextPrice = (level < levels)    ? { val: prices[level], class: ['text-right'] } : { val: '--', class: [quietClass] }
        // const leftPrice = (leftPricesTot > 0) ? { val: leftPriceTot, class: ['text-right']  } : { val: '(done)', class: [quietClass] }
        const nextPrice = numOrQuiet(prices[level], '--',   level < levels)
        const paidPrice = numOrQuiet(paidPriceTot,  '0',    paidPriceTot > 0)
        const leftPrice = numOrQuiet(leftPriceTot,  'done', leftPriceTot > 0)

        const symbol = effectSymbols[effect_type] || effect_type
        const effect = `${symbol} ${per_level}`

        const stacks = isStacking(levels_compound)

        const action = categories ? _.startCase(categories) : epicResearchActions[id]

        const cells = [
          { val: actual,  class: ['text-center'] },
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
        return { id, title, cells, tip: description, info }
      });
    },
},

});
</script>
