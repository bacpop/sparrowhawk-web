<template>
  <div class="flex flex-row">
    <div class="w-[350px] shrink-0">
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

    <div class="min-w-0 flex-1 overflow-hidden pt-12">
      <!-- Mapping tab -->
      <div v-if="tabName=='Mapping'">

        <!-- Single dropzone - always visible -->
        <div v-bind='getRootPropsMapping()'
             :class="[
               'p-6 mx-6 mr-0 bg-white border border-gray-200 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600',
               isProcessingAny ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
             ]">
          <input v-bind='getInputPropsMapping()' :disabled="isProcessingAny"/>
          <FileUp/>
          <p v-if='isDragActiveMapping'>
            Drop files here ...
          </p>
          <p v-else>
            Drop or click to upload your <b>{{ dropzonePrompt }}</b>
          </p>
        </div>

        <p v-if="isIndexingRef" class="mx-6 mr-0 mt-4 text-sm text-gray-500">
          Indexing reference...
        </p>
        <p v-else-if="isMapping" class="mx-6 mr-0 mt-4 text-sm text-gray-500">
          Mapping...
        </p>

        <!-- File list with status and download button -->
        <div class="flex flex-row gap-2 w-full mt-4">
          <div v-if="uploadedFiles.length > 0" class="mx-6 w-1/2 flex-grow">
            <div v-for="file in uploadedFiles" :key="file.name"
                 class="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md mb-2">

              <Loader2 v-if="getFileStatus(file) === 'indexing'" class="w-4 h-4 text-blue-500 animate-spin"/>
              <Loader2 v-else-if="getFileStatus(file) === 'mapping'" class="w-4 h-4 text-orange-500 animate-spin"/>
              <Check v-else-if="getFileStatus(file) === 'done'" class="w-4 h-4 text-green-500"/>

              <span class="flex-grow text-sm font-mono truncate">
                {{ file.name }}
              </span>
              <span v-if="file.type === 'reference'" class="text-xs text-gray-400">(ref)</span>
            </div>
          </div>
          <div v-if="hasMappingResults" class="w-1/2 flex-grow">
            <DownloadButtonSka />
          </div>
        </div>

        <!-- Reset button -->
        <Button v-if="uploadedFiles.length > 0" @click="resetAll" class="mx-6 mr-0 mt-4" variant="outline" size="sm">
          Reset and start over
        </Button>

        <div v-if="hasMappingResults" class="mx-6 mt-6">
          <div class="w-full">
            <MSAViewer
              :data="mappingMSAData"
              filename="Mapping Results"
              :show-header="false"
              class="h-[400px] w-full"
            />
          </div>
        </div>

        <slot name="mapping"/>
      </div>

      <!-- Alignment tab -->
      <div v-else-if="tabName=='Alignment'">
        <!-- Dropbox - always visible when not aligning -->
        <div v-if="!isAligning"
             v-bind='getRootPropsQueryAlign()'
             :class="[
               'p-6 mx-6 mr-0 bg-white border border-gray-200 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600',
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

        <div v-else class="p-6 mx-6 bg-amber-50 border border-amber-400 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600">
          <Loader2 class="w-6 h-6 text-amber-500 animate-spin"/>
          <p class="text-sm text-gray-500">Aligning...</p>
        </div>

        <!-- File list with status -->
        <div v-if="uploadedAlignmentFiles.length > 0" class="mx-6 mr-0 mt-4">
          <div v-for="fileName in uploadedAlignmentFiles" :key="fileName"
               class="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md mb-2">
            <Loader2 v-if="isAligning" class="w-4 h-4 text-orange-500 animate-spin"/>
            <Check v-else-if="hasAlignmentResults" class="w-4 h-4 text-green-500"/>
            <span class="flex-grow text-sm font-mono truncate">
              {{ fileName }}
            </span>
          </div>
        </div>

        <slot name="alignment"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from "vue";
import { useDropzone } from "vue3-dropzone";
import { useActions, useState } from "vuex-composition-helpers";
import { useStore } from "vuex";
import VueSlider from 'vue-3-slider-component';
import { Check, FileUp, Loader2, Info, Map, Spline } from "lucide-vue-next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import MappingHelpCollapsible from "@/components/help/MappingHelpCollapsible.vue";
import AlignmentHelpCollapsible from "@/components/help/AlignmentHelpCollapsible.vue";
import DownloadButtonSka from "@/components/SequenceViewer/DownloadButtonSka.vue";
import { MSAViewer } from "@/components/MSAViewer";

interface UploadedFile {
  name: string;
  type: 'reference' | 'query';
}

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
    AlignmentHelpCollapsible,
    DownloadButtonSka,
    MSAViewer
  },
  setup() {
    const store = useStore();
    const k: Ref<number> = ref(31);
    const proportion_reads: Ref<number> = ref(1);
    const uploadedFiles: Ref<UploadedFile[]> = ref([]);
    const uploadedAlignmentFiles: Ref<string[]> = ref([]);


    const {
      processRef,
      processQueryMap,
      processQueryAlign,
      resetAllResults_ska
    } = useActions(["processRef", "processQueryMap", "processQueryAlign", "resetAllResults_ska"]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { allResults_ska } = useState(["allResults_ska"]) as any;

    const refProcessed = computed(() => store.getters.refProcessed);
    const isIndexingRef = computed(() => store.getters.isIndexingRef);
    const isMapping = computed(() => store.getters.isMapping);

    function onDropMapping(acceptFiles: File[]): void {
      if (!refProcessed.value && !isIndexingRef.value) {
        // First upload is reference
        uploadedFiles.value = [{ name: acceptFiles[0].name, type: 'reference' }];
        processRef({ acceptFiles: acceptFiles, k: k.value });
      } else if (refProcessed.value && !isMapping.value) {
        // Subsequent uploads are query files
        const newFiles = acceptFiles.map(f => ({ name: f.name, type: 'query' as const }));
        uploadedFiles.value = [...uploadedFiles.value, ...newFiles];
        processQueryMap({ acceptFiles: acceptFiles, proportion_reads: proportion_reads.value });
      }
    }

    function onDropQueryAlign(acceptFiles: File[]): void {
      uploadedAlignmentFiles.value = acceptFiles.map(f => f.name);
      processQueryAlign({ acceptFiles: acceptFiles, k: k.value, proportion_reads: proportion_reads.value });
    }

    function resetAll(): void {
      uploadedFiles.value = [];
      uploadedAlignmentFiles.value = [];
      resetAllResults_ska();
    }

    const {
      getRootProps: getRootPropsMapping,
      getInputProps: getInputPropsMapping,
      isDragActive: isDragActiveMapping,
      ...restMapping
    } = useDropzone({
      onDrop: onDropMapping,
      accept: [".fa", ".fasta", ".gz", ".fastq"]
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
      uploadedFiles,
      uploadedAlignmentFiles,
      getRootPropsMapping,
      getInputPropsMapping,
      isDragActiveMapping,
      getRootPropsQueryAlign,
      getInputPropsQueryAlign,
      isDragActiveQueryAlign,
      allResults_ska,
      ...restMapping,
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
    },
    hasMappingResults(): boolean {
      return Object.keys(this.allResults_ska.mapResults).length > 0;
    },
    // Convert mapping results to MSA format for the viewer
    mappingMSAData(): { id: string; sequence: string }[] {
      const results: { id: string; sequence: string }[] = [];

      // Add reference sequence first
      if (this.allResults_ska.ref && this.allResults_ska.ref.length > 0) {
        const refSeq = this.allResults_ska.ref.join('');
        console.log('[mappingMSAData] ref sequence length:', refSeq.length);
        results.push({
          id: this.refName || 'Reference',
          sequence: refSeq
        });
      }

      // Add mapped sequences
      for (const fileName of Object.keys(this.allResults_ska.mapResults)) {
        const mapping = this.allResults_ska.mapResults[fileName];
        if (mapping?.mapped_sequences && mapping.mapped_sequences.length > 0) {
          const seq = mapping.mapped_sequences.join('');
          console.log('[mappingMSAData] mapped sequence length:', seq.length, 'for', fileName);
          results.push({
            id: fileName,
            sequence: seq
          });
        }
      }

      console.log('[mappingMSAData] total sequences:', results.length);
      return results;
    },
    dropzonePrompt(): string {
      if (!this.refProcessed && !this.isIndexingRef) {
        return 'reference fasta file';
      }
      return 'files to be mapped';
    }
  },

  methods: {
    clear(): void {
      this.resetAll();
    },
    getFileStatus(file: UploadedFile): 'indexing' | 'mapping' | 'done' {
      if (file.type === 'reference') {
        if (this.isIndexingRef) return 'indexing';
        if (this.refProcessed) return 'done';
      } else {
        // Query file - check if mapped_sequences has data
        const result = this.allResults_ska.mapResults[file.name];
        if (this.isMapping) return 'mapping';
        if (result?.mapped_sequences?.length > 0 || !this.isMapping) return 'done';
      }
      return 'mapping';
    }
  },
});
</script>

<style scoped>
</style>
