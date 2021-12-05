<template>
  <the-nav-bar active-entry-id="eggsaminer" />

  <div class="max-w-5xl w-full px-4 pb-4 xl:px-0 mx-auto">
    <h1 class="mx-4 mt-4 mb-2 text-center text-lg leading-6 font-medium text-gray-900">
      Stats Examiner
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
