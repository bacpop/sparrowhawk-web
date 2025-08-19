<template>
    <div id="app">
        <div id="Header">
            <img src="sparrowhawk_logo.png" alt="Sparrowhawk logo" class="app-logo">
            <div id="tabs">
                <button class="tab" v-on:click="changeTab('Assembly')">Assembly</button>
                <button class="tab" v-on:click="changeTab('Mapping')">Mapping</button>
                <button class="tab" v-on:click="changeTab('Alignment')">Alignment</button>
                <button class="tab" v-on:click="changeTab('TaxonomicID')">Taxonomic ID</button>
            </div>
        </div>

        <div class="Display" v-if="tabName === 'Assembly'">
            <DropZone
                :tabName="tabName"
            />
        </div>
        <div class="Display" v-else-if="tabName === 'TaxonomicID'">
            <DropZoneSketchlib
                :tabName="tabName"
            />
        </div>
        <div class="Display" v-else >
            <DropZoneSka
                :tabName="tabName"
            />
        </div>


        <div class="Display" v-if="tabName === 'Assembly'">
            <ResultsDisplayAssembly />
        </div>
        <div class="Display" v-else-if="tabName === 'Mapping'">
            <ResultsDisplayMapping />
        </div>
        <div class="Display" v-else-if="tabName === 'Alignment'">
            <ResultsDisplayAlignment />
        </div>

        <div class="Display" v-if="tabName === 'Assembly'" style="margin-top: 10px;">
            <KmerHistogram />
        </div>

    </div>
</template>

<script>
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

    export default {
        name: 'App',

        components: {
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

<style>
#app {
/*     font-family: Avenir, Helvetica, Arial, sans-serif; */
    font-family: "IBM Plex Sans";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
/*     color: #2c3e50; */
    color: black;
}

.app-logo {
    float: left;
    height: 100px;
}

#Header {
    height: 100px;
    margin-top: 0px;
}

#tabs {
    float: left;
    margin-left: 30px;
    height: 100%;
    display: flex;
    align-items: center;
}

.tab {
    background-color: #f2f2f2;
    text-align: center;
    font-size: 16px;
    cursor: pointer;
    padding: 14px 16px;
    border: 1px solid black;
    display: inline-block;
    margin-left: 10px;
}

.tab:hover {
    background-color: #ddd;
}

.Display {
    margin: 10px 10%;
}

</style>
