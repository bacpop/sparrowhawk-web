<template>
    <div v-if="queryProcessed" class="variants"> 
        <div id="band" style="height: 30px">
            <div v-if="filesUploaded" class="checkbox">
                <input type="checkbox" id="visualisation" @click="reset_zoom" v-model="visualisation"/>
                <label for="visualisation">See visualisation</label>
            </div>
            <div v-if="zoom>8 && visualisation" class="checkbox">
                <input type="checkbox" id="skip" v-model="skip"/>
                <label for="skip">Skip unmapped sequences</label>
            </div>
            <div v-if="zoom>8 && visualisation" class="legend">
                <Popper>
                    <button>?</button>
                    <template #content>
                        <div style="text-align: left;">
                            <b style="color: red; display: inline-block; width: 60px;">A</b> Diffence between the reference and the mapped sequence<br>
                            <b style="display: inline-block; width: 60px;">-</b> Similarity between the reference and the mapped sequence<br>
                            <div style="display: inline-block; width: 60px; font-size: 10px;">Blank space</div> Unmapped nucleotide<br>
                            <b style="display: inline-block; width: 60px;">.......</b> Skipped unmapped fraction of the sequence<br>
                        </div>
                    </template>
                </Popper>
            </div>
            <div v-else-if="visualisation" class="legend">
                <Popper>
                    <button>?</button>
                    <template #content>
                        <div style="text-align: left;">
                            <div class="square" style="background-color: red;"></div> Part of the sequence different to the reference<br>
                            <div class="square" style="background-color: black;"></div> Part of the sequence similar to the reference<br>
                            <div class="square" style="background-color: white;"></div> Part of the sequence not mapped<br>
                        </div>
                    </template>
                </Popper>
            </div>
            <DownloadButtonSka></DownloadButtonSka>
        </div>
        <div v-if="visualisation" id="Slider">
            <VueSlider 
                v-model="zoom" 
                :lazy="true" 
                :min="0"
                :max="20"
                :interval="0.1"
                :tooltip="'none'"
                style="margin: 5px 0;"
                >
            </VueSlider>
        </div>
        <div id="MainView">
            <div v-if="!visualisation" id="table">
                <li v-for="filename in Object.keys(allResults_ska.mapResults)" :key="filename">
                    {{allResults_ska.mapResults[filename]["nb_variants"] !== null ?
                            "File: " + filename + " → Number of variants detected: " +  allResults_ska.mapResults[filename]["nb_variants"] + ", Coverage: " + Math.round(allResults_ska.mapResults[filename]['coverage']*100) + "%"
                            : 'Loading...' }}
                </li>
            </div>
            <div v-else-if="zoom>8" id="FullViewer">
                <SequenceViewer 
                    :zoom_level="zoom"
                    :no_skip="!skip"
                    :key="use_keys([zoom, skip, reloadKey])"> <!-- Reactivity on zoom and skip changes and reload -->
                </SequenceViewer>
            </div>
            <div v-else id="MinimisedViewer">
                <MinimisedSequenceViewer 
                    :zoom_level="zoom"
                    :key="use_keys([zoom, skip, reloadKey])"> <!-- Reactivity on zoom and skip changes and reload -->
                </MinimisedSequenceViewer>
            </div>
        </div>
    </div>
</template>

<script>
import { useState } from "vuex-composition-helpers";
import { ref } from "vue";
import SequenceViewer from "./SequenceViewer/SequenceViewer.tsx";
import VueSlider from 'vue-3-slider-component'
import MinimisedSequenceViewer from "./MinimisedSequenceViewer/MinimisedSequenceViewer.vue";
import Popper from "vue3-popper";
import DownloadButtonSka from "./SequenceViewer/DownloadButtonSka.vue";

export default {
    name: "ResultsDisplayMapping",
    components: {
        SequenceViewer,
        VueSlider,
        MinimisedSequenceViewer,
        Popper,
        DownloadButtonSka
        },
    setup() {
        const { allResults_ska } = useState(["allResults_ska"]);
        const visualisation = ref(false);
        const skip = ref(true);
        const zoom = ref(10);

        return {
            allResults_ska,
            visualisation,
            skip,
            zoom
        }
    },

    watch: {
        'allResults_ska.mapResults': {
            handler() {
                let last_key = Object.keys(this.allResults_ska.mapResults)[Object.keys(this.allResults_ska.mapResults).length-1]
                if (this.allResults_ska.mapResults[last_key]? this.allResults_ska.mapResults[last_key].mapped_sequences.length !== 0: false){
                    this.reloadKey++;
                }
                else {
                    this.zoom = 10;
                    this.visualisation = false;
                }
            },
            deep: true,
        },
    },

    computed: {
        queryProcessed() {
            return this.$store.getters.queryProcessed;
        },
        filesUploaded() {
            let last_key = Object.keys(this.allResults_ska.mapResults)[Object.keys(this.allResults_ska.mapResults).length-1]
            if (this.allResults_ska.mapResults[last_key].mapped_sequences.length !== 0){
                return true;
            }
            return false;
        }
    },

    methods: {
        use_keys(list_of_keys) {
            return list_of_keys.join('-');
        },
        reset_zoom() {
            this.zoom = 10;
        }
    },
    
    data() {
        return {
            reloadKey: 0
        }
    },
};
</script>

<style>
  :root {
    --popper-theme-background-color: lightgray;
    --popper-theme-background-color-hover: lightgray;
    --popper-theme-text-color: black;
    --popper-theme-border-width: 3px;
    --popper-theme-border-style: solid;
    --popper-theme-border-radius: 6px;
    --popper-theme-padding: 5px;
  }

  .checkbox {
    float: left;
    text-align: left;
    margin-right: 20px;
  }

  .legend button {
    background-color: #333333;
    color: white;
    border: none;
    cursor: pointer;
    padding: 5px 10px;
    text-decoration: none;
    font-size: 14px;
    transition-duration: 0.4s;
    border-radius: 100px;
    float: left;
  }

  .legend {
    margin-right: 20px;
    float: left;
  }

  #table {
    float: left;
    text-align: left;
    margin-left: 50px;
  }

  .square {
    height: 15px;
    width: 5px;
    margin-right: 30px;
    float: left;
  }
</style>
