<template>
  <TooltipProvider>
    <div v-if="queryProcessed && hasReadyData" class="mt-6 ml-6 border-t border-t-gray-200 pt-6">
      <div id="band" class="flex items-center gap-4 h-[30px]">
        <div v-if="zoom>8" class="flex items-center gap-1">
          <input type="checkbox" id="skip" v-model="skip"/>
          <label for="skip">Skip unmapped sequences</label>
        </div>
        <Tooltip v-if="zoom>8">
          <TooltipTrigger as-child>
            <Button variant="outline" size="sm" class="cursor-help">Legend</Button>
          </TooltipTrigger>
          <TooltipContent class="max-w-sm">
            <div class="text-sm text-left">
              <div class="flex items-center gap-2 mb-1">
                <b class="text-red-500 w-12">A</b>
                <span>Difference between the reference and the mapped sequence</span>
              </div>
              <div class="flex items-center gap-2 mb-1">
                <b class="w-12">-</b>
                <span>Similarity between the reference and the mapped sequence</span>
              </div>
              <div class="flex items-center gap-2 mb-1">
                <span class="w-12 text-xs">Blank</span>
                <span>Unmapped nucleotide</span>
              </div>
              <div class="flex items-center gap-2">
                <b class="w-12">.......</b>
                <span>Skipped unmapped fraction of the sequence</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
        <Tooltip v-else>
          <TooltipTrigger as-child>
            <Button variant="outline" size="sm" class="cursor-help">Legend</Button>
          </TooltipTrigger>
          <TooltipContent class="max-w-sm">
            <div class="text-sm text-left">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-3 h-3 bg-red-500"></div>
                <span>Part of the sequence different to the reference</span>
              </div>
              <div class="flex items-center gap-2 mb-1">
                <div class="w-3 h-3 bg-black"></div>
                <span>Part of the sequence similar to the reference</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-white border border-gray-300"></div>
                <span>Part of the sequence not mapped</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    <div id="Slider">
      <VueSlider
          v-model="zoom"
          :lazy="true"
          :min="3"
          :max="20"
          :interval="0.1"
          :tooltip="'none'"
          style="margin: 5px 0;"
      >
      </VueSlider>
    </div>
    <div id="MainView">
      <div v-if="zoom>8" id="FullViewer">
        <SequenceViewer
            :zoom_level="zoom"
            :no_skip="!skip"
            :key="use_keys([zoom, skip, reloadKey])"> <!-- Reactivity on zoom and skip changes and reload -->
        </SequenceViewer>
      </div>
      <div v-else id="MinimisedViewer">
        <MinimisedSequenceViewer
            :zoom_level="zoom"
            :key="use_keys([zoom, skip, reloadKey])"> <!-- Reactivity on zoom and skip changes and reload -->
        </MinimisedSequenceViewer>
      </div>
    </div>
  </div>
  </TooltipProvider>
</template>

<script lang="ts">
import {defineComponent, ref, Ref} from "vue";
import {useStore} from "vuex";
import {useState} from "vuex-composition-helpers";
import SequenceViewer from "./SequenceViewer/SequenceViewer";
import VueSlider from 'vue-3-slider-component';
import MinimisedSequenceViewer from "./MinimisedSequenceViewer/MinimisedSequenceViewer.vue";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";

export default defineComponent({
  name: "ResultsDisplayMapping",
  components: {
    SequenceViewer,
    VueSlider,
    MinimisedSequenceViewer,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Button
  },
  setup() {
    const store = useStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {allResults_ska} = useState(["allResults_ska"]) as any;
    const skip: Ref<boolean> = ref(true);
    const zoom: Ref<number> = ref(10);

    return {
      allResults_ska,
      skip,
      zoom,
      store
    }
  },

  watch: {
    'allResults_ska.mapResults': {
      handler(): void {
        const keys = Object.keys(this.allResults_ska.mapResults);
        const last_key = keys[keys.length - 1];
        if (this.allResults_ska.mapResults[last_key]?.mapped_sequences?.length !== 0) {
          this.reloadKey++;
        } else {
          this.zoom = 10;
        }
      },
      deep: true,
    },
  },

  computed: {
    queryProcessed(): boolean {
      return this.store.getters.queryProcessed;
    },
    hasReadyData(): boolean {
      const keys = Object.keys(this.allResults_ska.mapResults);
      if (keys.length === 0) return false;
      const last_key = keys[keys.length - 1];
      return this.allResults_ska.mapResults[last_key]?.mapped_sequences?.length > 0;
    }
  },

  methods: {
    use_keys(list_of_keys: (string | number | boolean)[]): string {
      return list_of_keys.join('-');
    }
  },

  data() {
    return {
      reloadKey: 0 as number
    }
  },
});
</script>

<style scoped>
</style>
