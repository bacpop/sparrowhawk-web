<template>
  <div id="app">
    <div id="Header">
      <img src="sparrowhawk_logo.png" alt="Sparrowhawk logo" class="h-[100px]">
      <div id="tabs">
        <VoltButton label="Assembly" class="tab" v-on:click="changeTab('Assembly')"/>
        <VoltButton label="Mapping" class="tab" v-on:click="changeTab('Mapping')"/>
        <VoltButton label="Alignment" class="tab" v-on:click="changeTab('Alignment')"/>
        <VoltButton label="ID" class="tab" v-on:click="changeTab('TaxonomicID')"/>
      </div>
    </div>

    <div class="Display" v-if="tabName === 'Assembly'">
      <DropZone :tabName="tabName"/>
    </div>
    <div class="Display" v-else-if="tabName === 'TaxonomicID'">
      <DropZoneSketchlib :tabName="tabName"/>
    </div>
    <div class="Display" v-else>
      <DropZoneSka :tabName="tabName"/>
    </div>


    <div class="Display" v-if="tabName === 'Assembly'">
      <ResultsDisplayAssembly/>
    </div>
    <div class="Display" v-else-if="tabName === 'Mapping'">
      <ResultsDisplayMapping/>
    </div>
    <div class="Display" v-else-if="tabName === 'Alignment'">
      <ResultsDisplayAlignment/>
    </div>

    <div class="Display" v-if="tabName === 'Assembly'" style="margin-top: 10px;">
      <KmerHistogram/>
    </div>

  </div>
</template>

<script>
import VoltButton from "@/volt/VoltButton.vue";

import DropZone from './components/DropZone.vue';
import DropZoneSka from './components/DropZoneSka.vue';
import DropZoneSketchlib from './components/DropZoneSketchlib.vue';
import ResultsDisplayAssembly from './components/ResultsDisplayAssembly.vue';
import ResultsDisplayMapping from './components/ResultsDisplayMapping.vue';
import ResultsDisplayAlignment from './components/ResultsDisplayAlignment.vue';
import KmerHistogram from './components/KmerHistogram.vue';
import WorkerAssembler from '@/workers/Assembler.worker.js';
import WorkerMapper from '@/workers/Mapper.worker.js';
import WorkerSketcher from '@/workers/Sketcher.worker.js';
import "@fontsource/ibm-plex-sans";

export default {
  name: 'App',

  components: {
    VoltButton,
    DropZone,
    DropZoneSka,
    DropZoneSketchlib,
    ResultsDisplayAssembly,
    KmerHistogram,
    ResultsDisplayMapping,
    ResultsDisplayAlignment
  },

  data() {
    return {
      tabName: 'Assembly',
    }
  },

  mounted: function () {
    console.log("Loading wasm modules in workers...")

    import("@/pkg")
        .then(() => {
          if (window.Worker) {
            const worker = new WorkerAssembler();
            this.$store.commit('SET_WORKER', worker);
          } else {
            throw "WebWorkers are not supported by this web browser.";
          }
        });
    import("@/pkg_ska")
        .then(() => {
          if (window.Worker) {
            const worker = new WorkerMapper();
            this.$store.commit('SET_WORKER_SKA', worker);
          } else {
            throw "WebWorkers are not supported by this web browser.";
          }
        });
    import("@/pkg_sketchlib")
        .then(() => {
          if (window.Worker) {
            const worker = new WorkerSketcher();
            this.$store.commit('SET_WORKER_SKETCHLIB', worker);
          } else {
            throw "WebWorkers are not supported by this web browser.";
          }
        });

    return;
  },

  methods: {
    changeTab: function (tab) {
      this.tabName = tab;
    }
  }
}

</script>
