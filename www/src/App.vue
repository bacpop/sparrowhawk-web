<template>
  <SidebarProvider>
    <Sidebar class="my-3.5 mx-6">
      <SidebarHeader>
        <img src="sparrowhawk_logo.png" alt="Sparrowhawk logo" class="h-20">
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in tabs"
                               :key="item.title"
                               class="py-2.5 px-3">
                <SidebarMenuButton @click="changeTab(item.id)">
                  <component :is="item.icon"/>
                  <span class="text-md">{{ item.label }}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>

    <!-- Main Content -->
    <main class="bg-white mt-6 mb-6 rounded-tl-xl rounded-bl-xl border-2 border-gray-200 border-r-0 flex-1 p-8">
      <div v-if="tabName === 'Assembly'">
        <DropZone :tabName="tabName"/>
        <ResultsDisplayAssembly class="mt-6"/>
        <KmerHistogram class="mt-6"/>
      </div>

      <div v-else-if="tabName === 'TaxonomicID'">
        <DropZoneSketchlib :tabName="tabName"/>
      </div>

      <div v-else-if="tabName === 'Mapping'">
        <DropZoneSka :tabName="tabName"/>
        <ResultsDisplayMapping class="mt-6"/>
      </div>

      <div v-else-if="tabName === 'Alignment'">
        <DropZoneSka :tabName="tabName"/>
        <ResultsDisplayAlignment class="mt-6"/>
      </div>
    </main>
  </SidebarProvider>
</template>

<script>
// eslint-disable-next-line
import {Codesandbox, Map, ScanFace, Spline} from "lucide-vue-next";

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
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";

export default {
  name: 'App',

  components: {
    SidebarHeader,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenu,
    SidebarGroupContent,
    SidebarGroup,
    SidebarContent,
    SidebarProvider,
    SidebarTrigger,
    Codesandbox,
    Map,
    Spline,
    ScanFace,
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
      tabs: [
        {id: 'Assembly', label: 'Assembly', icon: 'Codesandbox'},
        {id: 'Mapping', label: 'Mapping', icon: 'Map'},
        {id: 'Alignment', label: 'Alignment', icon: 'Spline'},
        {id: 'TaxonomicID', label: 'Taxonomic ID', icon: 'ScanFace'}
      ]
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
