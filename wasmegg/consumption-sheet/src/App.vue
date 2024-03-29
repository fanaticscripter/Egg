<template>
  <the-nav-bar active-entry-id="consumption-sheet" width-classes="max-w-10xl px-4" />

  <div class="flex-1 max-w-10xl w-full mx-auto px-4">
    <h1 class="mx-4 mt-4 mb-2 text-center text-lg leading-6 font-medium text-gray-900">
      Consumption sheet
    </h1>

    <div class="text-center text-gray-700 text-xs my-2">Last updated Oct 8, 2021, ~15:00 UTC</div>

    <section id="index" class="mt-4 mb-6 hide-in-screenshot-mode">
      <h2 class="my-2">Index</h2>

      <p>
        <a href="#consumption" class="text-sm text-gray-700 hover:text-gray-500 underline"
          >What do I get from consuming ...?</a
        >
      </p>
      <div
        class="my-2 grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 3xl:grid-cols-8"
      >
        <a
          v-for="family in data.families"
          :key="family.id"
          :href="`#${family.id}`"
          class="text-xs text-gray-500 hover:text-gray-400 underline"
          :class="family.type"
        >
          {{ family.name }}
        </a>
      </div>

      <p>
        <a href="#sources" class="text-sm text-gray-700 hover:text-gray-500 underline"
          >Consuming which items yields ... stone?</a
        >
      </p>
      <div
        class="my-2 grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 3xl:grid-cols-8"
      >
        <template v-for="family in data.families" :key="family.id">
          <a
            v-if="family.type === 'Stone'"
            :href="`#${family.id}-sources`"
            class="text-xs text-gray-500 hover:text-gray-400 underline"
            :class="family.type"
          >
            {{ family.name }}
          </a>
        </template>
      </div>
    </section>

    <section id="consumption" class="mt-4 mb-6">
      <h2 class="my-2">What do I get from consuming ...?</h2>

      <div class="text-xs text-gray-500 space-y-1">
        <p>
          The following dataset contains the expected outcomes from consuming each item (different
          rarities are condisered distinct) thousands to tens of thousands of times. Note that due
          to the limited sample size and nontransparency of the server black box that determines
          consumption outcomes, certain expectation values may be highly inaccurate, and certain
          byproducts may have been missed altogether.
        </p>
        <p>
          For stone-yielding artifacts,
          <span class="text-lime-500"
            >the f.c. stat is the expected gold yield (subject to sampling limitations) from
            <span class="underline">fully consuming</span> the item, i.e., further consuming the
            resulting stones and fragments down to golden eggs.</span
          >
          For uncommon artifacts,
          <span class="text-teal-500"
            >the dm. stat is the gold yield from <span class="underline">demoting</span> the item to
            common</span
          >.
        </p>
        <p>
          Currently,
          <span class="text-red-500">consumption outcomes for uncommon items are missing</span> due
          to hardening of Egg, Inc. server. Data for some commonly-consumed rare items might be
          re-introduced in the future.
        </p>
        <p>
          Also,
          <span class="text-red-500"
            >consumption outcomes may be updated by the developer at any time</span
          >
          (not tied to app updates). Each resampling is very time-consuming. This data sheet
          represents the author's best effort to keep up.
        </p>
      </div>

      <div
        class="my-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
      >
        <div
          v-for="family in data.families"
          :id="family.id"
          :key="family.id"
          class="-mx-4 sm:mx-0 bg-gray-50 overflow-hidden sm:rounded-lg sm:shadow-md ScrollTarget"
          :class="family.type"
        >
          <div class="bg-gray-100 px-6 py-3 border-b border-gray-200">
            <div class="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
              <a href="#index">
                <div class="ml-4 mt-2">{{ family.name }}</div>
              </a>
              <div class="ml-4 mt-2 flex-shrink-0"></div>
            </div>
          </div>

          <ul class="py-2" :class="family.type === 'Artifact' ? 'divide-y' : 'space-y-2'">
            <li
              v-for="tier in family.tiers"
              :key="tier.id"
              class="px-4"
              :class="family.type === 'Artifact' ? 'py-2' : null"
            >
              <div :id="tier.id" class="flex space-x-2 ScrollTarget">
                <div v-tippy="{ content: tier.name }" class="flex-shrink-0">
                  <img class="h-10 w-10" :src="iconURL(`egginc/${tier.icon_filename}`, 128)" />
                </div>

                <ul v-if="family.type === 'Artifact'" class="space-y-1">
                  <li v-for="rarity in tier.rarities" :key="rarity.item.afx_rarity">
                    <consumption-outcome :outcome="rarity" :is-artifact="true" />
                  </li>
                </ul>

                <div v-else class="flex items-center">
                  <consumption-outcome :outcome="tier.rarities[0]" :is-artifact="false" />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <hr />

    <section id="sources" class="mt-4 mb-6">
      <h2 class="my-4">Consuming which items yields ... stone?</h2>

      <div class="text-xs text-gray-500 space-y-1">
        <p>
          This section is the reverse of the previous section, showing a compilation of all items
          that could yield an individual stone (fragment) upon consumption, along with the expected
          yields, subject to the same limitations in accuracy. Item rarities are color coded:
          <span class="inline-block relative top-0.5 h-3 w-3 rounded bg-common"></span> for common,
          <span class="inline-block relative top-0.5 h-3 w-3 rounded bg-rare"></span> for rare,
          <span class="inline-block relative top-0.5 h-3 w-3 rounded bg-epic"></span> for epic, and
          <span class="inline-block relative top-0.5 h-3 w-3 rounded bg-legendary"></span> for
          legendary.
        </p>
      </div>

      <div
        class="my-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
      >
        <template v-for="family in data.families" :key="family.id">
          <div
            v-if="family.type === 'Stone'"
            :id="`${family.id}-sources`"
            class="-mx-4 sm:mx-0 bg-gray-50 overflow-hidden sm:rounded-lg sm:shadow-md ScrollTarget"
          >
            <div class="bg-gray-100 px-6 py-3 border-b border-gray-200">
              <div class="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
                <a href="#index">
                  <div class="ml-4 mt-2">{{ family.name }}</div>
                </a>
                <div class="ml-4 mt-2 flex-shrink-0"></div>
              </div>
            </div>

            <ul class="py-2 divide-y">
              <li v-for="tier in family.tiers" :key="tier.id" class="px-4 py-2">
                <div :id="`${tier.id}-sources`" class="flex space-x-2 ScrollTarget">
                  <div v-tippy="{ content: tier.name }" class="flex-shrink-0">
                    <img class="h-10 w-10" :src="iconURL(`egginc/${tier.icon_filename}`, 128)" />
                  </div>

                  <sources :sources="tier.sources" />
                </div>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { iconURL } from 'lib';
import data from './data.json';
import TheNavBar from 'ui/components/NavBar.vue';
import ConsumptionOutcome from '@/components/ConsumptionOutcome.vue';
import Sources from '@/components/Sources.vue';

export default defineComponent({
  components: {
    TheNavBar,
    ConsumptionOutcome,
    Sources,
  },
  setup() {
    return {
      data,
      iconURL,
    };
  },
});
</script>

<style scoped>
.Artifact + .Stone,
.Stone + .Ingredient {
  grid-column-start: 1;
}

.ScrollTarget {
  scroll-margin-top: 5rem;
}
</style>
