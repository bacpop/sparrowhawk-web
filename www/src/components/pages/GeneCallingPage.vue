<template>
  <div class="flex flex-row">
    <div class="w-1/3">
      <h1 class="text-2xl font-medium mb-4 flex items-center gap-2">
        <Dna class="w-6 h-6" />
        Gene calling
      </h1>

      <GeneCallingHelpCollapsible />

      <TooltipProvider>
        <div class="flex flex-col gap-4">

          <div>
            <p class="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p class="max-w-xs">Number of parallel workers used to process files simultaneously. Higher values speed up batch processing but use more memory.</p>
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
                         :disabled="callingGenes"
                         @change="onNumWorkersChange"
              />
              <span class="block w-[40px] text-center border border-gray-300 rounded-md text-sm">
                {{ numWorkers }}
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
                  <p class="max-w-xs">You can select a different translation table if you prefer from NCBI ones.</p>
                </TooltipContent>
              </Tooltip>
              Translation table
            </p>
            <div class="flex flex-row items-center w-full gap-2">
              <VueSelect class="flex-grow"
                         v-model="tt"
                         :options="[
                          { label: 'Default/Auto', value: 0},
                          { label: '1. Standard', value: 1},
                          { label: '2. Vertebrate mitochondrial', value: 2},
                          { label: '3. Yeast mitochondrial', value: 3},
                          { label: '4. Mold, protozoan, coelenterate mitochondrial, and mycoplasma/spiroplasma', value: 4},
                          { label: '5. Invertebrate mitochondrial', value: 5},
                          { label: '6. Ciliate, dasycladacean, and hexamita nuclear', value: 6},
                          { label: '9. Echinoderm, and flatworm mitochondrial', value: 9},
                          { label: '10. Euplotid nuclear', value: 10},
                          { label: '11. Bacterial, archaeal, and plant plastid', value: 11},
                          { label: '12. Alternative yeast nuclear', value: 12},
                          { label: '13. Ascidian mitochondrial', value: 13},
                          { label: '14. Alternative flatworm mitochondrial', value: 14},
                          { label: '15. Blepharisma nuclear', value: 15},
                          { label: '16. Chlorophycean mitochondrial', value: 16},
                          { label: '21. Trematode mitochondrial', value: 21},
                          { label: '22. Scenedesmus obliquus mitochondrial', value: 22},
                          { label: '23. Thraustochytrium mitochondrial', value: 23},
                          { label: '24. Rhabdopleuridate mitochondrial', value: 24},
                          { label: '25. Candidate division SR1 and gracilibacteria', value: 25},
                         ]"
                         :isDisabled="callingGenes"
                         :isClearable=false
              />
            </div>
          </div>

          <div class="flex flex-row items-center w-full gap-2">
            <input id="metag" type="checkbox" v-model="metag" :disabled="callingGenes"/>
            <Tooltip>
              <TooltipTrigger as-child>
                <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-xs">Recommended for FASTA files with lots of short sequences, not necessarily related between them.</p>
              </TooltipContent>
            </Tooltip>
            <label for="metag">
              Use metagenomic mode
            </label>
          </div>

          <div class="flex flex-row items-center w-full gap-2">
            <input id="closed_ends" type="checkbox" v-model="closed_ends" :disabled="callingGenes"/>
            <Tooltip>
              <TooltipTrigger as-child>
                <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-xs">Ignores any gene that might have run off the edge of a contig</p>
              </TooltipContent>
            </Tooltip>
            <label for="closed_ends">
              Ignore truncated genes
            </label>
          </div>

          <div class="flex flex-row items-center w-full gap-2">
            <input id="mask" type="checkbox" v-model="mask" :disabled="callingGenes"/>
            <Tooltip>
              <TooltipTrigger as-child>
                <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-xs">When finding a gap, or set of unknown (N) nucleotides, we will not bridge over them to call a gene.</p>
              </TooltipContent>
            </Tooltip>
            <label for="mask">
              Break calling on N subsequences
            </label>
          </div>

          <div class="flex flex-row items-center w-full gap-2">
            <input id="non_sd" type="checkbox" v-model="non_sd" :disabled="callingGenes"/>
            <Tooltip>
              <TooltipTrigger as-child>
                <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-xs">Force the algorithm to not use Shine-Dalgarno sequences for calling genes</p>
              </TooltipContent>
            </Tooltip>
            <label for="non_sd">
              Ignore Shine-Dalgarno sequences
            </label>
          </div>

        </div>
      </TooltipProvider>
    </div>

    <div class="w-2/3 pt-12">

      <div v-if="orphosError"
           class="mx-6 mb-4 p-3 bg-red-50 border border-red-300 rounded-md text-sm text-red-800">
        <template v-if="orphosError === 'memory'">
          Error during processing — most likely a memory issue. Try with fewer or smaller files.
        </template>
        <template v-else>
          An unexpected error occurred. Please reset and try again.
        </template>
      </div>

      <div v-if="tabName=='GeneCalling'">

        <!-- Upload dropzone - always visible -->
        <div v-bind='getRootPropsGenome()'
             :class="[
               'p-6 mx-6 bg-white border border-gray-200 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600',
               'cursor-pointer hover:border-gray-400'
             ]">
          <input v-bind='getInputPropsGenome()' />
          <FileUp/>
          <p v-if='isDragActiveGenome'>
            Drop files here ...
          </p>
          <p v-else>
            Drop or click to upload your <b>FASTA file(s)</b>
          </p>
        </div>

        <!-- Per-file in-flight status list -->
        <div v-if="uploadedFileNames.length > 0" class="mx-6 mt-4">
          <div v-for="fileName in uploadedFileNames" :key="fileName"
               class="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md mb-2">
            <Check v-if="isFileDone(fileName)" class="w-4 h-4 text-green-500"/>
            <Loader2 v-else-if="isFileInFlight(fileName)" class="w-4 h-4 text-amber-500 animate-spin"/>
            <span class="flex-grow text-sm font-mono truncate">{{ fileName }}</span>
          </div>
        </div>

        <!-- Bulk download bar (shown when 2+ results) -->
        <div v-if="resultCount >= 2" class="mx-6 mt-4 flex gap-2">
          <Button variant="outline" size="sm" @click="downloadZip">
            <Download class="mr-2 h-4 w-4" />
            Download all (.zip)
          </Button>
          <Button variant="outline" size="sm" @click="downloadTarGz">
            <Download class="mr-2 h-4 w-4" />
            Download all (.tar.gz)
          </Button>
        </div>

        <!-- Results table -->
        <div v-if="genesCalled" class="mx-6 mt-4 overflow-x-auto">
          <table class="w-full text-sm border border-gray-200 rounded-md">
            <thead>
              <tr class="bg-gray-50 text-left">
                <th class="px-3 py-2 font-medium text-gray-700">File name</th>
                <th class="px-3 py-2 font-medium text-gray-700">Genes called</th>
                <th class="px-3 py-2 font-medium text-gray-700">Download</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(result, fileName) in orphosResults" :key="fileName"
                  class="border-t border-gray-100">
                <td class="px-3 py-2 font-mono truncate max-w-[200px]">{{ result.fileName }}</td>
                <td class="px-3 py-2">{{ result.geneCount }}</td>
                <td class="px-3 py-2">
                  <Button variant="outline" size="sm" @click="downloadGff(result)">
                    <Download class="mr-1 h-3 w-3" />
                    .gff
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Clear button -->
        <div v-if="genesCalled || callingGenes" class="mx-6 mt-4">
          <Button variant="outline" size="sm" @click="resetAll">
            Clear results
          </Button>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from "vue";
import { useStore } from "vuex";
import VueSelect from "vue3-select-component";
import "vue3-select-component/styles";
import VueSlider from 'vue-3-slider-component';
import { useDropzone } from "vue3-dropzone";
import { useActions } from "vuex-composition-helpers";
import { Check, FileUp, Loader2, Info, Dna, Download } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import GeneCallingHelpCollapsible from "@/components/help/GeneCallingHelpCollapsible.vue";
import { fastaExtensionsWithDotAndCompressList } from "@/utils";
import { GeneCallResult } from "@/types";
import { buildZip, buildTarGz } from "@/archiveUtils";

export default defineComponent({
  name: "GeneCallingPage",
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
    Info,
    Dna,
    Download,
    VueSelect,
    VueSlider,
    Button,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    GeneCallingHelpCollapsible,
  },
  setup() {
    const store = useStore();
    const metag: Ref<boolean> = ref(false);
    const closed_ends: Ref<boolean> = ref(false);
    const mask: Ref<boolean> = ref(false);
    const non_sd: Ref<boolean> = ref(false);
    const tt: Ref<number> = ref(0);
    const numWorkers: Ref<number> = ref(4);
    const uploadedFileNames: Ref<string[]> = ref([]);

    const { callGenes, resetAllResults_orphos, initCallerWorkers } = useActions(["callGenes", "resetAllResults_orphos", "initCallerWorkers"]);

    function onNumWorkersChange(value: number): void {
      initCallerWorkers(value);
    }

    function resetAll(): void {
      uploadedFileNames.value = [];
      resetAllResults_orphos();
    }

    function onDropGenome(acceptFiles: File[]): void {
      // Accumulate file names (don't reset existing results on each drop)
      const newNames = acceptFiles.map(f => f.name);
      for (const name of newNames) {
        if (!uploadedFileNames.value.includes(name)) {
          uploadedFileNames.value.push(name);
        }
      }
      callGenes({
        acceptFiles,
        metag: metag.value,
        closed_ends: closed_ends.value,
        mask: mask.value,
        tt: tt.value,
        non_sd: non_sd.value,
      });
    }

    const orphosResults = computed<Record<string, GeneCallResult>>(() => store.getters.orphosResults);
    const resultCount = computed<number>(() => Object.keys(orphosResults.value).length);

    function downloadGff(result: GeneCallResult): void {
      const blob = new Blob([result.outputFile], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName.replace(/\.[^.]+$/, '') + '.gff';
      a.click();
      URL.revokeObjectURL(url);
    }

    function downloadZip(): void {
      const files: Record<string, string> = {};
      for (const result of Object.values(orphosResults.value)) {
        files[result.fileName.replace(/\.[^.]+$/, '') + '.gff'] = result.outputFile;
      }
      const bytes = buildZip(files);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'genecalls.zip';
      a.click();
      URL.revokeObjectURL(url);
    }

    function downloadTarGz(): void {
      const files: Record<string, string> = {};
      for (const result of Object.values(orphosResults.value)) {
        files[result.fileName.replace(/\.[^.]+$/, '') + '.gff'] = result.outputFile;
      }
      const bytes = buildTarGz(files);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/gzip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'genecalls.tar.gz';
      a.click();
      URL.revokeObjectURL(url);
    }

    const {
      getRootProps: getRootPropsGenome,
      getInputProps: getInputPropsGenome,
      isDragActive: isDragActiveGenome,
      ...restGenome
    } = useDropzone({
      onDrop: onDropGenome,
      accept: fastaExtensionsWithDotAndCompressList,
      multiple: true
    });

    return {
      metag,
      closed_ends,
      mask,
      non_sd,
      tt,
      numWorkers,
      onNumWorkersChange,
      uploadedFileNames,
      resetAll,
      getRootPropsGenome,
      getInputPropsGenome,
      isDragActiveGenome,
      onDropGenome,
      orphosResults,
      resultCount,
      downloadGff,
      downloadZip,
      downloadTarGz,
      store,
      ...restGenome,
    };
  },
  computed: {
    orphosError(): string | null {
      return this.store.getters.orphosError;
    },
    genesCalled(): boolean {
      return this.store.getters.genesCalled;
    },
    callingGenes(): boolean {
      return this.store.getters.callingGenes;
    },
    callingGenesFilesSet(): Set<string> {
      return this.store.getters.callingGenesFiles;
    },
  },
  methods: {
    isFileDone(fileName: string): boolean {
      return fileName in (this.orphosResults || {});
    },
    isFileInFlight(fileName: string): boolean {
      return this.callingGenesFilesSet.has(fileName);
    },
  },
});
</script>

<style scoped>
</style>
