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
            <h5 class="parameters_legends" v-if="!do_bloom" v-bind="csize" style="margin-top: 3px;">Chunk processing size (set zero for no chunking): {{ csize }}</h5>
            <input type="text" v-if="!do_bloom" v-model.number.trim="csize" style="float: right; margin-top: -18px;">
            <h5 class="parameters_legends" v-bind="do_bloom" style="margin-top: 3px;">Use Bloom filter for preprocessing (recommended for non-small reads; chunking will be disabled): {{ do_bloom }}</h5>

            <input type="checkbox" id="checkbox" v-model="do_bloom" style="float: right; margin-top: -8px;"/>

            <button @click="param=true" style="float: left; margin-top: 7px;">Validate parameter choice</button>
        </div>

        <div v-if="param" id="parameters">
            <h3 class="parameters_legends" style="margin-bottom: 5px;">Current parameters:</h3>
            <h5 class="parameters_legends" v-bind="k">k: {{ k }}</h5>
            <h5 class="parameters_legends" v-bind="min_count">Minimum count for k-mers: {{ min_count }}</h5>
            <h5 class="parameters_legends" v-bind="min_qual">Minimum Illumina quality: {{ min_qual }}</h5>
            <h5 class="parameters_legends" v-bind="csize" v-if="!do_bloom">Chunk processing size: {{ csize }}</h5>
            <h5 class="parameters_legends" v-bind="do_bloom">Use Bloom filter: {{ do_bloom }}</h5>
            <div style="display: flex; justify-content: flex-start;">
                <button @click="resetAll" style="margin-top: 7px;">Reset parameters</button>
            </div>
        </div>

        <h5 class="memory_error_message" v-if="errorInProcessing">Error found while processing! It is most surely a memory issue: try increasing the chunking, or using a Bloom filter</h5>

        <div v-if="param">

            <!-- Assembly tab -->
            <div v-if="tabName=='Assembly'">

                <div v-if="!readsProcessed && !readsProcessing" v-bind='getRootPropsReads()' class="dropzone dropzone-reads">
                    <input v-bind='getInputPropsReads()' />
                    <p v-if='isDragActiveReads' class="dropzone-text">Drop the files here ...</p>
                    <p v-else class="dropzone-text">Drag and drop your <b>paired end fastq read files</b> here,
                        or click to select them</p>
                </div>

                <div v-else-if="!readsProcessed && readsProcessing" class="dropzone dropzone-reads">
                    <p v-if="readsPreprocessing" class="dropzone-text">Preprocessing reads...</p>
                    <p v-else-if="!assemblying" class="dropzone-text">Reads {{ readsName }} preprocessed.</p>
                    <p v-else class="dropzone-text">Assemblying...</p>
                </div>

                <div v-else class="dropzone dropzone-reads">
                    <p class="dropzone-text">✅ Reads assembled!</p>
                </div>
            </div>
        </div>
    </div>
    <button @click="doAss" v-if='readsPreprocessed && !readsProcessed' style="float: center; margin-top: 10px;"><b>Start assembly</b></button>
</template>


<script>
    import { useDropzone } from "vue3-dropzone";
    import { useActions, useState } from "vuex-composition-helpers";
    import VueSlider from 'vue-3-slider-component'
    import { ref } from "vue";
    import "@fontsource/ibm-plex-mono";


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
            let csize = ref(150000);
            let do_bloom = ref(false);
            let param = ref(false);
            let assemblying = ref(false);

            const { processReads, doTheAssembly, resetAllResults, removeErrors } = useActions(["processReads", "doTheAssembly", "resetAllResults", "removeErrors"]);
            const { allResults } = useState(["allResults"]);


            function onDropReads(acceptFiles) {
                processReads({acceptFiles : acceptFiles,
                             k            : k.value,
                             min_count    : min_count.value,
                             min_qual     : min_qual.value,
                             csize        : csize.value,
                             do_bloom     : do_bloom.value,
                });
            }

            function doAss () {
                assemblying.value = true;
                doTheAssembly();
            }

            function resetAll() {
                param.value = false;
                assemblying.value = false;
                do_bloom.value = false;
                k.value = 31;
                min_count.value = 5;
                min_qual.value = 20;
                csize.value = 0;
                resetAllResults();
                removeErrors();
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
                csize,
                do_bloom,
                param,
                assemblying,
                resetAll,
                doAss,
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
                return this.$store.getters.queryAssembled;
            },
            readsProcessing() {
                return this.$store.getters.readsProcessing;
            },
            readsPreprocessed() {
                return this.$store.getters.readsPreprocessed;
            },
            readsPreprocessing() {
                return this.$store.getters.readsPreprocessing;
            },
            errorInProcessing() {
                return this.$store.getters.getErrors;
            },
            readsName() {
                return this.$store.getters.readsName;
            }
        },

        methods: {
            clear() {
                resetAll()
            },

            doAssembly() {
                doAss()
            },


        },

        watch: {
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
    /*     font-family: 'Courier New', monospace; */
        font-family: "IBM Plex mono";
    }

    #parameters {
        margin: 1% 10%;
    }

    .parameters_legends {
        text-align: left;
        margin: 0px;
        width: 70%;
    }

    .memory_error_message {
        text-align : center;
        color      : #D41645;
    }

    button {
      font-family: 'IBM Plex sans';
    }

</style>
