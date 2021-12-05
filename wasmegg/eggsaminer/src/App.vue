<template>
  <the-nav-bar active-entry-id="eggsaminer" />

  <div class="max-w-5xl w-full px-4 pb-4 xl:px-0 mx-auto">
    <h1 class="mx-4 mt-4 mb-2 text-center text-lg leading-6 font-medium text-gray-900">
      Stats Eggsaminer
    </h1>

    <the-player-id-form :player-id="playerId" @submit="submitPlayerId" />

    <!-- Use a key to recreate on data loading -->
    <base-error-boundary v-if="playerId" :key="`${playerId}:${refreshId}`">
      <suspense>
        <template #default>
          <eggsaminer :player-id="playerId" />
        </template>
        <template #fallback>
          <base-loading />
        </template>
      </suspense>
    </base-error-boundary>

    <template v-else>
      <div class="text-sm mt-4">
        Examine and modify your earnings under various scenarios
      </div>
    </template>

    <div class="text-sm mt-4 bg-gray-200 px-5 py-10 text-center">
  This tool is based on the Egg project by @mk2
  (<a href="https://github.com/fanaticscripter/Egg">Github link</a>),
  but is not maintained by them. You may find their other tools at
  <a href="https://wasmegg.netlify.app/">wasmegg.netlify.app</a>).
    </div>
  </div>

  <the-calculator-wrapper />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import { getSavedPlayerID, savePlayerID } from 'lib';
import TheNavBar from 'ui/components/NavBar.vue';
import ThePlayerIdForm from 'ui/components/PlayerIdForm.vue';
import BaseErrorBoundary from 'ui/components/BaseErrorBoundary.vue';
import BaseLoading from 'ui/components/BaseLoading.vue';
import Eggsaminer from '@/components/Eggsaminer.vue';
import TheCalculatorWrapper from '@/components/TheCalculatorWrapper.vue';

export default defineComponent({
  components: {
    TheNavBar,
    BaseErrorBoundary,
    BaseLoading,
    ThePlayerIdForm,
    Eggsaminer,
    TheCalculatorWrapper,
  },
  setup() {
    const playerId = ref(
      new URLSearchParams(window.location.search).get('playerId') || getSavedPlayerID() || ''
    );
    const refreshId = ref(Date.now());
    const submitPlayerId = (id: string) => {
      playerId.value = id;
      refreshId.value = Date.now();
      savePlayerID(id);
    };
    return {
      playerId,
      refreshId,
      submitPlayerId,
    };
  },
});
</script>
