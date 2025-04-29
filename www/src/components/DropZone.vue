<template>
    <div>
        <h1>{{tabName}}</h1>
        <div v-if="!param" id="parameters">
            <h3 class="parameters_legends" style="margin-bottom: 5px;">Parameters choice:</h3>
            <h5 class="parameters_legends" v-bind="k">k: {{ k }}</h5>
            <VueSlider 
                v-model="k" 
                :lazy="true" 
                :min="21"
                :max="89"
                :interval="2"
                >
            </VueSlider>
            <h5 class="parameters_legends" v-bind="min_count">Minimum counts for k-mer filtering: {{ min_count }}</h5>
            <VueSlider 
                v-model="min_count"
                :lazy="true" 
                :min="0"
                :max="30"
                :interval="1"
                >
            </VueSlider>
            <h5 class="parameters_legends" v-bind="min_qual">Minimum Illumina read quality: {{ min_qual }}</h5>
            <VueSlider
                v-model="min_qual"
                :lazy="true"
                :min="0"
                :max="33"
                :interval="1"
                >
            </VueSlider>
            <button @click="param=true" style="float: left; margin-top: 7px;">Validate parameter choice</button>
        </div>

        <div v-if="param" id="parameters">
            <h3 class="parameters_legends" style="margin-bottom: 5px;">Current parameters:</h3>
            <h5 class="parameters_legends" v-bind="k">k: {{ k }}</h5>
            <h5 class="parameters_legends" v-bind="min_count">Minimum count for k-mers: {{ min_count }}</h5>
            <h5 class="parameters_legends" v-bind="min_qual">Minimum Illumina quality: {{ min_qual }}</h5>
            <div style="display: flex; justify-content: flex-start;">
                <button @click="resetAll" style="margin-top: 7px;">Reset parameters</button>
            </div>
        </div>

        <div v-if="param">

            <!-- Mapping tab -->
            <div v-if="tabName=='Assembly'">

                <div v-if="!readsProcessed" v-bind='getRootPropsReads()' class="dropzone dropzone-reads">
                    <input v-bind='getInputPropsReads()' />
                    <p v-if='isDragActiveReads' class="dropzone-text">Drop the files here ...</p>
                    <p v-else class="dropzone-text">Drag and drop your <b>paired end fastq read files</b> here,
                        or click to select them</p>
                </div>
                <div v-if="readsProcessed" class="dropzone dropzone-reads">
                    <p class="dropzone-text">✅ Reads assembled!</p>
                </div>

            </div>

        </div>
    </div>
</template>


<script>
import { useDropzone } from "vue3-dropzone";
import { useActions, useState } from "vuex-composition-helpers";
import VueSlider from 'vue-3-slider-component'
import { ref } from "vue";

export default {
    name: "DropZone",
    props:["tabName"],
    components: {
        VueSlider
    },
    setup() {
        let k = ref(31);
        let min_count = ref(5);
        let min_qual = ref(20);
        let param = ref(false);

        const { processReads, resetAllResults } = useActions(["processReads", "resetAllResults"]);
        const { allResults } = useState(["allResults"]);

        function onDropReads(acceptFiles) {
            processReads({acceptFiles : acceptFiles,
                         k            : k.value,
                         min_count    : min_count.value,
                         min_qual     : min_qual.value});
        }

        function resetAll() {
            param.value = false;
            resetAllResults();
        }

        const {
            getRootProps: getRootPropsReads,
            getInputProps: getInputPropsReads,
            isDragActive: isDragActiveReads,
            ...restReads
        } = useDropzone({
            onDrop: onDropReads,
            accept: [".gz", ".fastq", ".fq"],
            multiple: true
        });

        return {
            k,
            min_count,
            min_qual,
            param,
            resetAll,
            getRootPropsReads,
            getInputPropsReads,
            isDragActiveReads,
            onDropReads,
            allResults,
            ...restReads,
        };
    },

    computed: {
        readsProcessed() {
            return this.$store.getters.readsProcessed;
        },
        readsName() {
            return this.$store.getters.readsName;
        }
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

.dropzone-reads {
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
    font-family: 'Courier New', monospace;
}

#parameters {
    margin: 1% 10%;
}

.parameters_legends {
    text-align: left; 
    margin: 0px;
    width: 70%;
}
</style>
