<template>
  <Collapsible v-model:open="isOpen" class="border border-gray-200 rounded-lg bg-white mb-4">
    <CollapsibleTrigger class="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg">
      <div class="flex items-center gap-2">
        <HelpCircle class="w-4 h-4 text-gray-500" />
        <span class="font-medium text-sm">How to use Assembly</span>
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
              Genome assembly consists on recovering a genome (the DNA sequence) from organisms that have been sequenced. Genome sequencing is an experimental method that provides with the raw data needed to later extract the genome sequence. Sparrowhawk, the assembler we have developed, works with one family of technologies called "short read" sequencing. The raw files obtained are in FASTQ (extensions <code class="text-xs bg-gray-100 px-1 rounded">.fq</code>, <code class="text-xs bg-gray-100 px-1 rounded">.fastq</code>, usually) format, that is a text file, and they mostly come in pairs. They contain small subsequences obtained from the original complete genome sequence, alongside some quality information on how confident we are of an individual element of the sequence (or nucleotide) is what it is. Genome assembly is the task of taking this subsequences, and reconstruct (assemble) the original genome. The output is provided in FASTA format (extensions <code class="text-xs bg-gray-100 px-1 rounded">.fa</code>, <code class="text-xs bg-gray-100 px-1 rounded">.fasta</code>, usually), which as FASTQ is a text file, but in this case simpler (no qualities, only two types of lines allowed).
            </p>

            <div>
              <p class="font-medium text-gray-900 mb-2">Example Files</p>
              <ul class="list-disc list-inside space-y-1">
                <li>
                  <code class="text-xs bg-gray-100 px-1 rounded">small_paired_dat*.fq</code> are two cropped fastq files that are small to be used for quick debugging.
                  <a href="/example-files/small_paired_dat1.fq" download class="text-blue-600 hover:underline ml-1">Download dat1</a>,
                  <a href="/example-files/small_paired_dat2.fq" download class="text-blue-600 hover:underline">dat2</a>
                </li>
                <li>
                  <code class="text-xs bg-gray-100 px-1 rounded">paired_dat*.fq</code> are two complete simulations for running it.
                  <a href="/example-files/paired_dat1.fq" download class="text-blue-600 hover:underline ml-1">Download dat1</a>,
                  <a href="/example-files/paired_dat2.fq" download class="text-blue-600 hover:underline">dat2</a>
                </li>
              </ul>
            </div>

            <div>
              <p class="font-medium text-gray-900 mb-2">Quick Start: Mycobacterium tuberculosis reads from ENA</p>
              <p class="text-sm mb-1">
                <a href="https://www.ebi.ac.uk/ena/browser/view/ERR8158023" target="_blank" class="text-blue-600 hover:underline">Record: ERR8158023</a>
              </p>
              <ul class="list-disc list-inside space-y-1">
                <li>
                  <a href="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/ERR815/003/ERR8158023/ERR8158023_1.fastq.gz" class="text-blue-600 hover:underline">ERR8158023_1.fastq.gz</a>
                </li>
                <li>
                  <a href="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/ERR815/003/ERR8158023/ERR8158023_2.fastq.gz" class="text-blue-600 hover:underline">ERR8158023_2.fastq.gz</a>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="workflow">
            <ol class="list-decimal list-outside ml-4 space-y-2">
              <li>User uploads sequencing raw data / fastq files (also called "reads", commonly) by either clicking on a drag&amp;drop area or pressing somewhere that spans a file explorer.</li>
              <li>Preprocessing happens, automatically triggered after upload.</li>
              <li>Preprocessing finishes, showing an interactive plot with the k-mer spectrum (a histogram) and the filtered k-mer area.</li>
              <li>Assembly happens (currently by clicking a button).</li>
              <li>Assembly finishes and allows to download the result as a FASTA file, and also other intermediate graph files as different formats (DOT, GFA, and GFAv2).</li>
            </ol>
          </TabsContent>

          <TabsContent value="parameters">
            <dl class="space-y-3">
              <div>
                <dt class="font-medium text-gray-900">k</dt>
                <dd class="ml-4">Most important factor, controls the size of subsequences used in the algorithm. It is an odd integer that should be between ~21 up until 255 (currently until 89). By default, 31.</dd>
              </div>
              <div>
                <dt class="font-medium text-gray-900">Minimum Illumina read quality</dt>
                <dd class="ml-4">The quality of the input fastq files, it is an integer from zero to 33. By default, 20.</dd>
              </div>
              <div>
                <dt class="font-medium text-gray-900">Minimum counts for k-mer filtering</dt>
                <dd class="ml-4">Another integer for a filtering step, by default 5.</dd>
              </div>
              <div>
                <dt class="font-medium text-gray-900">Automatically set the minimum counts for k-mer filtering</dt>
                <dd class="ml-4">This box does what it says, it automatically disables the slider for the minimum counts. Memory usage could increase.</dd>
              </div>
              <div>
                <dt class="font-medium text-gray-900">Chunk processing size (set zero for no chunking)</dt>
                <dd class="ml-4">A value to be put, by default 150000, anything inputted should be a positive integer (including zero).</dd>
              </div>
              <div>
                <dt class="font-medium text-gray-900">Use Bloom filter for preprocessing</dt>
                <dd class="ml-4">Recommended for non-small reads. This box disables chunking automatically, removing the previous text box.</dd>
              </div>
              <div>
                <dt class="font-medium text-gray-900">Keep dead-ends / Do not collapse bubbles</dt>
                <dd class="ml-4">The last two options are booleans that modify two parameters from the algorithm. They do not affect the rest of the parameters.</dd>
              </div>
            </dl>
          </TabsContent>

          <TabsContent value="notes">
            <ul class="list-disc list-outside ml-4 space-y-2">
              <li>Currently, there are "unknown errors" from wasm that actually are a memory issue error (the wasm-Rust interfaces are currently unable to use 64 bit memory addresses). These are notified by a message when they happen, prompting the user to modify some parameters.</li>
              <li>Files that are not reads (with usual extensions) should not be expected to be uploaded.</li>
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
  name: "AssemblyHelpCollapsible",
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
