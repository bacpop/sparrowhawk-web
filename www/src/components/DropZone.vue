<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-balance mb-4">
      {{ tabName }}
    </h1>

    <!-- Parameters section - always editable -->
    <div id="parameters">
      <h5 class="parameters_legends" v-bind="k">k: {{ k }}</h5>
      <VueSlider
          v-model="k"
          :lazy="true"
          :min="21"
          :max="89"
          :interval="2"
          :disabled="isProcessingAny"
      />
      <h5 class="parameters_legends" v-bind="min_qual">Minimum Illumina read quality: {{ min_qual }}</h5>
      <VueSlider
          v-model="min_qual"
          :lazy="true"
          :min="0"
          :max="33"
          :interval="1"
          :disabled="isProcessingAny"
      />
      <h5 class="parameters_legends" v-if="!do_fit" v-bind="min_count">Minimum counts for k-mer filtering: {{
          min_count
        }}</h5>
      <VueSlider
          v-model="min_count"
          :lazy="true"
          :min="0"
          :max="30"
          :interval="1"
          v-if="!do_fit"
          :disabled="isProcessingAny"
      />
      <h5 class="parameters_legends" style="margin-top: 3px;">Automatically set the minimum counts for
        k-mer filtering (memory usage could increase): {{ do_fit }}</h5>
      <input type="checkbox" v-model="do_fit" style="float: right; margin-top: -16px;" :disabled="isProcessingAny"/>

      <h5 class="parameters_legends" v-if="!do_bloom" style="margin-top: 3px;">Chunk processing size (set
        zero for no chunking): {{ csize }}</h5>
      <input type="text" v-if="!do_bloom" v-model.number.trim="csize" style="float: right; margin-top: -18px;" :disabled="isProcessingAny">
      <h5 class="parameters_legends" style="margin-top: 3px;">Use Bloom filter for preprocessing
        (recommended for non-small reads; chunking will be disabled): {{ do_bloom }}</h5>
      <input type="checkbox" v-model="do_bloom" style="float: right; margin-top: -8px;" :disabled="isProcessingAny"/>

      <h5 class="parameters_legends" style="margin-top: 3px;">Do not remove dead-ends while
        correcting the assembly graph: {{ no_deadend }}</h5>
      <input type="checkbox" v-model="no_deadend" style="float: right; margin-top: -8px;" :disabled="isProcessingAny"/>

      <h5 class="parameters_legends" style="margin-top: 3px;">Do not collapse bubbles while
        correcting the assembly graph: {{ no_bubble }}</h5>
      <input type="checkbox" v-model="no_bubble" style="float: right; margin-top: -8px;" :disabled="isProcessingAny"/>
    </div>

    <h5 class="memory_error_message" v-if="errorInProcessing">Error found while processing! It is most surely a memory
      issue: try increasing the chunking, or using a Bloom filter</h5>

    <!-- Assembly tab -->
    <div v-if="tabName=='Assembly'">

      <!-- Dropzone for file upload -->
      <div v-if="!readsProcessed && !readsProcessing" v-bind='getRootPropsReads()' class="dropzone dropzone-reads">
        <input v-bind='getInputPropsReads()'/>
        <p v-if='isDragActiveReads' class="dropzone-text">Drop the files here ...</p>
        <p v-else class="dropzone-text">Drag and drop your <b>paired end fastq read files</b> here,
          or click to select them</p>
      </div>

      <!-- Processing states -->
      <div v-else-if="!readsProcessed && readsProcessing" class="dropzone dropzone-reads dropzone-processing">
        <div v-if="isPreprocessingActive" class="processing-content">
          <LoadingSpinner message="Preprocessing reads..." />
        </div>
        <div v-else-if="isAssemblingActive" class="processing-content">
          <LoadingSpinner message="Assembling genome..." />
        </div>
        <div v-else-if="!assemblying" class="processing-content">
          <p class="dropzone-text ready-text">Reads <span class="monospace">{{ readsName }}</span> preprocessed and ready for assembly.</p>
        </div>
        <div v-else class="processing-content">
          <LoadingSpinner message="Assembling..." />
        </div>
      </div>

      <!-- Completed state -->
      <div v-else class="dropzone dropzone-reads dropzone-complete">
        <p class="dropzone-text success-text">Reads assembled!</p>
      </div>

      <!-- Start assembly button -->
      <button @click="doAss" v-if='readsPreprocessed && !readsProcessed && !isAssemblingActive' class="action-button">
        <b>Start assembly</b>
      </button>

      <!-- Reset button when processing is done or in progress -->
      <button @click="resetAll" v-if="readsProcessing || readsProcessed" class="reset-button">
        Reset and upload new files
      </button>
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
    LoadingSpinner
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
.dropzone {
  border: 2px dotted rgb(56, 55, 55);
  margin: 10%;
  text-align: center;
  vertical-align: middle;
  display: flex;
  align-items: center;
  border-radius: 4px;
  margin-bottom: 5px;
}

.dropzone-reads {
  height: 75px;
  margin-top: 20px;
  background-color: rgb(159, 176, 190);
}

.dropzone-text {
  padding: 30px;
}

.monospace {
  font-family: "IBM Plex mono";
}

#parameters {
  margin: 1% 10%;
}

.parameters_legends {
  text-align: left;
  margin: 0px;
  width: 70%;
}

.memory_error_message {
  text-align: center;
  color: #D41645;
}

.dropzone-processing {
  background-color: #fef3c7;
  border-color: #f59e0b;
  justify-content: center;
}

.dropzone-complete {
  background-color: #d1fae5;
  border-color: #10b981;
}

.processing-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.ready-text {
  color: #92400e;
}

.success-text {
  color: #065f46;
  font-weight: 500;
}

.action-button {
  display: block;
  margin: 10px auto;
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.action-button:hover {
  background-color: #2563eb;
}

.reset-button {
  display: block;
  margin: 10px auto;
  padding: 8px 16px;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.reset-button:hover {
  background-color: #4b5563;
}
</style>
