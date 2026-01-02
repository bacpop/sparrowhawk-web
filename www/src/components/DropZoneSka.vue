<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-balance">
      {{ tabName }}
    </h1>

    <!-- Parameters section - always visible and editable when not processing -->
    <div id="parameters">
      <h5 class="parameters_legends">k: {{ k }}</h5>
      <VueSlider
          v-model="k"
          :lazy="true"
          :min="5"
          :max="61"
          :interval="2"
          :disabled="isProcessingAny"
      />
      <h5 class="parameters_legends">Proportion of reads: {{ proportion_reads }}</h5>
      <VueSlider
          v-model="proportion_reads"
          :lazy="true"
          :min="0"
          :max="1"
          :interval="0.05"
          :disabled="isProcessingAny"
      />
    </div>

    <!-- Mapping tab -->
    <div v-if="tabName=='Mapping'">

      <!-- Reference upload/indexing -->
      <div v-if="!refProcessed && !isIndexingRef" v-bind='getRootPropsRef()' class="dropzone dropzone-ref">
        <input v-bind='getInputPropsRef()'/>
        <p v-if='isDragActiveRef' class="dropzone-text">Drop the files here ...</p>
        <p v-else class="dropzone-text">Drag and drop your <b>reference fasta file</b> here,
          or click to select a file</p>
      </div>
      <div v-else-if="isIndexingRef" class="dropzone dropzone-ref dropzone-processing">
        <LoadingSpinner message="Indexing reference genome..." />
      </div>
      <div v-else class="dropzone dropzone-ref dropzone-complete">
        <p class="dropzone-text success-text">Reference indexed: <span class="monospace">{{ refName }}</span></p>
      </div>

      <!-- Query mapping -->
      <div v-if="refProcessed && !isMapping" v-bind='getRootPropsQueryMap()' class="dropzone dropzone-query">
        <input v-bind='getInputPropsQueryMap()'/>
        <p v-if='isDragActiveQueryMap' class="dropzone-text">Drop the files here ...</p>
        <p v-else class="dropzone-text">Drag and drop read or assembly <b>files to be mapped</b> here,
          or click to select files</p>
      </div>
      <div v-else-if="refProcessed && isMapping" class="dropzone dropzone-query dropzone-processing">
        <LoadingSpinner message="Mapping files to reference..." />
      </div>
      <p v-if="refProcessed" class="count">Files mapped: {{ Object.keys(allResults_ska.mapResults).length }}</p>

      <!-- Reset button -->
      <button v-if="refProcessed" @click="resetAll" class="reset-button">
        Reset and start over
      </button>
    </div>

    <!-- Alignment tab -->
    <div v-else-if="tabName=='Alignment'">
      <div v-if="!isAligning && !hasAlignmentResults" v-bind='getRootPropsQueryAlign()' class="dropzone dropzone-query">
        <input v-bind='getInputPropsQueryAlign()'/>
        <p v-if='isDragActiveQueryAlign' class="dropzone-text">Drop the files here ...</p>
        <p v-else class="dropzone-text">Drag and drop read or assembly <b>files to be aligned</b> here,
          or click to select files</p>
      </div>
      <div v-else-if="isAligning" class="dropzone dropzone-query dropzone-processing">
        <LoadingSpinner message="Aligning sequences..." />
      </div>
      <div v-else-if="hasAlignmentResults" class="dropzone dropzone-query dropzone-complete">
        <p class="dropzone-text success-text">Alignment complete!</p>
      </div>
      <p v-if="hasAlignmentResults" class="count">Files aligned: {{ allResults_ska.alignResults[0] ? allResults_ska.alignResults[0].names.length : 0 }}</p>

      <!-- Reset button -->
      <button v-if="hasAlignmentResults" @click="resetAll" class="reset-button">
        Reset and upload new files
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import { useDropzone } from "vue3-dropzone";
import { useActions, useState } from "vuex-composition-helpers";
import { useStore } from "vuex";
import VueSlider from 'vue-3-slider-component';
import LoadingSpinner from './LoadingSpinner.vue';

export default defineComponent({
  name: "DropZoneSka",
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

.dropzone-ref {
  height: 75px;
  margin-top: 20px;
  background-color: rgb(159, 176, 190);
}

.dropzone-query {
  height: 75px;
  margin-top: 10px;
  background-color: rgb(221, 249, 226);
}

.dropzone-text {
  padding: 30px;
}

.monospace {
  font-family: 'Courier New', monospace;
}

#parameters {
  margin: 1% 10%;
}

.parameters_legends {
  text-align: left;
  margin: 0px;
  width: 70%;
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

.success-text {
  color: #065f46;
  font-weight: 500;
}

.count {
  text-align: center;
  margin: 0 10%;
  color: #6b7280;
  font-size: 14px;
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
