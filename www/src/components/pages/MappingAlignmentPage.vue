<template>
  <div class="flex flex-row">
    <div class="w-1/3">
      <h1 class="text-2xl font-medium mb-4 flex items-center gap-2">
        <Map v-if="tabName === 'Mapping'" class="w-6 h-6" />
        <Spline v-else-if="tabName === 'Alignment'" class="w-6 h-6" />
        {{ tabName }}
      </h1>

      <MappingHelpCollapsible v-if="tabName === 'Mapping'" />
      <AlignmentHelpCollapsible v-else-if="tabName === 'Alignment'" />

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
                         :disabled="isProcessingAny"
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
                         :disabled="isProcessingAny"
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
      <!-- Mapping tab -->
      <div v-if="tabName=='Mapping'">

        <!-- Reference upload/indexing -->
        <div v-if="!refProcessed && !isIndexingRef"
             v-bind='getRootPropsRef()'
             :class="[
               'p-6 mx-6 bg-white border border-gray-200 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600',
               'cursor-pointer hover:border-gray-400'
             ]">
          <input v-bind='getInputPropsRef()'/>
          <FileUp/>
          <p v-if='isDragActiveRef'>
            Drop files here ...
          </p>
          <p v-else>
            Drop or click to upload your <b>reference fasta file</b>
          </p>
        </div>

        <div v-else-if="isIndexingRef" class="p-6 mx-6 bg-amber-50 border border-amber-400 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600">
          <Loader2 class="w-6 h-6 text-amber-500 animate-spin"/>
          <p class="text-sm text-gray-500">Indexing reference genome...</p>
        </div>

        <div v-else class="p-6 mx-6 bg-green-50 border border-green-400 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600">
          <Check class="w-6 h-6 text-green-500"/>
          <p class="text-green-700">Reference indexed: <span class="font-mono">{{ refName }}</span></p>
        </div>

        <!-- Query mapping -->
        <div v-if="refProcessed && !isMapping"
             v-bind='getRootPropsQueryMap()'
             :class="[
               'p-6 mx-6 mt-4 bg-white border border-gray-200 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600',
               'cursor-pointer hover:border-gray-400'
             ]">
          <input v-bind='getInputPropsQueryMap()'/>
          <FileUp/>
          <p v-if='isDragActiveQueryMap'>
            Drop files here ...
          </p>
          <p v-else>
            Drop or click to upload <b>files to be mapped</b>
          </p>
        </div>

        <div v-else-if="refProcessed && isMapping" class="p-6 mx-6 mt-4 bg-amber-50 border border-amber-400 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600">
          <Loader2 class="w-6 h-6 text-amber-500 animate-spin"/>
          <p class="text-sm text-gray-500">Mapping files to reference...</p>
        </div>

        <p v-if="refProcessed" class="mx-6 mt-4 text-sm text-gray-500">
          Files mapped: {{ Object.keys(allResults_ska.mapResults).length }}
        </p>

        <!-- Reset button -->
        <Button v-if="refProcessed" @click="resetAll" class="mx-6 mt-4" variant="outline" size="sm">
          Reset and start over
        </Button>

        <slot name="mapping"/>
      </div>

      <!-- Alignment tab -->
      <div v-else-if="tabName=='Alignment'">
        <div v-if="!isAligning && !hasAlignmentResults"
             v-bind='getRootPropsQueryAlign()'
             :class="[
               'p-6 mx-6 bg-white border border-gray-200 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600',
               'cursor-pointer hover:border-gray-400'
             ]">
          <input v-bind='getInputPropsQueryAlign()'/>
          <FileUp/>
          <p v-if='isDragActiveQueryAlign'>
            Drop files here ...
          </p>
          <p v-else>
            Drop or click to upload <b>files to be aligned</b>
          </p>
        </div>

        <div v-else-if="isAligning" class="p-6 mx-6 bg-amber-50 border border-amber-400 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600">
          <Loader2 class="w-6 h-6 text-amber-500 animate-spin"/>
          <p class="text-sm text-gray-500">Aligning sequences...</p>
        </div>

        <div v-else-if="hasAlignmentResults" class="p-6 mx-6 bg-green-50 border border-green-400 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600">
          <Check class="w-6 h-6 text-green-500"/>
          <p class="text-green-700">Alignment complete!</p>
        </div>

        <p v-if="hasAlignmentResults" class="mx-6 mt-4 text-sm text-gray-500">
          Files aligned: {{ allResults_ska.alignResults[0] ? allResults_ska.alignResults[0].names.length : 0 }}
        </p>

        <!-- Reset button -->
        <Button v-if="hasAlignmentResults" @click="resetAll" class="mx-6 mt-4" variant="outline" size="sm">
          Reset and upload new files
        </Button>

        <slot name="alignment"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import { useDropzone } from "vue3-dropzone";
import { useActions, useState } from "vuex-composition-helpers";
import { useStore } from "vuex";
import VueSlider from 'vue-3-slider-component';
import { Check, FileUp, Loader2, Info, Map, Spline } from "lucide-vue-next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import MappingHelpCollapsible from "@/components/help/MappingHelpCollapsible.vue";
import AlignmentHelpCollapsible from "@/components/help/AlignmentHelpCollapsible.vue";

export default defineComponent({
  name: "MappingAlignmentPage",
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
    Check,
    Info,
    Map,
    Spline,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Button,
    MappingHelpCollapsible,
    AlignmentHelpCollapsible
  },
  setup() {
    const store = useStore();
    const k: Ref<number> = ref(31);
    const proportion_reads: Ref<number> = ref(1);

    const {
      processRef,
      processQueryMap,
      processQueryAlign,
      resetAllResults_ska
    } = useActions(["processRef", "processQueryMap", "processQueryAlign", "resetAllResults_ska"]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { allResults_ska } = useState(["allResults_ska"]) as any;

    function onDropRef(acceptFiles: File[]): void {
      processRef({ acceptFiles: acceptFiles, k: k.value });
    }

    function onDropQueryMap(acceptFiles: File[]): void {
      processQueryMap({ acceptFiles: acceptFiles, proportion_reads: proportion_reads.value });
    }

    function onDropQueryAlign(acceptFiles: File[]): void {
      processQueryAlign({ acceptFiles: acceptFiles, k: k.value, proportion_reads: proportion_reads.value });
    }

    function resetAll(): void {
      resetAllResults_ska();
    }

    const {
      getRootProps: getRootPropsRef,
      getInputProps: getInputPropsRef,
      isDragActive: isDragActiveRef,
      ...restRef
    } = useDropzone({
      onDrop: onDropRef,
      accept: [".fa", ".fasta"],
      multiple: false
    });
    const {
      getRootProps: getRootPropsQueryMap,
      getInputProps: getInputPropsQueryMap,
      isDragActive: isDragActiveQueryMap,
      ...restQueryMap
    } = useDropzone({
      onDrop: onDropQueryMap,
      accept: [".fa", ".fasta", ".gz", ".fastq", ".fq"]
    });
    const {
      getRootProps: getRootPropsQueryAlign,
      getInputProps: getInputPropsQueryAlign,
      isDragActive: isDragActiveQueryAlign,
      ...restQueryAlign
    } = useDropzone({
      onDrop: onDropQueryAlign,
      accept: [".fa", ".fasta", ".gz", ".fastq", ".fq"]
    });

    return {
      store,
      k,
      proportion_reads,
      resetAll,
      getRootPropsRef,
      getInputPropsRef,
      isDragActiveRef,
      getRootPropsQueryMap,
      getInputPropsQueryMap,
      isDragActiveQueryMap,
      getRootPropsQueryAlign,
      getInputPropsQueryAlign,
      isDragActiveQueryAlign,
      onDropRef,
      onDropQueryMap,
      onDropQueryAlign,
      allResults_ska,
      ...restRef,
      ...restQueryMap,
      ...restQueryAlign
    };
  },
  computed: {
    refProcessed(): boolean {
      return this.store.getters.refProcessed;
    },
    refName(): string {
      return this.store.getters.refName;
    },
    isIndexingRef(): boolean {
      return this.store.getters.isIndexingRef;
    },
    isMapping(): boolean {
      return this.store.getters.isMapping;
    },
    isAligning(): boolean {
      return this.store.getters.isAligning;
    },
    isProcessingAny(): boolean {
      return this.store.getters.isIndexingRef || this.store.getters.isMapping || this.store.getters.isAligning;
    },
    hasAlignmentResults(): boolean {
      return this.allResults_ska.alignResults[0] && this.allResults_ska.alignResults[0].aligned;
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
