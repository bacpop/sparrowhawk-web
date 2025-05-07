<template>
    <div v-if="queryAssembled" class="variants">
        <div id="band" style="height: 30px">
            <DownloadButton></DownloadButton>
        </div>
    </div>
</template>

<script>
import { useState }   from "vuex-composition-helpers";
import { ref }        from "vue";
import DownloadButton from "./DownloadButton.vue";

export default {
    name: "ResultsDisplayAssembly",
    components: {
        DownloadButton
        },
    setup() {
        const { allResults } = useState(["allResults"]);
        const skip = ref(true);

        return {
            allResults,
            skip,
        }
    },

    watch: {
        'allResults.mapResults': {
            handler() {
                let last_key = Object.keys(this.allResults.mapResults)[Object.keys(this.allResults.mapResults).length-1]
                if (this.allResults.mapResults[last_key]? this.allResults.mapResults[last_key].mapped_sequences.length !== 0: false){
                    this.reloadKey++;
                }
            },
            deep: true,
        },
    },

    computed: {
        queryAssembled() {
            return this.$store.getters.queryAssembled;
        },
    },

    methods: {
        use_keys(list_of_keys) {
            return list_of_keys.join('-');
        },
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
