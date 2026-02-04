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
      <div v-if="tabName=='GeneCalling'">

        <!-- Upload dropbox - always visible when not identifying -->
        <div v-if="!callingGenes"
             v-bind='getRootPropsGenome()'
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
            Drop or click to upload your <b>sample fasta file</b>
          </p>
        </div>

        <div v-else class="p-6 mx-6 bg-amber-50 border border-amber-400 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600">
          <Loader2 class="w-6 h-6 text-amber-500 animate-spin"/>
          <p class="text-sm text-gray-500">Calling genes...</p>
        </div>

        <!-- Show uploaded files -->
        <div v-if="uploadedFileNames.length > 0" class="mx-6 mt-4">
          <div v-for="fileName in uploadedFileNames" :key="fileName"
               class="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md mb-2">
            <Check v-if="genesCalled" class="w-4 h-4 text-green-500"/>
            <span class="flex-grow text-sm font-mono truncate">
              {{ fileName }}
            </span>
          </div>
        </div>


        <div v-if="genesCalled" class="w-1/2 flex-grow">
          <DownloadButtonOrphos />
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import { useStore } from "vuex";
import VueSelect from "vue3-select-component";
import "vue3-select-component/styles";
import { useDropzone } from "vue3-dropzone";
import { useActions, useState } from "vuex-composition-helpers";
import { Check, FileUp, Loader2, Info, Dna } from "lucide-vue-next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import GeneCallingHelpCollapsible from "@/components/help/GeneCallingHelpCollapsible.vue";
import DownloadButtonOrphos from "@/components/DownloadButtonOrphos.vue";

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
    VueSelect,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    GeneCallingHelpCollapsible,
    DownloadButtonOrphos
  },
  setup() {
    const store = useStore();
    const metag: Ref<boolean> = ref(false);
    const closed_ends: Ref<boolean> = ref(false);
    const mask: Ref<boolean> = ref(false);
    const non_sd: Ref<boolean> = ref(false);
    const tt: Ref<number> = ref(0);
    const uploadedFileNames: Ref<string[]> = ref([]);

    const { callGenes, resetAllResults_orphos } = useActions(["callGenes", "resetAllResults_orphos"]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { allResults_orphos } = useState(["allResults_orphos"]) as any;

    function resetAll(): void {
      uploadedFileNames.value = [];
      resetAllResults_orphos();
    }
    
    function onDropGenome(acceptFiles: File[]): void {
      if (store.getters.genesCalled) {
        resetAll();
      }
      uploadedFileNames.value = acceptFiles.map(f => f.name);
      callGenes({ 
        acceptFiles: acceptFiles, 
        metag: metag.value,
        closed_ends: closed_ends.value,
        mask: mask.value,
        tt: tt.value,
        non_sd: non_sd.value,
      });
    }

    const {
      getRootProps: getRootPropsGenome,
      getInputProps: getInputPropsGenome,
      isDragActive: isDragActiveGenome,
      ...restGenome
    } = useDropzone({
      onDrop: onDropGenome,
      accept: [".fa", ".fasta", "fa.gz", "fasta.gz"],
      multiple: false
    });

    return {
      metag,
      closed_ends,
      mask,
      non_sd,
      tt,
      uploadedFileNames,
      resetAll,
      getRootPropsGenome,
      getInputPropsGenome,
      isDragActiveGenome,
      onDropGenome,
      DownloadButtonOrphos,
      allResults_orphos,
      store,
      ...restGenome,
    };
  },
  computed: {
    genesCalled(): boolean {
      return this.store.getters.genesCalled;
    },
    callingGenes(): boolean {
      return this.store.getters.callingGenes;
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
