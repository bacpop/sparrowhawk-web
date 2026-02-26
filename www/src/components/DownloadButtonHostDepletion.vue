<template>
  <Button @click="download" class="mt-4" variant="outline">
    <Download class="w-4 h-4 mr-2" />
    Download filtered reads (.fastq.gz)
  </Button>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-vue-next";
export default defineComponent({
  name: "DownloadButtonHostDepletion",
  components: { Button, Download },
  setup() {
    const store = useStore();
    function download() {
      const content: Uint8Array | null = store.state.allResults_deacon.outputGzip;
      if (!content) return;
      const base = (store.state.allResults_deacon.readsFileName ?? "filtered")
                     .replace(/\.(fastq|fq)(\.gz)?$/, '');
      const uint8arr = new Uint8Array(content)
      const blob = new Blob([uint8arr], { type: "application/gzip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = base + "_filtered.fastq.gz"; a.click();
      URL.revokeObjectURL(url);
    }
    return { download };
  }
});
</script>
