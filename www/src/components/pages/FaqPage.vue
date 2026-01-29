<template>
  <div class="w-1/3">
    <h1 class="text-2xl font-medium mb-4">
      FAQ
    </h1>
  </div>
  <div class="max-w-3/4">
    <h3 class="mt-2 mb-2 font-medium">
      Who is this website for?
    </h3>
    <p class="text-sm">
      Anyone with whole genome sequence data of bacteria who wishes to do genome assembly, sequence mapping and
      alignment, and taxonomic identification from their Internet browser, without installing anything in their computer
      nor using command line software. It is also useful for sensitive data analysis, as everything is run locally and
      nothing leaves your computer. This also makes it applicable for low resource contexts, such as having a bad
      Internet connection, or even not having a laptop at your disposal, as this website can be run in your
      smartphone/tablet browser!
    </p>

    <h3 class="mt-2 mb-2 font-medium">
      What can I do in the "Assembly" tab?
    </h3>
    <p class="text-sm">
      Here you can perform genome assembly of short read sequencing data. You will need your sequencing read files (in
      FASTQ format, compressed or not), that can be single files or paired-end ones (keep in mind that these tools were
      designed for bacterial genomes, so large reads files might not work!). You can then "upload" them (though actually
      you are just loading them into your computer's memory), starting the assembly process. At the end, you can
      "download" (from memory) the final contigs in FASTA format, as well as the intermediate de Bruijn graph in
      different formats. You can check the documentation for more information on what the different parameters do.
    </p>

    <h3 class="mt-2 mb-2 font-medium">
      What can I do in the "Mapping" tab?
    </h3>
    <p class="text-sm">
      Here you can map a sequence (reads or assemblies) or more to a reference one, normally a reference assembly. You
      will need first your reference sequence (in FASTA format, can be compressed), that you can "upload" (load in
      memory) and afterwards you will need to do the same with the sequence(s) you want to map. At the end you can
      download the mapping alignment as a FASTA file and also see it with a viewer below. You can check the
      documentation for more information on what the different parameters do.
    </p>

    <h3 class="mt-2 mb-2 font-medium">What can I do in the "Alignment" tab?</h3>
    <p class="text-sm">
      Here you can align three or more sequences (reads or assemblies) between themselves. After "uploading" (loading
      into memory) them, and after they are processed, you will see a quick phylogenetic tree built from their
      differences. Take into account that the underlying software, ska.rust, is designed to work with small taxonomic
      distances (inside a species), so inputting sequences genomically very different might make the web show absurd
      phylogenetic trees. You can check the documentation for more information on what the different parameters do and
      how this works.
    </p>

    <h3 class="mt-2 mb-2 font-medium">What can I do in the "Taxonomic ID" tab?</h3>
    <p class="text-sm">
      Here you can identify the taxonomic classification at the level of species of bacterial genomic sequences (either
      reads in FASTQ format, or any FASTA sequence). For that, you just need to "upload" (load into memory) your
      sequence files, and you will obtain the three most closest results, with its probability, that the methodology
      obtains for your sequences. You can check the documentation for more information on how this works.
    </p>

    <h3 class="mt-2 mb-2 font-medium">Where can I find information on what parameters to use?</h3>
    <p class="text-sm">
      You can hover over the parameters and get a small description of each one. For a more detailed explanation, you
      can check the website's documentation here (ADD LINK).
    </p>

    <h3 class="mt-2 mb-2 font-medium">Where can I find the code of each method and the website's?</h3>
    <p class="text-sm">
      All the code is fully open-source and you can access it on the following public repositories.
    </p>
    <ul class="">
      <li class="text-sm list-disc ml-5">
        Underlying assembly code: <a target="_blank" href="https://github.com/bacpop/sparrowhawk" class="text-blue-500 underline">https://github.com/bacpop/sparrowhawk</a>
      </li>
      <li class="text-sm list-disc ml-5">
        Underlying mapping and alignment code: <a target="_blank" href="https://github.com/bacpop/ska.rust"
                                                  class="text-blue-500 underline">https://github.com/bacpop/ska.rust</a>
      </li>
      <li class="text-sm list-disc ml-5">
        Underlying taxonomic identification code: <a target="_blank" href="https://github.com/bacpop/sketchlib.rust"
                                                     class="text-blue-500 underline">https://github.com/bacpop/sketchlib.rust</a>
      </li>
      <li class="text-sm list-disc ml-5">
        Website code: <a target="_blank" href="https://github.com/bacpop/sparrowhawk-web" class="text-blue-500 underline">https://github.com/bacpop/sparrowhawk-web</a>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
</script>