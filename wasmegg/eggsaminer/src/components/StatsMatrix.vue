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
                  {{ titleHeader?.text }}
                </th>
                <th
                  v-for="header in dataHeaders"
                  scope="col"
                  class="px-2 py-2 whitespace-pre text-sm font-medium text-gray-500"
                >
                  {{ header.text }}
                </th>
              </tr>
            </thead>
            <tbody>

              <tr
                class="bg-white"
                :key="row.id"
                v-for="row in rows"
                v-tippy="{ content: row.tip }"
              >
                <td
                  class="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-600"
                >
                  {{ row.title }}
                </td>
                <td v-if="inputs?.[row.id]"
                  >
                  <input
                    :value="inputs[row.id].val"
                    @input="$emit('update-rowval', { row, val: $event.target?.value, ev: $event })"
                    type="number"
                    class="w-28 text-right"
                    >
                </td>
                <td
                  v-for="cell in row.cells"
                  class="px-8 py-1 whitespace-nowrap text-sm font-medium text-gray-900"
                  :class="cell.class"
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
  import _ from "lodash";
import { defineComponent, PropType, toRefs } from 'vue';

type Header = {
  text: string;
};

type Cell = {
  val:    string;
  style?: object;
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
      required: true,
    },
    dataHeaders: {
      type: Array as PropType<Header[]>,
      required: true,
    },
    rows: {
      type: Array as PropType<Row[]>,
      required: true,
    },
    inputs: {
      type: Object as PropType<any>,
      required: false,
    },
  },

  setup(props) {
    const { titleHeader, dataHeaders, rows, inputs } = toRefs(props);

    return {
      titleHeader,
      dataHeaders,
      rows,
      inputs,
    };
  },
});
</script>
