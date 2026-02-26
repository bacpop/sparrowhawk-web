<template>
  <div class="flex flex-row">
    <div class="w-1/3">
      <h1 class="text-2xl font-medium mb-4 flex items-center gap-2">
        <Funnel class="w-6 h-6" />
        Host depletion
      </h1>

      <HostDepletionHelpCollapsible />

      <TooltipProvider>
        <div class="flex flex-col gap-4">

          <div class="flex flex-row items-center w-full gap-2">
            <input id="deplete" type="checkbox" v-model="deplete" :disabled="isFilteringDeacon"/>
            <Tooltip>
              <TooltipTrigger as-child>
                <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-xs">When enabled, reads matching the host index are removed. When disabled, matching reads are kept instead.</p>
              </TooltipContent>
            </Tooltip>
            <label for="deplete">
              Deplete mode
            </label>
          </div>

          <div>
            <p class="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p class="max-w-xs">Minimum number of matching k-mers required to classify a read as host-derived. Must be a positive integer.</p>
                </TooltipContent>
              </Tooltip>
              Absolute threshold
            </p>
            <div class="flex flex-row items-center w-full gap-2">
              <VueSlider class="flex-grow"
                         v-model="abs_threshold"
                         :lazy="true"
                         :min="1"
                         :max="50"
                         :interval="1"
                         :disabled="isFilteringDeacon"
              />
              <span class="block w-[40px] text-center border border-gray-300 rounded-md text-sm">
                {{ abs_threshold }}
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
                  <p class="max-w-xs">Minimum proportion of k-mers matching the host index required to classify a read as host-derived. A value between 0 and 1.</p>
                </TooltipContent>
              </Tooltip>
              Relative threshold
            </p>
            <div class="flex flex-row items-center w-full gap-2">
              <VueSlider class="flex-grow"
                         v-model="rel_threshold"
                         :lazy="true"
                         :min="0"
                         :max="1"
                         :interval="0.01"
                         :disabled="isFilteringDeacon"
              />
              <span class="block w-[40px] text-center border border-gray-300 rounded-md text-sm">
                {{ rel_threshold }}
              </span>
            </div>
          </div>

        </div>
      </TooltipProvider>
    </div>

    <div class="w-2/3 pt-12">
      <div v-if="tabName === 'HostDepletion'">

        <!-- Phase 1: Index upload -->
        <div v-if="!deaconIndexLoaded && !isLoadingDeaconIndex"
             v-bind="getRootPropsIndex()"
             :class="[
               'p-6 mx-6 bg-white border border-gray-200 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600',
               'cursor-pointer hover:border-gray-400'
             ]">
          <input v-bind="getInputPropsIndex()" />
          <FileUp />
          <p v-if="isDragActiveIndex">Drop file here ...</p>
          <p v-else>Drop or click to upload your <b>Deacon index file (.idx)</b></p>
        </div>

        <div v-else-if="isLoadingDeaconIndex"
             class="p-6 mx-6 bg-amber-50 border border-amber-400 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600">
          <Loader2 class="w-6 h-6 text-amber-500 animate-spin" />
          <p class="text-sm text-gray-500">Loading index...</p>
        </div>

        <div v-else-if="deaconIndexLoaded"
             class="flex items-center gap-2 py-2 px-3 mx-6 bg-gray-50 rounded-md mb-4">
          <Check class="w-4 h-4 text-green-500" />
          <span class="flex-grow text-sm font-mono truncate">{{ allResults_deacon.indexFileName }}</span>
          <span v-if="allResults_deacon.indexInfo" class="text-xs text-gray-400 ml-2">{{ allResults_deacon.indexInfo }}</span>
        </div>

        <!-- Phase 2: Reads upload (only when index is loaded) -->
        <template v-if="deaconIndexLoaded && !isLoadingDeaconIndex">

          <div v-if="!isFilteringDeacon && !deaconFiltered"
               v-bind="getRootPropsReads()"
               :class="[
                 'p-6 mx-6 bg-white border border-gray-200 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600',
                 'cursor-pointer hover:border-gray-400'
               ]">
            <input v-bind="getInputPropsReads()" />
            <FileUp />
            <p v-if="isDragActiveReads">Drop file here ...</p>
            <p v-else>Drop or click to upload your <b>reads file (.fastq)</b></p>
          </div>

          <div v-else-if="isFilteringDeacon"
               class="p-6 mx-6 bg-amber-50 border border-amber-400 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600">
            <Loader2 class="w-6 h-6 text-amber-500 animate-spin" />
            <p class="text-sm text-gray-500">Filtering...</p>
          </div>

          <template v-else-if="deaconFiltered">
            <div class="flex items-center gap-2 py-2 px-3 mx-6 bg-gray-50 rounded-md mb-2">
              <Check class="w-4 h-4 text-green-500" />
              <span class="flex-grow text-sm font-mono truncate">{{ allResults_deacon.readsFileName }}</span>
            </div>
            <div class="mx-6 mt-2 text-sm text-gray-600">
              {{ allResults_deacon.totalReads }} reads processed
            </div>
            <div class="mx-6">
              <DownloadButtonHostDepletion />
            </div>
          </template>

        </template>

        <!-- Reset button -->
        <div v-if="deaconIndexLoaded" class="mx-6 mt-6">
          <Button variant="outline" size="sm" @click="resetAll">Reset</Button>
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
import { Check, FileUp, Loader2, Funnel, Info } from "lucide-vue-next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import VueSlider from 'vue-3-slider-component';
import HostDepletionHelpCollapsible from "@/components/help/HostDepletionHelpCollapsible.vue";
import DownloadButtonHostDepletion from "@/components/DownloadButtonHostDepletion.vue";
import { Button } from "@/components/ui/button";

export default defineComponent({
  name: "HostDepletionPage",
  props: {
    tabName: {
      type: String,
      required: true
    }
  },
  components: {
    Check,
    FileUp,
    Loader2,
    Funnel,
    Info,
    VueSlider,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    HostDepletionHelpCollapsible,
    DownloadButtonHostDepletion,
    Button,
  },
  setup() {
    const store = useStore();

    const deplete: Ref<boolean> = ref(true);
    const abs_threshold: Ref<number> = ref(1);
    const rel_threshold: Ref<number> = ref(0.05);

    const { loadDeaconIndex, filterDeaconReads, resetAllResults_deacon } = useActions([
      "loadDeaconIndex",
      "filterDeaconReads",
      "resetAllResults_deacon",
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { allResults_deacon } = useState(["allResults_deacon"]) as any;

    function resetAll(): void {
      resetAllResults_deacon();
    }

    function onDropIndex(acceptFiles: File[]): void {
      if (acceptFiles.length === 0) return;
      loadDeaconIndex({ file: acceptFiles[0] });
    }

    function onDropReads(acceptFiles: File[]): void {
      if (acceptFiles.length === 0) return;
      filterDeaconReads({
        file: acceptFiles[0],
        deplete: deplete.value,
        abs_threshold: abs_threshold.value,
        rel_threshold: rel_threshold.value,
      });
    }

    const {
      getRootProps: getRootPropsIndex,
      getInputProps: getInputPropsIndex,
      isDragActive: isDragActiveIndex,
    } = useDropzone({
      onDrop: onDropIndex,
      accept: [".idx"],
      multiple: false,
    });

    const {
      getRootProps: getRootPropsReads,
      getInputProps: getInputPropsReads,
      isDragActive: isDragActiveReads,
    } = useDropzone({
      onDrop: onDropReads,
      accept: [".fastq", ".fq", ".fastq.gz", ".fq.gz"],
      multiple: false,
    });

    return {
      deplete,
      abs_threshold,
      rel_threshold,
      allResults_deacon,
      store,
      resetAll,
      getRootPropsIndex,
      getInputPropsIndex,
      isDragActiveIndex,
      getRootPropsReads,
      getInputPropsReads,
      isDragActiveReads,
    };
  },
  computed: {
    deaconIndexLoaded(): boolean {
      return this.store.getters.deaconIndexLoaded;
    },
    isLoadingDeaconIndex(): boolean {
      return this.store.getters.isLoadingDeaconIndex;
    },
    isFilteringDeacon(): boolean {
      return this.store.getters.isFilteringDeacon;
    },
    deaconFiltered(): boolean {
      return this.store.getters.deaconFiltered;
    },
  },
});
</script>

<style scoped>
</style>
