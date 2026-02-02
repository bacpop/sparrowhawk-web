<template>
  <div class="flex flex-col gap-2">
    Download gene calls
    <Button class="max-w-fit cursor-pointer" variant="outline" size="sm" @click="downloadGFF">
    .gff
    </Button>
  </div>
</template>


<script lang="ts">
import {defineComponent, Ref} from "vue";
import {useState} from "vuex-composition-helpers";
import type {AllResultsOrphos} from "@/types";
import {Button} from "@/components/ui/button";

export default defineComponent({
  name: 'DownloadButtonOrphos',
  setup() {
    const {allResults_orphos} = useState(["allResults_orphos"]) as { allResults_orphos: Ref<AllResultsOrphos> };

    return {
      allResults_orphos
    }
  },
  components: {
    Button
  },
  methods: {
    downloadGFF() {
        console.log(this.allResults_orphos.outputFile);

        const filename = 'genecalls.gff';
        const element = document.createElement('a');
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.allResults_orphos.outputFile));
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