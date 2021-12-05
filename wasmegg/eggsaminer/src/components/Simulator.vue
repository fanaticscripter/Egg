<template>
  <epic-research-widget
    :scenario-a="scenarioA"
    :scenario-b="scenarioB"
    @update-list-by-id="onUpdateListByID"
  />
</template>

<script lang="ts">
  import _ from "lodash";
import { defineComponent, PropType } from 'vue';
//
import { Backup } from 'lib'
import EpicResearchWidget from '@/components/EpicResearchWidget.vue';

export default defineComponent({
  components: {
    EpicResearchWidget,
  },

  props: {
    backup: {
      type: Object as PropType<Backup>,
      required: true,
    },
  },

  // This async component does not respond to playerId changes.
  /* eslint-disable vue/no-setup-props-destructure */
  setup({ backup }) {
    return {
      scenarioB: backup,
    };
  },

  data() {
    const scenarioA = _.cloneDeep(this.backup)

    return { scenarioA }
  },

  methods: {
    onUpdateListByID({ path, id, updates }) {
      const list = _.get(this, path)
      console.warn('onUpdateListByID', path, id, updates, list)
      const idx = list.findIndex(({ id:elID }) => (elID === id))
      list[idx] = _.merge({}, list[idx], updates)
    },
  },
});

</script>
