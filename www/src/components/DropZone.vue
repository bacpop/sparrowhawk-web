<template>
  <div class="flex flex-row">
    <div class="w-1/3">
      <h1 class="text-2xl font-medium mb-4">
        {{ tabName }}
      </h1>

      <div class="flex flex-col gap-4">
        <div>
          <p>k</p>
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
          <p>Min Illumina read quality</p>
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
          <p>Min counts for k-mer filtering</p>
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
          <label for="do_fit">
            Automatically set min counts
          </label>
          <!--           for k-mer filtering (memory usage could increase)-->
        </div>

        <div class="flex flex-row items-center w-full gap-2">
          <input id="do_bloom" type="checkbox" v-model="do_bloom" :disabled="isProcessingAny"/>
          <label for="do_bloom">
            Use Bloom filter
          </label>
          <!--           for preprocessing (recommended for non-small reads; chunking will be disabled)-->
        </div>

        <div class="flex flex-row items-center w-full gap-2">
          <input id="no_deadend" type="checkbox" v-model="no_deadend" :disabled="isProcessingAny"/>
          <label for="no_deadend">
            Keep dead-ends
          </label>
        </div>

        <div class="flex flex-row items-center w-full gap-2">
          <input id="no_bubble" type="checkbox" v-model="no_bubble" :disabled="isProcessingAny"/>
          <label for="no_bubble">
            Do not collapse bubbles
          </label>
        </div>

        <div :class="do_bloom ? 'opacity-50' : ''">
          <label for="csize">
            Chunk size (zero for no chunking)
          </label>
          <input id="csize"
                 type="number"
                 class="w-full border border-gray-300 rounded-md text-sm p-2 active:outline-none focus:outline-none"
                 v-model.number.trim="csize"
                 :disabled="do_bloom || isProcessingAny">
        </div>
      </div>
    </div>

    <div class="w-2/3 pt-12">
      <h5 class="memory_error_message" v-if="errorInProcessing">
        Error found while processing! It is most surely a memory issue: try increasing the chunking, or using a Bloom
        filter
      </h5>

      <!-- Assembly tab -->
      <div v-if="tabName=='Assembly'">

        <!-- Dropzone for file upload -->
        <div v-if="!readsProcessed && !readsProcessing"
             v-bind='getRootPropsReads()'
             class="p-6 mx-6 bg-white border border-grey-200 rounded-md flex flex-col justify-center items-center gap-2 cursor-pointer text-gray-600">

          <input v-bind='getInputPropsReads()'/>

          <FileUp />

          <p v-if='isDragActiveReads' class="">
            Drop files here ...
          </p>
          <p v-else class="">
            Drop or click to upload your <b>paired end fastq read files</b>
          </p>

        </div>

        <!-- Processing states -->
        <div v-else-if="!readsProcessed && readsProcessing" class="">
          <div v-if="isPreprocessingActive" class="">
            <LoadingSpinner message="Preprocessing reads..."/>
          </div>
          <div v-else-if="isAssemblingActive" class="">
            <LoadingSpinner message="Assembling genome..."/>
          </div>
          <div v-else-if="!assemblying" class="">
            <p class=" ready-text">Reads <span class="monospace">{{ readsName }}</span> preprocessed and
              ready for assembly.</p>
          </div>
          <div v-else class="">
            <LoadingSpinner message="Assembling..."/>
          </div>
        </div>

        <!-- Completed state -->
        <div v-else class="">
          <p class="">Reads assembled!</p>
        </div>

        <!-- Start assembly button -->
        <button @click="doAss" v-if='readsPreprocessed && !readsProcessed && !isAssemblingActive' class="">
          <b>Start assembly</b>
        </button>

        <!-- Reset button when processing is done or in progress -->
        <button @click="resetAll" v-if="readsProcessing || readsProcessed" class="">
          Reset and upload new files
        </button>

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
import LoadingSpinner from './LoadingSpinner.vue';
import "@fontsource/ibm-plex-mono";
import {FileUp} from "lucide-vue-next";

export default defineComponent({
  name: "DropZone",
  props: {
    tabName: {
      type: String,
      required: true
    }
  },
  components: {
    VueSlider,
    LoadingSpinner,
    FileUp
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

    const {
      processReads,
      doTheAssembly,
      resetAllResults,
      removeErrors
    } = useActions(["processReads", "doTheAssembly", "resetAllResults", "removeErrors"]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {allResults} = useState(["allResults"]) as any;


    function onDropReads(acceptFiles: File[]): void {
      processReads({
        acceptFiles: acceptFiles,
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
      doAss,
      getRootPropsReads,
      getInputPropsReads,
      isDragActiveReads,
      onDropReads,
      allResults,
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
