<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-col gap-2">
      Download Assembly
      <Button class="max-w-fit cursor-pointer" variant="outline" size="sm" @click="downloadFASTA">
        .fasta
      </Button>
    </div>
    <div class="flex flex-col gap-2">
      Download De Bruijn graph
      <div class="flex flex-row gap-2">
        <Button class="max-w-fit cursor-pointer" variant="outline" size="sm" @click="downloadDOT">
          .dot
        </Button>
        <Button class="max-w-fit cursor-pointer" variant="outline" size="sm" @click="downloadGFA">
          .gfa
        </Button>
        <Button class="max-w-fit cursor-pointer" variant="outline" size="sm" @click="downloadGFAv2">
          .gfa2
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, Ref} from "vue";
import {useState} from "vuex-composition-helpers";
import type {AllResults} from "@/types";
import {Button} from "@/components/ui/button";

export default defineComponent({
  name: 'DownloadButton',
  setup() {
    const {allResults} = useState(["allResults"]) as { allResults: Ref<AllResults> };

    return {
      allResults
    }
  },
  components: {
    Button
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
