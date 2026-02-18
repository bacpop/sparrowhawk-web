<template>
  <div v-if="hasAlignmentData" ref="treeContainer" class="w-full" style="min-height: 400px;"></div>
</template>

<script lang="ts">
import {defineComponent, ref, onMounted, onBeforeUnmount, watch, computed} from "vue";
import {useState} from "vuex-composition-helpers";
// Phylocanvas.gl is loaded via a script tag in index.html to avoid webpack 4 compatibility issues.
// The global `phylocanvas` object is declared in shims-vue.d.ts.

export default defineComponent({
  name: "ResultsDisplayAlignment",

  props: {
    msg: {
      type: String,
      default: ''
    }
  },

  setup() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {allResults_ska} = useState(["allResults_ska"]) as any;
    const treeContainer = ref<HTMLDivElement | null>(null);
    let treeInstance: InstanceType<typeof phylocanvas.PhylocanvasGL> | null = null;

    const hasAlignmentData = computed(() => {
      return allResults_ska.value.alignResults[0]?.aligned === true ||
             allResults_ska.value.alignResults[0]?.aligned === false;
    });

    function destroyTree() {
      if (treeInstance) {
        treeInstance.destroy();
        treeInstance = null;
      }
    }

    function createTree() {
      const nwk = allResults_ska.value.alignResults[0]?.newick;
      const names = allResults_ska.value.alignResults[0]?.names;
      const container = treeContainer.value;

      destroyTree();

      if (!container) return;

      // Clear any previous content
      container.innerHTML = '';

      if (!nwk || (names?.length ?? 0) <= 2) {
        if ((names?.length ?? 0) > 0 && (names?.length ?? 0) <= 2) {
          container.textContent = 'Not enough alignments to visualise a tree';
        }
        return;
      }

      treeInstance = new phylocanvas.PhylocanvasGL(
        container,
        {
          size: { width: container.clientWidth || window.innerWidth, height: 400 },
          source: nwk,
          type: phylocanvas.TreeTypes.Rectangular,
          interactive: true,
          showLabels: true,
          showLeafLabels: true,
          alignLabels: true,
          padding: 16,
        }
      );
    }

    onMounted(() => {
      const names = allResults_ska.value.alignResults[0]?.names;
      if ((names?.length ?? 0) > 2) {
        // Wait a tick so the container element is sized
        setTimeout(createTree, 0);
      }
    });

    onBeforeUnmount(() => {
      destroyTree();
    });

    watch(
      () => allResults_ska.value.alignResults,
      () => {
        const aligned = allResults_ska.value.alignResults[0]?.aligned;
        if (aligned === false) {
          destroyTree();
          if (treeContainer.value) treeContainer.value.innerHTML = '';
          return;
        }
        setTimeout(createTree, 0);
      },
      { deep: true }
    );

    return {
      allResults_ska,
      treeContainer,
      hasAlignmentData,
    };
  },
});
</script>

<style scoped>
div {
  min-height: 400px;
}
</style>
