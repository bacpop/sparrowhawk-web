<template>
    <div v-bind:class="queryPreprocessed ? 'isVisible' : 'notVisible'">
<!--     <div> -->
        <div id="plotElement"></div>
    </div>
</template>

<script>
    import { useState }   from "vuex-composition-helpers";
    import { ref }        from "vue";
    import Plotly from 'plotly.js-dist'

    export default {
        name: 'KmerHistogram',

        setup() {

            const { readsPreprocessing } = useState(["readsPreprocessing"]);
            const skip = ref(true);
            const chartLayout = {
                title : "k-mer spectrum"
            }
            return {
                readsPreprocessing,
                chartLayout,
                skip,
            }
        },

        // props: {
        //   // data  : Array,
        //   // layout: Object
        // },

        // mounted() {
        //     this.renderChart();
        // },

        methods: {
            renderChart() {
                console.log("Drawing!");
                // var inputdata;
                // if (this.readsPreprocessing.histo == []) {
                //     inputdata = {
                //         x: this.readsPreprocessing.histo,
                //         type: "histogram",
                //     };
                // } else {
                //     inputdata = {
                //         x: this.readsPreprocessing.histo,
                //         type: "histogram",
                //     };
                // }
                // console.log(this.readsPreprocessing.histo);
                // this.readsPreprocessing.histo.forEach(element => console.log(element));
                var inputdata = [{
                    x      : this.readsPreprocessing.histo,
                    type   : "histogram",
                    marker : {
                        color : "#18974C",
                    },
                }];
                // Plotly.newPlot(this.$refs.plotElement, inputdata, this.chartLayout);
                Plotly.newPlot("plotElement", inputdata, this.chartLayout);
            }
        },

        computed: {
            queryPreprocessed() {
                return this.$store.getters.readsPreprocessed;
            },
        },

        watch: {
            // "allResults.readsPreprocessing.nKmers" : {
            //     handler : function() {
            //         console.log("Trying to do something...");
            //         this.renderChart();
            //     },
            //     deep : true,
            // },
            "queryPreprocessed" : {
                handler : function() {
                    console.log("Trying to do something...");
                    this.renderChart();
                },
                deep : true,
            }
        }
        // watch : {
        //     queryPreprocessed(val) {
        //         if (val) {
        //             console.log("Reads preprocessed, starting the drawing");
        //             console.log(this.readsPreprocessing.histo);
        //             var inputdata = {
        //                 x: this.readsPreprocessing.histo,
        //                 type: "histogram",
        //             };
        //             Plotly.newPlot(this.$refs.plotElement, inputdata, this.chartLayout);
        //             // this.renderChart(inputdata);
        //         }
        //     }
        // }
    }
</script>

<style scoped>
    button {
      font-family: 'IBM Plex sans';
    }

    .isVisible {
        display : block;
    }

    .notVisible {
        display : none;
    }
</style>
