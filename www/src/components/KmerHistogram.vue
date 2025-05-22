<template>
    <div v-bind:class="queryPreprocessed ? 'isVisible' : 'notVisible'">
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

            const { readsPreprocessing, min_count } = useState(["readsPreprocessing", "min_count"]);
            const skip = ref(true);
            return {
                readsPreprocessing,
                min_count,
                skip,
            }
        },

        data() {
            return {
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
            };
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
                var inputdata = [{
                    x      : Array.from({length: 500}, (_, i) => i + 1),
                    y      : this.readsPreprocessing.histo,
                    type   : "bar",
                    marker : {
                        color : "#18974C",
                    },
                }];
                var chartLayout = {
                    title : {text : "k-mer spectrum"},
                    font  : {
                        family : "IBM Plex Sans",
                    },
                    autosize : true,
                    xaxis: {title: {text : "k-mer frequency",
                        },
                        rangemode: 'nonnegative',
                    },
                    yaxis: {title: {text : "Counts",
                        },
                        rangemode: 'nonnegative',
                    },
                    width: .8 * this.windowWidth,
                    shapes: [{
                        type: 'rect',
                        x0: 0,
                        y0: 0,
                        x1: this.min_count + 0.5,
                        y1: 1,
                        xref: "x",
                        yref: "paper",
                        line: {
                            color: '#373A36',
                            width: 1.5,
                            dash: 'dot'
                        },
                        fillcolor: "rgba(55,58,54,0.5)",
                    }],
                };

                Plotly.newPlot("plotElement", inputdata, chartLayout);
            },

            handleWindowSizeChange() {
                // Update data properties with
                // new window dimensions
                this.windowWidth  = window.innerWidth;
                this.windowHeight = window.innerHeight;

                // Additional logic based on
                // window size changes
                console.log('Window dimensions changed:',
                            this.windowWidth,
                            this.windowHeight);

                console.log("Replotting...");
                this.renderChart();
            },
        },

        computed: {
            queryPreprocessed() {
                return this.$store.getters.readsPreprocessed;
            },
        },

        mounted() {
            // Add a global event listener
            // for window resize
            window.addEventListener('resize', this.handleWindowSizeChange);
        },

        beforeUnmount() {
            // Remove the event listener when
            // the component is destroyed
            window.removeEventListener('resize', this.handleWindowSizeChange);
        },

        watch: {
            "queryPreprocessed" : {
                handler : function() {
                    console.log("Trying to do something...");
                    this.renderChart();
                },
                deep : true,
            }
        }
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
