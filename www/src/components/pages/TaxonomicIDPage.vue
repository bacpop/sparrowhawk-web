<template>
  <div class="flex flex-row">
    <div class="w-[350px] shrink-0">
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

          <div>
            <p class="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p class="max-w-xs">Number of parallel workers used to process samples simultaneously. Higher values speed up processing of multiple files but use more memory.</p>
                </TooltipContent>
              </Tooltip>
              Workers
            </p>
            <div class="flex flex-row items-center w-full gap-2">
              <VueSlider class="flex-grow"
                         v-model="numWorkers"
                         :lazy="true"
                         :min="1"
                         :max="8"
                         :interval="1"
                         :disabled="isIdentifying"
                         @change="onNumWorkersChange"
              />
              <span class="block w-[40px] text-center border border-gray-300 rounded-md text-sm">
                {{ numWorkers }}
              </span>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>

    <div class="min-w-0 flex-1 pt-12">
      <div v-if="tabName=='TaxonomicID'">

        <!-- Upload dropbox - always visible when not identifying -->
        <div v-if="!isIdentifying"
             v-bind='getRootPropsSample()'
             :class="[
               'p-6 mx-6 mr-0 bg-white border border-gray-200 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600',
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

        <div v-else class="p-6 mx-6 bg-amber-50 border border-amber-400 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600">
          <Loader2 class="w-6 h-6 text-amber-500 animate-spin"/>
          <p class="text-sm text-gray-500">
            Identifying {{ identifyingFilesArray.length }} sample(s)...
          </p>
          <div v-if="identifyingFilesArray.length > 0" class="text-xs text-gray-400 mt-1">
            Processing: {{ identifyingFilesArray.join(', ') }}
          </div>
        </div>

        <!-- Show uploaded files with per-file status -->
        <div v-if="uploadedFileNames.length > 0" class="mx-6 mr-0 mt-4">
          <div v-for="fileName in uploadedFileNames" :key="fileName"
               class="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md mb-2">
            <Check v-if="isFileIdentified(fileName)" class="w-4 h-4 text-green-500"/>
            <Loader2 v-else-if="isFileIdentifying(fileName)" class="w-4 h-4 text-amber-500 animate-spin"/>
            <span class="flex-grow text-sm font-mono truncate">
              {{ fileName }}
            </span>
          </div>
        </div>

        <!-- Show results as a single table with expandable rows per sample -->
        <div v-if="sampleIdentified" class="mx-6 mr-0 mt-4">
          <DataTable :columns="tableColumns" :data="tableData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from "vue";
import { useStore } from "vuex";
import { useDropzone } from "vue3-dropzone";
import { useActions, useState } from "vuex-composition-helpers";
import VueSlider from 'vue-3-slider-component';
import { Check, FileUp, Loader2, Info, ScanFace } from "lucide-vue-next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import TaxonomicIDHelpCollapsible from "@/components/help/TaxonomicIDHelpCollapsible.vue";
import DataTable from "@/components/pages/taxonomic-id/DataTable.vue";
import { columns, TaxonomicIDRow } from "@/components/pages/taxonomic-id/columns";
import { SampleIdentifyResult } from "@/types";

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
    Check,
    FileUp,
    Loader2,
    Info,
    ScanFace,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    TaxonomicIDHelpCollapsible,
    DataTable
  },
  setup() {
    const store = useStore();
    const k: Ref<number> = ref(31);
    const proportion_reads: Ref<number> = ref(1);
    const uploadedFileNames: Ref<string[]> = ref([]);

    const { identifyFiles, resetAllResults_sketchlib, initSketchlibWorkers } = useActions(["identifyFiles", "resetAllResults_sketchlib", "initSketchlibWorkers"]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { allResults_sketchlib } = useState(["allResults_sketchlib"]) as any;

    const numWorkers: Ref<number> = ref(4);

    function onNumWorkersChange(value: number): void {
      initSketchlibWorkers(value);
    }

    function onDropSample(acceptFiles: File[]): void {
      uploadedFileNames.value = acceptFiles.map(f => f.name);
      identifyFiles({ acceptFiles: acceptFiles, k: k.value, proportion_reads: proportion_reads.value });
    }
    function resetAll(): void {
      uploadedFileNames.value = [];
      resetAllResults_sketchlib();
    }

    // Get sample name from file name (same logic as action)
    //todo: need more testing
    function getSampleNameFromFile(fileName: string): string {
      if (/(_1|_2)(.fastq.gz|.fq.gz)$/.test(fileName)) {
        return fileName.replace(/(_1.fastq.gz|_1.fq.gz|_2.fastq.gz|_2.fq.gz)$/, '');
      }
      return fileName.replace(/(.fasta|.fasta.gz|.fa|.fa.gz|.fq|.fq.gz|.fastq|.fastq.gz)$/, '');
    }

    const tableColumns = columns;

    const tableData = computed<TaxonomicIDRow[]>(() => {
      const results = allResults_sketchlib.value.results as Record<string, SampleIdentifyResult>;
      const topLevelRows: TaxonomicIDRow[] = [];
      for (const [sampleName, sampleResult] of Object.entries(results || {})) {
        if (!sampleResult?.idSpecies?.length) continue;

        const allRows: TaxonomicIDRow[] = sampleResult.idSpecies.map((species, i) => {
          const parts = (sampleResult.idMetadata[i] ?? '').split('|');
          return {
            sample: sampleName,
            rank: i + 1,
            species,
            probability: sampleResult.idProbs[i],
            metaSpecies: parts[0]?.trim() ?? '',
            metaGemsparcl: parts[1]?.trim() ?? '',
            metaGtdb: parts[2]?.trim() ?? '',
          };
        });

        topLevelRows.push({
          ...allRows[0],
          subRows: allRows.length > 1 ? allRows.slice(1) : undefined,
        });
      }
      return topLevelRows;
    });

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
      numWorkers,
      onNumWorkersChange,
      uploadedFileNames,
      resetAll,
      getRootPropsSample,
      getInputPropsSample,
      isDragActiveSample,
      onDropSample,
      getSampleNameFromFile,
      tableColumns,
      tableData,
      allResults_sketchlib,
      store,
      ...restSample,
    };
  },
  computed: {
    sampleIdentified(): boolean {
      return this.store.getters.sampleIdentified;
    },
    isIdentifying(): boolean {
      return this.store.getters.isIdentifying;
    },
    identifyingFilesSet(): Set<string> {
      return this.store.getters.isIdentifyingFiles;
    },
    identifyingFilesArray(): string[] {
      return Array.from(this.identifyingFilesSet);
    }
  },

  methods: {
    clear(): void {
      this.resetAll();
    },
    isFileIdentified(fileName: string): boolean {
      const sampleName = this.getSampleNameFromFile(fileName);
      return sampleName in (this.allResults_sketchlib.results || {});
    },
    isFileIdentifying(fileName: string): boolean {
      const sampleName = this.getSampleNameFromFile(fileName);
      return this.identifyingFilesSet.has(sampleName);
    }
  },
});
</script>

<style scoped>
</style>
