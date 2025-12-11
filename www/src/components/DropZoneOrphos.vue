<template>
    <div>
        <h1>{{tabName}}</h1>
        <div v-if="tabName=='GeneCalling'">

            <div v-if="!genesCalled" v-bind='getRootPropsGenome()' class="dropzone dropzone-sample">
                <input v-bind='getInputPropsGenome()' />
                <p v-if='isDragActiveGenome' class="dropzone-text">Drop one FASTA file here ...</p>
                <p v-else class="dropzone-text">Drag and drop your <b>sample FASTA file</b> here,
                    or click to select a file</p>
            </div>
            <div v-if="genesCalled" class="dropzone dropzone-sample">
                <p class="dropzone-text">✅ Genes annotated</p>
            </div>

            <div v-if="genesCalled">
                <div style="display: flex; justify-content: flex-start;">
                    <button @click="resetAll" style="margin-top: 7px;">Reset</button>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
import { useDropzone } from "vue3-dropzone";
import { useActions, useState } from "vuex-composition-helpers";

export default {
    name: "DropZoneOrphos",
    props:["tabName"],
    setup() {
        const { callGenes, resetAllResults_orphos } = useActions(["callGenes", "resetAllResults_orphos"]);
        const { allResults_orphos } = useState(["allResults_orphos"]);

        function onDropGenome(acceptFiles) {
            callGenes({acceptFiles: acceptFiles});
        }
        function resetAll() {
            resetAllResults_orphos();
        }
        const {
            getRootProps: getRootPropsGenome,
            getInputProps: getInputPropsGenome,
            isDragActive: isDragActiveGenome,
            ...restGenome
        } = useDropzone({
            onDrop: onDropGenome,
            accept: [".fa", ".fasta", ".gz"],
            multiple: false
        });

        return {
            resetAll,
            getRootPropsGenome,
            getInputPropsGenome,
            isDragActiveGenome,
            onDropGenome,
            allResults_orphos,
            ...restGenome,
        };
    },
    computed: {
        genesCalled() {
            return this.$store.getters.genesCalled;
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
