<template>
    <div v-bind:class="queryPreprocessed ? 'isVisible' : 'notVisible'">
        <div id="plotElement"></div>
    </div>
</template>

<script lang="ts">
    import { defineComponent, ref, Ref } from "vue";
    import { useStore } from "vuex";
    import { useState } from "vuex-composition-helpers";
    // @ts-ignore - plotly.js-dist doesn't have types
    import Plotly from 'plotly.js-dist';

    export default defineComponent({
        name: 'KmerHistogram',

        setup() {
            const store = useStore();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { readsPreprocessing } = useState(["readsPreprocessing"]) as any;
            const skip: Ref<boolean> = ref(true);
            return {
                readsPreprocessing,
                skip,
                store
            }
        },

        data() {
            return {
                windowWidth: window.innerWidth as number,
                windowHeight: window.innerHeight as number,
            };
        },

        methods: {
            renderChart(): void {
                console.log("Drawing!");
                const inputdata = [{
                    x: Array.from({ length: 500 }, (_, i) => i + 1),
                    y: this.readsPreprocessing.histo,
                    type: "bar",
                    marker: {
                        color: "#18974C",
                    },
                }];
                const chartLayout = {
                    title: { text: "k-mer spectrum" },
                    font: {
                        family: "IBM Plex Sans",
                    },
                    autosize: true,
                    xaxis: {
                        title: { text: "k-mer frequency" },
                        rangemode: 'nonnegative',
                    },
                    yaxis: {
                        title: { text: "Counts" },
                        rangemode: 'nonnegative',
                    },
                    width: .8 * this.windowWidth,
                    shapes: [{
                        type: 'rect',
                        x0: 0,
                        y0: 0,
                        x1: (this.readsPreprocessing.used_min_count || 0) + 0.5,
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

                Plotly.newPlot("plotElement", inputdata, chartLayout as Partial<Plotly.Layout>);
            },

            handleWindowSizeChange(): void {
                this.windowWidth = window.innerWidth;
                this.windowHeight = window.innerHeight;

                console.log('Window dimensions changed:',
                    this.windowWidth,
                    this.windowHeight);

                console.log("Replotting...");
                this.renderChart();
            },
        },

        computed: {
            queryPreprocessed(): boolean {
                return this.store.getters.readsPreprocessed;
            },
        },

        mounted(): void {
            window.addEventListener('resize', this.handleWindowSizeChange);
        },

        beforeUnmount(): void {
            window.removeEventListener('resize', this.handleWindowSizeChange);
        },

        watch: {
            queryPreprocessed: {
                handler(): void {
                    console.log("Trying to do something...");
                    this.renderChart();
                },
                deep: true,
            }
        }
    });
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
