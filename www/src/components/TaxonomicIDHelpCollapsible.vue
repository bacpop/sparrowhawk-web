<template>
  <Collapsible v-model:open="isOpen" class="border border-gray-200 rounded-lg bg-white mb-4">
    <CollapsibleTrigger class="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg">
      <div class="flex items-center gap-2">
        <HelpCircle class="w-4 h-4 text-gray-500" />
        <span class="font-medium text-sm">How to use Taxonomic ID</span>
      </div>
      <ChevronDown
        class="w-4 h-4 text-gray-500 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </CollapsibleTrigger>

    <CollapsibleContent class="px-3 pb-3">
      <Tabs default-value="overview" class="mt-2">
        <TabsList class="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="overview" class="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="workflow" class="text-xs">Workflow</TabsTrigger>
          <TabsTrigger value="notes" class="text-xs">Notes</TabsTrigger>
        </TabsList>

        <div class="mt-3 text-sm text-gray-600 max-h-64 overflow-y-auto">
          <TabsContent value="overview" class="space-y-4">
            <p>
              We call taxonomic identification, in this "genomics" context, to assign a taxonomic category (i.e. a life organism classification), usually the species, to a genome. This is broadly done by comparing an assembled genome, or even reads, to a preknown database of genomes, whose species are known.
            </p>

            <div>
              <p class="font-medium text-gray-900 mb-2">Example Files</p>
              <p class="mb-2">There are various genomes (FASTAs), whose actual species can be seen in the file names.</p>
            </div>

            <div>
              <p class="font-medium text-gray-900 mb-2">Quick Start: Klebsiella pneumoniae assembly</p>
              <p class="text-sm">
                <a href="https://www.ebi.ac.uk/ena/browser/view/GCA_004138665.1" target="_blank" class="text-blue-600 hover:underline">Record: GCA_004138665.1</a>
              </p>
              <ul class="list-disc list-inside mt-1">
                <li>
                  <a href="https://www.ebi.ac.uk/ena/browser/api/fasta/GCA_004138665.1?download=true&gzip=true" class="text-blue-600 hover:underline">Download FASTA</a>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="workflow">
            <ol class="list-decimal list-outside ml-4 space-y-2">
              <li>User uploads a genome file.</li>
              <li>Taxonomic ID happens by calling the Rust code/wasm module.</li>
              <li>ID is done by showing the most probable candidates, from the known database.</li>
            </ol>
          </TabsContent>

          <TabsContent value="notes">
            <ul class="list-disc list-outside ml-4 space-y-2">
              <li>Upload one FASTA/FASTQ file or two paired FASTQ files.</li>
              <li>The system will compare your genome against a known database of species.</li>
              <li>Results show the most probable taxonomic matches with confidence percentages.</li>
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
  name: "TaxonomicIDHelpCollapsible",
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
