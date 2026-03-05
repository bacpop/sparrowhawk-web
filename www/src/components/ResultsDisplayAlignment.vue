<template>
  <div v-if="hasAlignmentData">
    <p v-if="tooFewSamples" class="text-sm text-gray-500 px-2">
      Not enough alignments to visualise a tree
    </p>
    <div v-else ref="treeContainer" style="width:100%; height:550px;"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import { useState } from 'vuex-composition-helpers';
import * as ReactDOM from 'react-dom/client';
import * as React from 'react';
import Taxonium from 'taxonium-component';

export default defineComponent({
  name: 'ResultsDisplayAlignment',

  props: {
    msg: {
      type: String,
      default: ''
    }
  },

  setup() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { allResults_ska } = useState(['allResults_ska']) as any;
    const treeContainer = ref<HTMLDivElement | null>(null);
    let reactRoot: ReturnType<typeof ReactDOM.createRoot> | null = null;

    const alignment = computed(() => allResults_ska.value.alignResults[0]);
    const newick    = computed(() => alignment.value?.newick ?? '');
    const names     = computed(() => alignment.value?.names  ?? []);

    const hasAlignmentData = computed(() =>
      alignment.value?.aligned === true || alignment.value?.aligned === false
    );
    const tooFewSamples = computed(() =>
      !newick.value || names.value.length <= 2
    );

    const sourceData = computed(() =>
      newick.value
        ? { status: 'loaded', filename: 'alignment.nwk', filetype: 'nwk', data: newick.value }
        : null
    );

    function mountOrUpdate() {
      if (!treeContainer.value || !sourceData.value) return;
      const el = React.createElement(Taxonium as React.ElementType, { sourceData: sourceData.value });
      if (!reactRoot) {
        reactRoot = ReactDOM.createRoot(treeContainer.value);
      }
      reactRoot.render(el);
    }

    function unmountReact() {
      if (reactRoot) { reactRoot.unmount(); reactRoot = null; }
    }

    onMounted(() => { setTimeout(mountOrUpdate, 0); });

    onBeforeUnmount(unmountReact);

    watch(newick, () => {
      if (tooFewSamples.value) { unmountReact(); return; }
      setTimeout(mountOrUpdate, 0);
    });

    return {
      allResults_ska,
      treeContainer,
      hasAlignmentData,
      tooFewSamples,
    };
  },
});
</script>
