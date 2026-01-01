<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-balance">
      {{ tabName }}
    </h1>
    <div v-if="!param" id="parameters">
      <h5 class="parameters_legends" v-bind="k">k: {{ k }}</h5>
      <VueSlider
          v-model="k"
          :lazy="true"
          :min="5"
          :max="61"
          :interval="2"
      >
      </VueSlider>
      <h5 class="parameters_legends" v-bind="proportion_reads">Proportion of reads: {{ proportion_reads }}</h5>
      <VueSlider
          v-model="proportion_reads"
          :lazy="true"
          :min="0"
          :max="1"
          :interval="0.05"
      >
      </VueSlider>
      <button @click="param=true" style="float: left; margin-top: 7px;">Validate parameter choice</button>
    </div>

    <div v-if="param" id="parameters">
      <h3 class="parameters_legends" style="margin-bottom: 5px;">Current parameters:</h3>
      <h5 class="parameters_legends" v-bind="k">k: {{ k }}</h5>
      <h5 class="parameters_legends" v-bind="proportion_reads">Proportion of reads: {{ proportion_reads }}</h5>
      <div style="display: flex; justify-content: flex-start;">
        <button @click="resetAll" style="margin-top: 7px;">Reset parameters</button>
      </div>
    </div>

    <div v-if="param">

      <!-- Mapping tab -->
      <div v-if="tabName=='Mapping'">

        <div v-if="!refProcessed" v-bind='getRootPropsRef()' class="dropzone dropzone-ref">
          <input v-bind='getInputPropsRef()'/>
          <p v-if='isDragActiveRef' class="dropzone-text">Drop the files here ...</p>
          <p v-else class="dropzone-text">Drag and drop your <b>reference fasta file</b> here,
            or click to select a file</p>
        </div>
        <div v-if="refProcessed" class="dropzone dropzone-ref">
          <p class="dropzone-text">✅ Reference indexed: <span class="monospace">{{ refName }}</span></p>
        </div>

        <div v-if="refProcessed" v-bind='getRootPropsQueryMap()' class="dropzone dropzone-query">
          <input v-bind='getInputPropsQueryMap()'/>
          <p v-if='isDragActiveQueryMap' class="dropzone-text">Drop the files here ...</p>
          <p v-else class="dropzone-text">Drag and drop read or assembly <b>files to be mapped</b> here,
            or click to select files</p>
        </div>
        <p v-if="refProcessed" class="count"> Files received: {{ Object.keys(allResults_ska.mapResults).length }}</p>
      </div>

      <!-- Alignment tab -->
      <div v-else-if="tabName=='Alignment'">
        <div v-bind='getRootPropsQueryAlign()' class="dropzone dropzone-query">
          <input v-bind='getInputPropsQueryAlign()'/>
          <p v-if='isDragActiveQueryAlign' class="dropzone-text">Drop the files here ...</p>
          <p v-else class="dropzone-text">Drag and drop read or assembly <b>files to be aligned</b> here,
            or click to select files</p>
        </div>
        <p class="count"> Files received:
          {{ allResults_ska.alignResults[0] ? allResults_ska.alignResults[0].names.length : 0 }}</p>
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

export default defineComponent({
  name: "DropZoneSka",
  props: {
    tabName: {
      type: String,
      required: true
    }
  },
  components: {
    VueSlider
  },
  setup() {
    const store = useStore();
    const k: Ref<number> = ref(31);
    const proportion_reads: Ref<number> = ref(1);
    const param: Ref<boolean> = ref(false);

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
      param.value = false;
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
      param,
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
    }
  },

  methods: {
    clear(): void {
      this.resetAll();
    }
  },
});
</script>

<style>
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
</style>
