<template>
    <div>
        <h1 class="text-2xl font-semibold tracking-tight text-balance">{{tabName}}</h1>
        <div v-if="tabName=='TaxonomicID'">

            <!-- Upload or Loading state -->
            <div v-if="!sampleIdentified && !isIdentifying" v-bind='getRootPropsSample()' class="dropzone dropzone-sample">
                <input v-bind='getInputPropsSample()' />
                <p v-if='isDragActiveSample' class="dropzone-text">Drop one FASTA/FASTQ file or either two FASTQ files here ...</p>
                <p v-else class="dropzone-text">Drag and drop your <b>sample fastq/a file(s)</b> here,
                    or click to select a file</p>
            </div>
            <div v-else-if="isIdentifying" class="dropzone dropzone-sample dropzone-processing">
                <LoadingSpinner message="Identifying sample... (fetching database and processing)" />
            </div>

            <div v-if="sampleIdentified">
                <div style="display: flex; justify-content: flex-start;">
                    <button @click="resetAll" style="margin-top: 7px;">Reset</button>
                </div>
            </div>

            <div v-if="sampleIdentified" class="results-container">
                <h3 class="results-title">Top Matches:</h3>
                <h5 class="id_results" style="margin-top: 3px;">{{ getResultLine(0) }}</h5>
                <h5 class="id_results" style="margin-top: 3px;">{{ getResultLine(1) }}</h5>
                <h5 class="id_results" style="margin-top: 3px;">{{ getResultLine(2) }}</h5>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { useDropzone } from "vue3-dropzone";
import { useActions, useState } from "vuex-composition-helpers";
import LoadingSpinner from './LoadingSpinner.vue';

export default defineComponent({
    name: "DropZoneSketchlib",
    props: {
        tabName: {
            type: String,
            required: true
        }
    },
    components: {
        LoadingSpinner
    },
    setup() {
        const store = useStore();
        const { identifyFiles, resetAllResults_sketchlib } = useActions(["identifyFiles", "resetAllResults_sketchlib"]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { allResults_sketchlib } = useState(["allResults_sketchlib"]) as any;

        function onDropSample(acceptFiles: File[]): void {
            identifyFiles({ acceptFiles: acceptFiles });
        }
        function resetAll(): void {
            resetAllResults_sketchlib();
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function getResultLine(this: any, idres: number): string {
            if (this.allResults_sketchlib.idSpecies == null) {
                return "";
            } else {
                return this.allResults_sketchlib.idSpecies[idres] + " : " + (this.allResults_sketchlib.idProbs[idres] * 100).toFixed() + " % - " + this.allResults_sketchlib.idMetadata[idres];
            }
        }
        const {
            getRootProps: getRootPropsSample,
            getInputProps: getInputPropsSample,
            isDragActive: isDragActiveSample,
            ...restSample
        } = useDropzone({
            onDrop: onDropSample,
            accept: [".fa", ".fasta", ".gz", ".fastq", ".fq"],
            multiple: true
        });

        return {
            resetAll,
            getRootPropsSample,
            getInputPropsSample,
            isDragActiveSample,
            onDropSample,
            getResultLine,
            allResults_sketchlib,
            store,
            ...restSample,
        };
    },
    computed: {
        sampleIdentified(): boolean {
            return this.store.getters.sampleIdentified;
        },
        results(): number | null {
            return this.allResults_sketchlib.idProbs ? this.allResults_sketchlib.idProbs[0] : null;
        },
        isIdentifying(): boolean {
            return this.store.getters.isIdentifying;
        }
    },

    methods: {
        clear(): void {
            this.resetAll();
        }
    },
});
</script>

<style>
    .dropzone {
        border: 2px dotted rgb(56, 55, 55);
        margin: 10%;
        text-align: center;
        vertical-align: middle;
        display: flex;
        align-items: center;
        border-radius: 4px;
        margin-bottom: 5px;
    }

    .dropzone-ref {
        height: 75px;
        margin-top: 20px;
        background-color: rgb(159, 176, 190);
    }

    .dropzone-query {
        height: 75px;
        margin-top: 10px;
        background-color: rgb(221, 249, 226);
    }

    .dropzone-text {
        padding: 30px;
    }

    .monospace {
        font-family: 'IBM Plex Mono', monospace;
    }

    #id_results {
        margin: 1% 10%;
    }

    .id_results {
        text-align: left;
        margin: 0px;
        width: 70%;
    }

    .dropzone-sample {
        height: 100px;
        margin-top: 20px;
        background-color: rgb(200, 220, 240);
    }

    .dropzone-processing {
        background-color: #fef3c7;
        border-color: #f59e0b;
        justify-content: center;
    }

    .dropzone-complete {
        background-color: #d1fae5;
        border-color: #10b981;
    }

    .success-text {
        color: #065f46;
        font-weight: 500;
    }

    .results-container {
        margin: 20px 10%;
        padding: 15px;
        background-color: #f9fafb;
        border-radius: 8px;
    }

    .results-title {
        font-weight: 600;
        margin-bottom: 10px;
        color: #374151;
    }
</style>
