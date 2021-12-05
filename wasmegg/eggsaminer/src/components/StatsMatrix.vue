<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <div class="flex flex-col">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table class="min-w divide-y divide-gray-200 tabular-nums">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="px-2 py-2 whitespace-pre text-sm font-medium text-gray-500"
                >
                  {{ titleHeader?.text || 'Name' }}
                </th>
                <th
                  v-for="(header, idx) in dataHeaders"
                  :key="`header-${idx}`"
                  scope="col"
                  class="px-2 py-2 whitespace-pre text-sm font-medium text-gray-500"
                >
                  {{ header.text }}
                </th>
              </tr>
            </thead>
            <tbody>

              <tr
                v-for="row in rows"
                :key="row.id"
                v-tippy="{ content: row.tip }"
                class="bg-white"
              >
                <td
                  class="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-600"
                >
                  {{ row.title }}
                </td>
                <td v-if="row.val !== undefined"
                  >
                  <input
                    :value="row.val"
                    @input="$emit('update-rowval', { row, val: $event.target?.value, ev: $event })"
                    type="number"
                    class="w-28 text-right"
                    >
                </td>
                <td
                  v-for="(cell, idx) in row.cells"
                  :key="`cell-${idx}`"
                  :class="cell.class"
                  class="px-8 py-1 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  {{ cell.val }}
                </td>
                <td class="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">&nbsp;</td>
                <td class="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">&nbsp;</td>
                <td class="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">&nbsp;</td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// import _ from "lodash";
import { defineComponent, PropType } from 'vue';

type Header = {
  text: string;
};

type Cell = {
  val:    string;
  style?: object;
  class?: string[];
}

type Row = {
  title: number;
  cells: Cell[];
};

type Input = {

}

export default defineComponent({
  props: {
    titleHeader: {
      type: Object as PropType<Header>,
      required: false,
    },
    dataHeaders: {
      type: Array as PropType<Header[]>,
      required: true,
    },
    rows: {
      type: Array as PropType<Row[]>,
      required: true,
    },
  },
});
</script>
