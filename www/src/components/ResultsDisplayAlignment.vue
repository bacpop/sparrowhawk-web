<template>
    <svg id="tree_container"></svg>
</template>

<script>
import { useState } from "vuex-composition-helpers";
import { phylotree } from "phylotree";
import 'phylotree/dist/phylotree.css';
import * as d3 from "d3";

export default {
    name: "ResultsDisplayAlignment",

    setup() {
        const { allResults_ska } = useState(["allResults_ska"]);

        return {
            allResults_ska,
        }
    },

    props: {
        msg: String
    },

    mounted() {
        if (this.allResults_ska.alignResults[0] ? this.allResults_ska.alignResults[0].names.length > 2 : false) {
            this.createTree();
        }
    },

    watch: {
        'allResults_ska.alignResults': {
            handler: function() {
                if (this.allResults_ska.alignResults[0] ? this.allResults_ska.alignResults[0].aligned == false : false) {
                    this.loading();
                    return;
                }

                if (this.allResults_ska.alignResults[0] ? this.allResults_ska.alignResults[0].names.length > 2 : false) {
                    this.createTree();
                } else {
                    this.notEnough();
                }
            },
            deep: true
        }
    },

    methods: { 
        notEnough() {
            console.log("Not enough alignments to visualise a tree");

            // Clear previous tree
            d3.select("#tree_container").selectAll("*").remove();

            let container = d3.select("#tree_container");

            container.append("text")
                .attr("x", "50%")
                .attr("y", 20)
                .text("Not enough alignments to visualise a tree")
                .attr("font-size", "15px")
                .attr("text-anchor", "middle");
        },

        loading() {
            console.log("Setting WIP message");

            // Clear previous tree
            d3.select("#tree_container").selectAll("*").remove();

            let container = d3.select("#tree_container");

            container.append("text")
                .attr("x", "50%")
                .attr("y", 40)
                .text("Processing files...")
                .attr("font-size", "40px")
                .attr("text-anchor", "middle");
        },

        createTree() {
            console.log("Creating tree");

            // Clear previous tree
            d3.select("#tree_container").selectAll("*").remove();

            const container = document.getElementById("tree_container");

            let nwk = this.allResults_ska.alignResults[0].newick;

            if (container) {
                const tree = new phylotree(nwk);
                var rendered_tree = tree.render({
                    container: "#tree_container", 
                    height: 400,
                    width: window.innerWidth,
                    "left-right-spacing": "fit-to-size",
                    "top-bottom-spacing": "fit-to-size"
                });

                // Append the SVG directly to the container
                const svg = rendered_tree.show();
                container.appendChild(svg);
            }
        },
    },
};
</script>

<style scoped>
#tree_container {
  min-height: 400px; /* Ensure it has some height */
  width: 100%; /* Ensure it has some width */
}
</style>
