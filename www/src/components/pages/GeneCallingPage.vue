<template>
  <div class="flex flex-row">
    <div class="w-1/3">
      <h1 class="text-2xl font-medium mb-4 flex items-center gap-2">
        <Dna class="w-6 h-6" />
        Gene calling
      </h1>

      <GeneCallingHelpCollapsible />

      <!-- <TooltipProvider>
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
                         :disabled="isCalling"
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
                         :disabled="isCalling"
              />
              <span class="block w-[40px] text-center border border-gray-300 rounded-md text-sm">
                {{ proportion_reads }}
              </span>
            </div>
          </div>
        </div>
      </TooltipProvider> -->
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
            Drop or click to upload your <b>sample fasta file(s)</b>
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
import { useDropzone } from "vue3-dropzone";
import { useActions, useState } from "vuex-composition-helpers";
// import VueSlider from 'vue-3-slider-component';
// import { Check, FileUp, Loader2, Info, Dna } from "lucide-vue-next";
import { Check, FileUp, Loader2, Dna } from "lucide-vue-next";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    // VueSlider,
    Check,
    FileUp,
    Loader2,
    // Info,
    Dna,
    // Tooltip,
    // TooltipContent,
    // TooltipProvider,
    // TooltipTrigger,
    GeneCallingHelpCollapsible,
    DownloadButtonOrphos
  },
  setup() {
    const store = useStore();
    const uploadedFileNames: Ref<string[]> = ref([]);

    const { callGenes, resetAllResults_orphos } = useActions(["callGenes", "resetAllResults_orphos"]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { allResults_orphos } = useState(["allResults_orphos"]) as any;

    function onDropGenome(acceptFiles: File[]): void {
      uploadedFileNames.value = acceptFiles.map(f => f.name);
      callGenes({ acceptFiles: acceptFiles });
    }

    function resetAll(): void {
      uploadedFileNames.value = [];
      resetAllResults_orphos();
    }
    
    const {
      getRootProps: getRootPropsGenome,
      getInputProps: getInputPropsGenome,
      isDragActive: isDragActiveGenome,
      ...restGenome
    } = useDropzone({
      onDrop: onDropGenome,
      accept: [".fa", ".fasta", ".gz"],
      multiple: false
    });

    return {
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
