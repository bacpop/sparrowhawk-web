<template>
    <div>
        <h1>{{tabName}}</h1>
        <div v-if="tabName=='TaxonomicID'">

            <div v-if="!sampleIdentified" v-bind='getRootPropsSample()' class="dropzone dropzone-sample">
                <input v-bind='getInputPropsSample()' />
                <p v-if='isDragActiveSample' class="dropzone-text">Drop one FASTA/FASTQ file or either two FASTQ files here ...</p>
                <p v-else class="dropzone-text">Drag and drop your <b>sample fastq/a file(s)</b> here,
                    or click to select a file</p>
            </div>
            <div v-if="sampleIdentified" class="dropzone dropzone-sample">
                <p class="dropzone-text">✅ Sample identified</p>
            </div>

            <div v-if="sampleIdentified">
                Probabilities:
                <br>
<!--                <h5 class="id_results" style="margin-top: 3px;">Mycobacterium tuberculosis: {{ allResults_sketchlib.idResults[0] }}</h5>
                <h5 class="id_results" style="margin-top: 3px;">Staphylococcus aureus: {{ allResults_sketchlib.idResults[1] }}</h5>
                <h5 class="id_results" style="margin-top: 3px;">Escherichia coli: {{ allResults_sketchlib.idResults[2] }}</h5>
                <h5 class="id_results" style="margin-top: 3px;">Streptomyces avermitilis: {{ allResults_sketchlib.idResults[3] }}</h5>
                <h5 class="id_results" style="margin-top: 3px;">Streptococcus pneumoniae: {{ allResults_sketchlib.idResults[4] }}</h5>
                <h5 class="id_results" style="margin-top: 3px;">Neisseria meningitidis: {{ allResults_sketchlib.idResults[5] }}</h5>-->
                <h5 class="id_results" style="margin-top: 3px;">Mycobacterium tuberculosis: {{ results }}</h5>
<!--                <h5 class="id_results" style="margin-top: 3px;">Staphylococcus aureus: {{ results[1] }}</h5>
                <h5 class="id_results" style="margin-top: 3px;">Escherichia coli: {{ results[2] }}</h5>
                <h5 class="id_results" style="margin-top: 3px;">Streptomyces avermitilis: {{ results[3] }}</h5>
                <h5 class="id_results" style="margin-top: 3px;">Streptococcus pneumoniae: {{ results[4] }}</h5>
                <h5 class="id_results" style="margin-top: 3px;">Neisseria meningitidis: {{ results[5] }}</h5>-->

            </div>
        </div>
    </div>
</template>

<script>
import { useDropzone } from "vue3-dropzone";
import { useActions, useState } from "vuex-composition-helpers";
import { ref } from "vue";

export default {
    name: "DropZoneSketchlib",
    props:["tabName"],
    setup() {

        const { identifyFiles, resetAllResults_sketchlib } = useActions(["identifyFiles", "resetAllResults_sketchlib"]);
        const { allResults_sketchlib } = useState(["allResults_sketchlib"]);

        function onDropSample(acceptFiles) {
            identifyFiles({acceptFiles: acceptFiles});
        }
        function resetAll() {
            resetAllResults_sketchlib();
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
            allResults_sketchlib,
            ...restSample,
        };
    },
    computed: {
        sampleIdentified() {
            return this.$store.getters.sampleIdentified;
        },
        results() {
            return this.allResults_sketchlib.idResults[0];
        },
    },

    methods: {
        clear() {
            resetAll()
        }
    },

};
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
</style>
