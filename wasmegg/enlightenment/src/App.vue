<template>
  <the-nav-bar active-entry-id="enlightenment" />

  <div class="max-w-5xl w-full px-4 pb-4 xl:px-0 mx-auto">
    <h1 class="mx-4 mt-4 mb-2 text-center text-lg leading-6 font-medium text-gray-900">
      Enlightenment companion
    </h1>

    <the-player-id-form :player-id="playerId" @submit="submitPlayerId" />

    <!-- Use a key to recreate on data loading -->
    <base-error-boundary v-if="playerId" :key="`${playerId}:${refreshId}`">
      <suspense>
        <template #default>
          <the-companion :player-id="playerId" />
        </template>
        <template #fallback>
          <base-loading />
        </template>
      </suspense>
    </base-error-boundary>

    <template v-else>
      <div class="text-sm mt-4">
        This tool pulls the latest save for the specified player, and generates a report with
        information useful for completing the enlightenment diamond trophy, e.g. hab space, internal
        hatchery rate, equipped artifacts, projected completion date, etc.
      </div>

      <div class="text-sm mt-2">
        If you are not yet sure about feasibility of the trophy, or earning enough cash for the
        required WD level appears to be very difficult,
        <a
          href="https://docs.google.com/spreadsheets/d/157K4r3Z5wfCNKhUWb34mlxM08DEA1AWamsA20xjQIhw/edit?usp=sharing"
          target="_blank"
          class="text-blue-500 hover:text-blue-600"
          >Sami#2336's detailed spreadsheet</a
        >
        may help with your decision and execution.
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
import TheCompanion from '@/components/TheCompanion.vue';
import TheCalculatorWrapper from '@/components/TheCalculatorWrapper.vue';

export default defineComponent({
  components: {
    TheNavBar,
    BaseErrorBoundary,
    BaseLoading,
    ThePlayerIdForm,
    TheCompanion,
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
