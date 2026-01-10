<template>
  <div class="flex flex-row">
    <div class="w-1/3">
      <h1 class="text-2xl font-medium flex items-center gap-2 mb-4">
        <Codesandbox class="w-6 h-6" />
        {{ tabName }}
      </h1>

      <AssemblyHelpCollapsible />

      <TooltipProvider>
        <div class="flex flex-col gap-4">
          <div>
            <p class="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p class="max-w-xs">Controls the size of the subsequences (k-mers) used to process the reads.</p>
                </TooltipContent>
              </Tooltip>
              k
            </p>
            <div class="flex flex-row items-center w-full gap-2">
              <VueSlider class="flex-grow"
                         v-model="k"
                         :lazy="true"
                         :min="21"
                         :max="89"
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
                  <p class="max-w-xs">Controls the filtering of nucleotides depending on the sequencing error information.</p>
                </TooltipContent>
              </Tooltip>
              Min Illumina read quality
            </p>
            <div class="flex flex-row items-center w-full gap-2">
              <VueSlider class="flex-grow"
                         v-model="min_qual"
                         :lazy="true"
                         :min="0"
                         :max="33"
                         :interval="1"
                         :disabled="isProcessingAny"
              />
              <span class="block w-[40px] text-center border border-gray-300 rounded-md text-sm">
                {{ min_qual }}
              </span>
            </div>
          </div>

          <div :class="do_fit ? 'opacity-50' : ''">
            <p class="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p class="max-w-xs">Only k-mers appearing more than this value will be used.</p>
                </TooltipContent>
              </Tooltip>
              Min counts for k-mer filtering
            </p>
            <div class="flex flex-row items-center w-full gap-2">
              <VueSlider class="flex-grow"
                         v-model="min_count"
                         :lazy="true"
                         :min="0"
                         :max="30"
                         :interval="1"
                         :disabled="isProcessingAny || do_fit"
              />
              <span class="block w-[40px] text-center border border-gray-300 rounded-md text-sm">
                {{ min_count }}
              </span>
            </div>
          </div>

          <div class="flex flex-row items-center w-full gap-2">
            <input id="do_fit" type="checkbox" v-model="do_fit" :disabled="isProcessingAny"/>
            <Tooltip>
              <TooltipTrigger as-child>
                <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-xs">Allows automatic setting of the minimum k-mer count. Memory usage could increase.</p>
              </TooltipContent>
            </Tooltip>
            <label for="do_fit">
              Automatically set min counts
            </label>
          </div>

          <div class="flex flex-row items-center w-full gap-2">
            <input id="do_bloom" type="checkbox" v-model="do_bloom" :disabled="isProcessingAny"/>
            <Tooltip>
              <TooltipTrigger as-child>
                <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-xs">Alternative filtering with significantly lower memory usage. Recommended for non-small reads. Chunking will be disabled.</p>
              </TooltipContent>
            </Tooltip>
            <label for="do_bloom">
              Use Bloom filter
            </label>
          </div>

          <div class="flex flex-row items-center w-full gap-2">
            <input id="no_deadend" type="checkbox" v-model="no_deadend" :disabled="isProcessingAny"/>
            <Tooltip>
              <TooltipTrigger as-child>
                <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-xs">Maintains short paths in the graph that would usually be pruned.</p>
              </TooltipContent>
            </Tooltip>
            <label for="no_deadend">
              Keep dead-ends
            </label>
          </div>

          <div class="flex flex-row items-center w-full gap-2">
            <input id="no_bubble" type="checkbox" v-model="no_bubble" :disabled="isProcessingAny"/>
            <Tooltip>
              <TooltipTrigger as-child>
                <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-xs">Disables simple bubble collapse in the assembly graph.</p>
              </TooltipContent>
            </Tooltip>
            <label for="no_bubble">
              Do not collapse bubbles
            </label>
          </div>

          <div :class="do_bloom ? 'opacity-50' : ''">
            <label for="csize" class="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p class="max-w-xs">Size of the preprocessing batches. Lowering this value will usually decrease memory usage somewhat.</p>
                </TooltipContent>
              </Tooltip>
              Chunk size (zero for no chunking)
            </label>
            <input id="csize"
                   type="number"
                   class="w-full border border-gray-300 rounded-md text-sm p-2 active:outline-none focus:outline-none"
                   v-model.number.trim="csize"
                   :disabled="do_bloom || isProcessingAny">
          </div>

          <Button @click="doPreProcess()" v-if="readsProcessed" class="max-w-fit mt-2"
                  variant="outline" size="sm">
            Re-process
          </Button>
        </div>
      </TooltipProvider>
    </div>

    <div class="w-2/3 pt-12">
      <h5 class="memory_error_message" v-if="errorInProcessing">
        Error found while processing! It is most surely a memory issue: try increasing the chunking, or using a Bloom
        filter
      </h5>

      <!-- Assembly tab -->
      <div v-if="tabName=='Assembly'">

        <!-- Dropzone for file upload - always visible -->
        <div v-bind='getRootPropsReads()'
             :class="[
               'p-6 mx-6 bg-white border border-gray-200 rounded-md flex flex-col justify-center items-center gap-2 text-gray-600',
               isProcessingAny ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
             ]">

          <input v-bind='getInputPropsReads()' :disabled="isProcessingAny"/>

          <FileUp/>

          <p v-if='isDragActiveReads'>
            Drop files here ...
          </p>
          <p v-else>
            Drop or click to upload your <b>paired end fastq read files</b>
          </p>

        </div>

        <p v-if="isPreprocessingActive" class="mx-6 mt-4 text-sm text-gray-500">
          Pre-processing...
        </p>
        <p v-else-if="isAssemblingActive" class="mx-6 mt-4 text-sm text-gray-500">
          Assembling...
        </p>

        <!-- File list with status -->
        <div class="flex flex-row gap-2 w-full mt-4">
          <div v-if="uploadedFiles.length > 0" class="mx-6 w-1/2 flex-grow">
            <div v-for="file in uploadedFiles" :key="file.name"
                 class="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md mb-2">

              <Loader2 v-if="isPreprocessingActive" class="w-4 h-4 text-blue-500 animate-spin"/>
              <Loader2 v-else-if="isAssemblingActive" class="w-4 h-4 text-orange-500 animate-spin"/>
              <Check v-else-if="readsProcessed || readsPreprocessed" class="w-4 h-4 text-green-500"/>

              <span class="flex-grow text-sm font-mono truncate">
              {{ file.name }}
            </span>
            </div>
          </div>
          <div v-if="readsProcessed" class="w-1/2 flex-grow">
            <DownloadButton/>
          </div>
        </div>

        <!-- Reset button when processing is done or in progress -->
        <!--        <button @click="resetAll"-->
        <!--                v-if="uploadedFiles.length > 0"-->
        <!--                class="mx-6 mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">-->
        <!--          Reset-->
        <!--        </button>-->

        <slot/>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import {defineComponent, ref, Ref} from "vue";
import {useDropzone} from "vue3-dropzone";
import {useActions, useState} from "vuex-composition-helpers";
import {useStore} from "vuex";
import VueSlider from 'vue-3-slider-component';
import "@fontsource/ibm-plex-mono";
import {Check, FileUp, Loader2, Info, Codesandbox} from "lucide-vue-next";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import DownloadButton from "@/components/DownloadButton.vue";
import AssemblyHelpCollapsible from "@/components/help/AssemblyHelpCollapsible.vue";
import {Button} from "@/components/ui/button";

export default defineComponent({
  name: "AssemblyPage",
  props: {
    tabName: {
      type: String,
      required: true
    }
  },
  components: {
    DownloadButton,
    AssemblyHelpCollapsible,
    Button,
    VueSlider,
    FileUp,
    Loader2,
    Check,
    Info,
    Codesandbox,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
  },
  setup() {
    const store = useStore();
    const k: Ref<number> = ref(31);
    const min_count: Ref<number> = ref(5);
    const min_qual: Ref<number> = ref(20);
    const csize: Ref<number> = ref(150000);
    const do_bloom: Ref<boolean> = ref(false);
    const do_fit: Ref<boolean> = ref(false);
    const assemblying: Ref<boolean> = ref(false);
    const no_bubble: Ref<boolean> = ref(false);
    const no_deadend: Ref<boolean> = ref(false);
    const uploadedFiles: Ref<File[]> = ref([]);

    const {
      processReads,
      doTheAssembly,
      resetAllResults,
      removeErrors
    } = useActions(["processReads", "doTheAssembly", "resetAllResults", "removeErrors"]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {allResults} = useState(["allResults"]) as any;

    function onDropReads(acceptFiles: File[]): void {
      uploadedFiles.value = acceptFiles;
      doPreProcess();
    }

    function doPreProcess(): void {
      processReads({
        acceptFiles: uploadedFiles.value,
        k: k.value,
        min_count: min_count.value,
        min_qual: min_qual.value,
        csize: csize.value,
        do_bloom: do_bloom.value,
        do_fit: do_fit.value,
      });
    }

    function doAss(): void {
      assemblying.value = true;
      doTheAssembly({
        no_bubble_collapse: no_bubble.value,
        no_dead_end_removal: no_deadend.value
      });
    }

    function resetAll(): void {
      assemblying.value = false;
      uploadedFiles.value = [];
      resetAllResults();
      removeErrors();
    }

    const {
      getRootProps: getRootPropsReads,
      getInputProps: getInputPropsReads,
      isDragActive: isDragActiveReads,
      ...restReads
    } = useDropzone({
      onDrop: onDropReads,
      accept: [".gz", ".fastq", ".fq"],
      multiple: true
    });

    return {
      store,
      k,
      min_count,
      min_qual,
      csize,
      do_bloom,
      do_fit,
      no_bubble,
      no_deadend,
      assemblying,
      resetAll,
      doPreProcess,
      doAss,
      getRootPropsReads,
      getInputPropsReads,
      isDragActiveReads,
      onDropReads,
      allResults,
      uploadedFiles,
      ...restReads,
    };
  },

  computed: {
    readsProcessed(): boolean {
      return this.store.getters.queryAssembled;
    },
    readsProcessing(): boolean {
      return this.store.getters.readsProcessing;
    },
    readsPreprocessed(): boolean {
      return this.store.getters.readsPreprocessed;
    },
    readsPreprocessing(): boolean {
      return this.store.getters.readsPreprocessing;
    },
    errorInProcessing(): boolean {
      return this.store.getters.getErrors;
    },
    readsName(): string {
      return this.store.getters.readsName;
    },
    isPreprocessingActive(): boolean {
      return this.store.getters.isPreprocessing;
    },
    isAssemblingActive(): boolean {
      return this.store.getters.isAssembling;
    },
    isProcessingAny(): boolean {
      return this.store.getters.isPreprocessing || this.store.getters.isAssembling;
    }
  },

  watch: {
    readsPreprocessed(newVal: boolean) {
      if (newVal) {
        this.doAss();
      }
    }
  },

  methods: {
    clear(): void {
      this.resetAll();
    },

    doAssembly(): void {
      this.doAss();
    },
  },
});

</script>

<style scoped>
</style>
