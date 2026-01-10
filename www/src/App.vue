<template>
  <SidebarProvider>
    <Sidebar class="my-3.5 mx-6 min-w-[185px] flex flex-col">
      <SidebarHeader>
        <img src="sparrowhawk-transparent.png" alt="Sparrowhawk" class="h-[120px] w-fit">
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in tabs"
                               :key="item.title"
                               :class="item.id === tabName ? 'bg-white rounded-sm shadow-sm' : ''"
                               class="py-2 px-3 cursor-pointer">
                <SidebarMenuButton @click="changeTab(item.id)" class="p-0 hover:bg-transparent cursor-pointer">
                  <component :is="item.icon"/>
                  <span class="text-md">
                    {{ item.label }}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div class="flex flex-col opacity-80">
          <Button variant="link" size="sm" class="cursor-pointer items-center justify-start p-0"
                  @click="changeTab('faq')">
            FAQ
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>

    <!-- Main Content -->
    <main class="bg-white mt-6 mb-6 rounded-tl-xl rounded-bl-xl border border-gray-200 border-r-0 flex-1 p-8">
      <div v-if="tabName === 'Assembly'">
        <AssemblyPage :tabName="tabName">
          <KmerHistogram class="mt-6"/>
        </AssemblyPage>
      </div>

      <div v-else-if="tabName === 'TaxonomicID'">
        <TaxonomicIDPage :tabName="tabName"/>
      </div>

      <div v-else-if="tabName === 'Mapping'">
        <MappingAlignmentPage :tabName="tabName">
          <template #mapping>
            <ResultsDisplayMapping class="mt-6"/>
          </template>
        </MappingAlignmentPage>
      </div>

      <div v-else-if="tabName === 'Alignment'">
        <MappingAlignmentPage :tabName="tabName">
          <template #alignment>
            <ResultsDisplayAlignment class="mt-6"/>
          </template>
        </MappingAlignmentPage>
      </div>

      <div v-else-if="tabName === 'faq'">
        <FaqPage/>
      </div>
    </main>
  </SidebarProvider>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useStore} from 'vuex';
// eslint-disable-next-line
import {Codesandbox, Map, ScanFace, Spline} from "lucide-vue-next";

import AssemblyPage from './components/pages/AssemblyPage.vue';
import MappingAlignmentPage from './components/pages/MappingAlignmentPage.vue';
import TaxonomicIDPage from './components/pages/TaxonomicIDPage.vue';
import ResultsDisplayMapping from './components/ResultsDisplayMapping.vue';
import ResultsDisplayAlignment from './components/ResultsDisplayAlignment.vue';
import KmerHistogram from './components/KmerHistogram.vue';
import WorkerAssembler from '@/workers/Assembler.worker';
import WorkerMapper from '@/workers/Mapper.worker';
import WorkerSketcher from '@/workers/Sketcher.worker';
import "@fontsource/ibm-plex-sans";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import {Button} from "@/components/ui/button";
import FaqPage from "@/components/pages/FaqPage.vue";

interface Tab {
  id: string;
  label: string;
  icon: string;
}

export default defineComponent({
  name: 'App',

  components: {
    FaqPage,
    SidebarFooter,
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
    AssemblyPage,
    MappingAlignmentPage,
    TaxonomicIDPage,
    KmerHistogram,
    ResultsDisplayMapping,
    ResultsDisplayAlignment,
    Button
  },

  setup() {
    const store = useStore();
    return {store};
  },

  data() {
    return {
      tabName: 'Assembly' as string,
      tabs: [
        {id: 'Assembly', label: 'Assembly', icon: 'Codesandbox'},
        {id: 'Mapping', label: 'Mapping', icon: 'Map'},
        {id: 'Alignment', label: 'Alignment', icon: 'Spline'},
        {id: 'TaxonomicID', label: 'Taxonomic ID', icon: 'ScanFace'}
      ] as Tab[]
    }
  },

  mounted(): void {
    // Set initial tab from URL hash
    const hash = window.location.hash.slice(1); // Remove the '#'
    const validTabs = this.tabs.map(t => t.id).concat(['faq']);
    if (hash && validTabs.includes(hash)) {
      this.tabName = hash;
    } else {
      // Set default hash if none or invalid
      window.location.hash = this.tabName;
    }

    // Listen for back/forward navigation
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.slice(1);
      if (newHash && validTabs.includes(newHash)) {
        this.tabName = newHash;
      }
    });

    console.log("Loading wasm modules in workers...")

    import("@/pkg")
        .then(() => {
          if (window.Worker) {
            const worker = new WorkerAssembler();
            this.store.commit('SET_WORKER', worker);
          } else {
            throw new Error("WebWorkers are not supported by this web browser.");
          }
        });
    import("@/pkg_ska")
        .then(() => {
          if (window.Worker) {
            const worker = new WorkerMapper();
            this.store.commit('SET_WORKER_SKA', worker);
          } else {
            throw new Error("WebWorkers are not supported by this web browser.");
          }
        });
    import("@/pkg_sketchlib")
        .then(() => {
          if (window.Worker) {
            const worker = new WorkerSketcher();
            this.store.commit('SET_WORKER_SKETCHLIB', worker);
          } else {
            throw new Error("WebWorkers are not supported by this web browser.");
          }
        });
  },

  methods: {
    changeTab(tab: string): void {
      this.tabName = tab;
      window.location.hash = tab;
    }
  }
});

</script>
