<template>
  <div class="flex flex-row">
    <div class="w-1/3">
      <h1 class="text-2xl font-medium mb-4 flex items-center gap-2">
        <ScanFace class="w-6 h-6" />
        Taxonomic ID
      </h1>

      <TaxonomicIDHelpCollapsible />

      <TooltipProvider>
        <div class="flex flex-col gap-4">
          <div>
            <p class="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p class="max-w-xs">Controls the size of the subsequences (k-mers) used to process the reads. Maximum value is 63 for this mode.</p>
                </TooltipContent>
              </Tooltip>
              k
            </p>
            <div class="flex flex-row items-center w-full gap-2">
              <VueSlider class="flex-grow"
                         v-model="k"
                         :lazy="true"
                         :min="5"
                         :max="63"
                         :interval="2"
                         :disabled="isIdentifying"
              />
              <span class="block w-[40px] text-center border border-gray-300 rounded-md text-sm">
                {{ k }}
              </span>
            </div>
          </div>

          <div>
            <p class="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p class="max-w-xs">A real number between 0 and 1 that controls what proportion of reads to use for processing.</p>
                </TooltipContent>
              </Tooltip>
              Proportion of reads
            </p>
            <div class="flex flex-row items-center w-full gap-2">
              <VueSlider class="flex-grow"
                         v-model="proportion_reads"
                         :lazy="true"
                         :min="0"
                         :max="1"
                         :interval="0.05"
                         :disabled="isIdentifying"
              />
              <span class="block w-[40px] text-center border border-gray-300 rounded-md text-sm">
                {{ proportion_reads }}
              </span>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>

    <div class="w-2/3 pt-12">
      <div v-if="tabName=='TaxonomicID'">

        <!-- Upload or Loading state -->
        <div v-if="!sampleIdentified && !isIdentifying"
             v-bind='getRootPropsSample()'
             :class="[
               'p-6 mx-6 bg-white border border-gray-200 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600',
               'cursor-pointer hover:border-gray-400'
             ]">
          <input v-bind='getInputPropsSample()' />
          <FileUp/>
          <p v-if='isDragActiveSample'>
            Drop files here ...
          </p>
          <p v-else>
            Drop or click to upload your <b>sample fastq/a file(s)</b>
          </p>
        </div>

        <div v-else-if="isIdentifying" class="p-6 mx-6 bg-amber-50 border border-amber-400 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600">
          <Loader2 class="w-6 h-6 text-amber-500 animate-spin"/>
          <p class="text-sm text-gray-500">Identifying sample... (fetching database and processing)</p>
        </div>

        <div v-if="sampleIdentified" class="mt-4">
          <Button @click="resetAll" class="mx-6" variant="outline" size="sm">
            Reset
          </Button>
        </div>

        <div v-if="sampleIdentified" class="mx-6 mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-semibold text-gray-700 mb-3">Top Matches:</h3>
          <p class="text-sm text-gray-600 mt-1">{{ getResultLine(0) }}</p>
          <p class="text-sm text-gray-600 mt-1">{{ getResultLine(1) }}</p>
          <p class="text-sm text-gray-600 mt-1">{{ getResultLine(2) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import { useStore } from "vuex";
import { useDropzone } from "vue3-dropzone";
import { useActions, useState } from "vuex-composition-helpers";
import VueSlider from 'vue-3-slider-component';
import { FileUp, Loader2, Info, ScanFace } from "lucide-vue-next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import TaxonomicIDHelpCollapsible from "@/components/help/TaxonomicIDHelpCollapsible.vue";

export default defineComponent({
  name: "TaxonomicIDPage",
  props: {
    tabName: {
      type: String,
      required: true
    }
  },
  components: {
    VueSlider,
    FileUp,
    Loader2,
    Info,
    ScanFace,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Button,
    TaxonomicIDHelpCollapsible
  },
  setup() {
    const store = useStore();
    const k: Ref<number> = ref(31);
    const proportion_reads: Ref<number> = ref(1);

    const { identifyFiles, resetAllResults_sketchlib } = useActions(["identifyFiles", "resetAllResults_sketchlib"]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { allResults_sketchlib } = useState(["allResults_sketchlib"]) as any;

    function onDropSample(acceptFiles: File[]): void {
      identifyFiles({ acceptFiles: acceptFiles, k: k.value, proportion_reads: proportion_reads.value });
    }
    function resetAll(): void {
      resetAllResults_sketchlib();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function getResultLine(this: any, idres: number): string {
      if (this.allResults_sketchlib.idSpecies == null) {
        return "";
      } else {
        return this.allResults_sketchlib.idSpecies[idres] + " : " + (this.allResults_sketchlib.idProbs[idres] * 100).toFixed() + " % - " + this.allResults_sketchlib.idMetadata[idres];
      }
    }
    const {
      getRootProps: getRootPropsSample,
      getInputProps: getInputPropsSample,
      isDragActive: isDragActiveSample,
      ...restSample
    } = useDropzone({
      onDrop: onDropSample,
      accept: [".fa", ".fasta", ".gz", ".fastq", ".fq"],
      multiple: true
    });

    return {
      k,
      proportion_reads,
      resetAll,
      getRootPropsSample,
      getInputPropsSample,
      isDragActiveSample,
      onDropSample,
      getResultLine,
      allResults_sketchlib,
      store,
      ...restSample,
    };
  },
  computed: {
    sampleIdentified(): boolean {
      return this.store.getters.sampleIdentified;
    },
    results(): number | null {
      return this.allResults_sketchlib.idProbs ? this.allResults_sketchlib.idProbs[0] : null;
    },
    isIdentifying(): boolean {
      return this.store.getters.isIdentifying;
    }
  },

  methods: {
    clear(): void {
      this.resetAll();
    }
  },
});
</script>

<style scoped>
</style>
