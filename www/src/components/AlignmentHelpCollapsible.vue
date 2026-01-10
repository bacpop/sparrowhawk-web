<template>
  <Collapsible v-model:open="isOpen" class="border border-gray-200 rounded-lg bg-white mb-4">
    <CollapsibleTrigger class="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg">
      <div class="flex items-center gap-2">
        <HelpCircle class="w-4 h-4 text-gray-500" />
        <span class="font-medium text-sm">How to use Alignment</span>
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
              Alignment is a similar task to mapping, but instead of placing subsequences (usually small) in a big reference, you try to align big sequences, usually similar size ones. The motivation for this is to e.g. compare genomes between themselves, leading to studies of evolution, for example.
            </p>

            <div>
              <p class="font-medium text-gray-900 mb-2">Example Files</p>
              <p class="mb-2">There are twelve FASTA files that correspond to assemblies of different bacterial species. You can upload them sequentially, in batches, or all together.</p>
            </div>

            <div>
              <p class="font-medium text-gray-900 mb-2">Quick Start: Escherichia coli assemblies</p>
              <p class="text-sm mb-1">
                Ten (or more) E. coli assemblies from a study of a Tanzanian hospital:
              </p>
              <p class="text-sm">
                <a href="https://www.ebi.ac.uk/ena/browser/view/PRJEB23541" target="_blank" class="text-blue-600 hover:underline">Study: PRJEB23541</a>
              </p>
              <p class="text-xs text-gray-500 mt-1">
                To download: click on each "Accession" value in the table, then click "SET FASTA" on the right.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="workflow">
            <ol class="list-decimal list-outside ml-4 space-y-2">
              <li>User set their parameters.</li>
              <li>User uploads three or more files (FASTA/FASTQ files).</li>
              <li>Alignment is done, and at the end a phylogenetic tree from it can be seen below as well as the alignment downloaded by pressing a button.</li>
            </ol>
          </TabsContent>

          <TabsContent value="parameters">
            <dl class="space-y-3">
              <div>
                <dt class="font-medium text-gray-900">k</dt>
                <dd class="ml-4">Controls the size of the subsequences (k-mers) used to process the reads or assemblies. Similar to that of mapping.</dd>
              </div>
              <div>
                <dt class="font-medium text-gray-900">Proportion of reads</dt>
                <dd class="ml-4">When using reads, this allows to subsample them (making thus the analysis faster). A real number between 0 and 1.</dd>
              </div>
            </dl>
          </TabsContent>

          <TabsContent value="notes">
            <ul class="list-disc list-outside ml-4 space-y-2">
              <li>We currently request 3 sequences for the alignment.</li>
              <li>You can upload files sequentially, in batches, or all together.</li>
              <li>After alignment, you can view a phylogenetic tree and download the results.</li>
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
  name: "AlignmentHelpCollapsible",
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
