<template>
  <div>
    <button @click="downloadFASTA" id="Download">Download assembly as .fasta</button>
  </div>
  <div>
    <button @click="downloadDOT" id="Download">Download de Bruijn graph as .dot</button>
  </div>
  <div>
    <button @click="downloadGFA" id="Download">Download de Bruijn graph as .gfa</button>
  </div>
  <div>
    <button @click="downloadGFAv2" id="Download">Download de Bruijn graph as .gfa2</button>
  </div>
</template>

<script lang="ts">
import {defineComponent, Ref} from "vue";
import {useState} from "vuex-composition-helpers";
import type {AllResults} from "@/types";

export default defineComponent({
  name: 'DownloadButton',
  setup() {
    const {allResults} = useState(["allResults"]) as { allResults: Ref<AllResults> };

    return {
      allResults
    }
  },
  methods: {
    downloadFASTA(): void {
      console.log(this.allResults.fastaOutput);

      const filename = 'assembly.fasta';
      const element = document.createElement('a');
      element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.allResults.fastaOutput));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);
    },

    downloadDOT(): void {
      console.log(this.allResults.dotOutput);

      const filename = 'graph.dot';
      const element = document.createElement('a');
      element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.allResults.dotOutput));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);
    },

    downloadGFA(): void {
      console.log(this.allResults.gfaOutput);

      const filename = 'graph.gfa';
      const element = document.createElement('a');
      element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.allResults.gfaOutput));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);
    },

    downloadGFAv2(): void {
      console.log(this.allResults.gfav2Output);

      const filename = 'graph.gfa2';
      const element = document.createElement('a');
      element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.allResults.gfav2Output));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);
    },
  }
});
</script>

<style scoped>
#Download {
  float: left;
}
</style>
