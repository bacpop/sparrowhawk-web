<template>
  <Collapsible v-model:open="isOpen" class="border border-gray-200 rounded-lg bg-white mb-4">
    <CollapsibleTrigger class="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg">
      <div class="flex items-center gap-2">
        <HelpCircle class="w-4 h-4 text-gray-500" />
        <span class="font-medium text-sm">How to use Mapping</span>
      </div>
      <ChevronDown
        class="w-4 h-4 text-gray-500 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </CollapsibleTrigger>

    <CollapsibleContent class="px-3 pb-3">
      <Tabs default-value="overview" class="mt-2">
        <TabsList class="grid w-full grid-cols-4 h-8">
          <TabsTrigger value="overview" class="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="workflow" class="text-xs">Workflow</TabsTrigger>
          <TabsTrigger value="parameters" class="text-xs">Parameters</TabsTrigger>
          <TabsTrigger value="notes" class="text-xs">Notes</TabsTrigger>
        </TabsList>

        <div class="mt-3 text-sm text-gray-600 max-h-64 overflow-y-auto">
          <TabsContent value="overview" class="space-y-4">
            <p>
              Mapping is often used as an alternative way of reconstructing a genome from sequencing raw data. Instead of doing genome assembly, if you have a good, previously assembled, reference genome and you know that the genomes you work with do not vary much between them, you can just map the sequencing raw data/reads (FASTQ files) to the reference, where by "map" we refer to place each raw subsequence in some location of the reference genome, noting down those entries/nucleotides that might be different.
            </p>

            <div>
              <p class="font-medium text-gray-900 mb-2">Example Files</p>
              <ul class="list-disc list-inside space-y-1">
                <li>
                  You can use both the small cropped files, and the normal size ones from the assembly test files as run files for the mapping.
                </li>
                <li>
                  <code class="text-xs bg-gray-100 px-1 rounded">GCA_900618555.1.fasta</code> is the original genome, that should deviate little from the sequences, and you can use as reference.
                  <a href="/example-files/GCA_900618555.1.fasta" download class="text-blue-600 hover:underline ml-1">Download</a>
                </li>
              </ul>
            </div>

            <div>
              <p class="font-medium text-gray-900 mb-2">Quick Start: Mycobacterium tuberculosis</p>
              <div class="space-y-2">
                <div>
                  <p class="text-sm font-medium">Reference (main M. tuberculosis reference):</p>
                  <p class="text-sm">
                    <a href="https://www.ebi.ac.uk/ena/browser/view/GCA_000195955.2" target="_blank" class="text-blue-600 hover:underline">Record: GCA_000195955.2</a>
                  </p>
                  <ul class="list-disc list-inside">
                    <li>
                      <a href="https://www.ebi.ac.uk/ena/browser/api/fasta/GCA_000195955.2?download=true&gzip=true" class="text-blue-600 hover:underline">Download FASTA</a>
                    </li>
                  </ul>
                </div>
                <div>
                  <p class="text-sm font-medium">Files to map (different M. tuberculosis reads):</p>
                  <p class="text-sm">
                    <a href="https://www.ebi.ac.uk/ena/browser/view/ERR8158023" target="_blank" class="text-blue-600 hover:underline">Record: ERR8158023</a>
                  </p>
                  <ul class="list-disc list-inside">
                    <li>
                      <a href="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR309/027/SRR30941327/SRR30941327_1.fastq.gz" class="text-blue-600 hover:underline">SRR30941327_1.fastq.gz</a>
                    </li>
                    <li>
                      <a href="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR309/027/SRR30941327/SRR30941327_2.fastq.gz" class="text-blue-600 hover:underline">SRR30941327_2.fastq.gz</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workflow">
            <ol class="list-decimal list-outside ml-4 space-y-2">
              <li>User set their parameters.</li>
              <li>User uploads a reference genome (FASTA file).</li>
              <li>User uploads other sequences, either as reads (FASTQ files) or other DNA sequences (FASTA files).</li>
              <li>Processing is done, and later a visualisation of the mapping can be seen by activating the tickbox. Also, the alignment of the secondly uploaded sequences vs the reference can be downloaded by clicking a button.</li>
            </ol>
          </TabsContent>

          <TabsContent value="parameters">
            <dl class="space-y-3">
              <div>
                <dt class="font-medium text-gray-900">k</dt>
                <dd class="ml-4">Controls the size of the subsequences (k-mers) used to process the reads or assemblies. Similar to that of the assembly, but in this case only up until 63.</dd>
              </div>
              <div>
                <dt class="font-medium text-gray-900">Proportion of reads</dt>
                <dd class="ml-4">When using reads, this allows to subsample them (making thus the analysis faster). A real number between 0 and 1.</dd>
              </div>
            </dl>
          </TabsContent>

          <TabsContent value="notes">
            <ul class="list-disc list-outside ml-4 space-y-2">
              <li>Upload a reference genome first, then upload the sequences you want to map to it.</li>
              <li>You can map both reads (FASTQ) and assembled sequences (FASTA) to the reference.</li>
            </ul>
          </TabsContent>
        </div>
      </Tabs>
    </CollapsibleContent>
  </Collapsible>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { HelpCircle, ChevronDown } from "lucide-vue-next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default defineComponent({
  name: "MappingHelpCollapsible",
  components: {
    HelpCircle,
    ChevronDown,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  },
  setup() {
    const isOpen = ref(false);
    return { isOpen };
  },
});
</script>
