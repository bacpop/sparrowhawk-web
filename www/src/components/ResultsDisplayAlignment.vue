<template>
    <svg id="tree_container"></svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useState } from "vuex-composition-helpers";
// @ts-ignore - phylotree doesn't have types
import { phylotree } from "phylotree";
import 'phylotree/dist/phylotree.css';
import * as d3 from "d3";

export default defineComponent({
    name: "ResultsDisplayAlignment",

    setup() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { allResults_ska } = useState(["allResults_ska"]) as any;

        return {
            allResults_ska,
        }
    },

    props: {
        msg: {
            type: String,
            default: ''
        }
    },

    mounted(): void {
        if ((this.allResults_ska.alignResults[0]?.names?.length ?? 0) > 2) {
            this.createTree();
        }
    },

    watch: {
        'allResults_ska.alignResults': {
            handler(): void {
                if (this.allResults_ska.alignResults[0]?.aligned === false) {
                    this.loading();
                    return;
                }

                if ((this.allResults_ska.alignResults[0]?.names?.length ?? 0) > 2) {
                    this.createTree();
                } else {
                    this.notEnough();
                }
            },
            deep: true
        }
    },

    methods: {
        notEnough(): void {
            console.log("Not enough alignments to visualise a tree");

            d3.select("#tree_container").selectAll("*").remove();

            const container = d3.select("#tree_container");

            container.append("text")
                .attr("x", "50%")
                .attr("y", 20)
                .text("Not enough alignments to visualise a tree")
                .attr("font-size", "15px")
                .attr("text-anchor", "middle");
        },

        loading(): void {
            console.log("Setting WIP message");

            d3.select("#tree_container").selectAll("*").remove();

            const container = d3.select("#tree_container");

            // container.append("text")
            //     .attr("x", "50%")
            //     .attr("y", 40)
            //     .text("Processing files...")
            //     .attr("font-size", "40px")
            //     .attr("text-anchor", "middle");
        },

        createTree(): void {
            console.log("Creating tree");

            d3.select("#tree_container").selectAll("*").remove();

            const container = document.getElementById("tree_container");

            const nwk = this.allResults_ska.alignResults[0].newick;

            if (container && nwk) {
                const tree = new phylotree(nwk);
                const rendered_tree = tree.render({
                    container: "#tree_container",
                    height: 400,
                    width: window.innerWidth,
                    "left-right-spacing": "fit",
                    "top-bottom-spacing": "fit"
                });

                const svg = rendered_tree.show();
                container.appendChild(svg);
            }
        },
    },
});
</script>

<style scoped>
#tree_container {
  min-height: 400px; /* Ensure it has some height */
  width: 100%; /* Ensure it has some width */
}
</style>
