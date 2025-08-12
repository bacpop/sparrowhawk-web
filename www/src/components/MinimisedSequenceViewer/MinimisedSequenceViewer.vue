<template>
    <div :id="'parent'"></div>
</template>


<script>
import * as d3 from 'd3';
import { useState } from 'vuex-composition-helpers';
import { getTextWidth } from '../functions';

export default {
    props: ['zoom_level'],

    mounted() {
        this.createSequenceViewer();
    },

    methods: {
        createSequenceViewer() {
            console.log("Creating minimised viewer for zoom level: ", this.zoom_level)
            const { allResults_ska } = useState(["allResults_ska"]);

            const whole_sequences = allResults_ska.value.ref;

            const whole_mapped_sequences_chrom = [];
            for (let _ = 0; _ < whole_sequences.length; _++){
                whole_mapped_sequences_chrom.push([]);
            }
            for (const key of Object.keys(allResults_ska.value.mapResults).reverse()){
                for (let i = 0; i < whole_sequences.length; i++){
                    whole_mapped_sequences_chrom[i].push(allResults_ska.value.mapResults[key].mapped_sequences[i]);
                }
            }

            const nb_mapping = whole_mapped_sequences_chrom[0].length;
            const mapping_names = Object.keys(allResults_ska.value.mapResults).reverse();

            let text_widths = [];
            for (let j = 0; j < nb_mapping; j++){
                text_widths.push(getTextWidth(12, "IBM Plex Sans", mapping_names[j]));
            }

            let length_sequence = 0;
            for (const seq of whole_sequences) {
                length_sequence += seq.length;
            }
            const nb_chrom = whole_sequences.length;

            const width = d3.select("#parent").node().getBoundingClientRect().width;
            // totalWidth is made to be width when zoom_level is 0 and 
            // to give 1px for each nucleotide when zoom_level is maximum (8).
            const totalWidth = width * Math.exp(1/8 * this.zoom_level * Math.log(length_sequence/width));
            const height = Math.min(...[nb_mapping* 40, 420]);
            const totalHeight = height + 30;
            const marginTop = 10;
            const marginRight = 20;
            const marginBottom = 3;
            const marginLeft = 1.1*Math.max(...text_widths);
            // Made to always have the same size between chromosomes.
            const size_between_chrom = 50 / (totalWidth / length_sequence ) ;
            // Made to be the closest round tick frequency to have non-overlaping ticks.
            let tickFrequency = length_sequence / (totalWidth / (1.1 * getTextWidth(12, "IBM Plex Sans", length_sequence)));
            tickFrequency = Math.ceil(tickFrequency / 10 ** orderOfMagnitude(tickFrequency)) * 10 ** orderOfMagnitude(tickFrequency);

            // Create the horizontal (x) scale over the total width.
            const x = d3.scaleLinear()
                .domain([0, length_sequence + (nb_chrom - 1) * size_between_chrom])
                .range([marginLeft, totalWidth - marginRight]);

            // Create the vertical (y) scale.
            const y = d3.scaleLinear()
                .domain([0, nb_mapping])
                .range([height - marginBottom, marginTop]);

            // Create a div that holds two svg elements: one for the main chart and horizontal axis,
            // which moves as the user scrolls the content; the other for the vertical axis (which 
            // doesn’t scroll).
            const parent = d3.select('#parent');

            // Create the svg with the vertical axis. 
            let legend = parent.append("svg")
                .attr("width", width)
                .attr("height", totalHeight)
                .style("position", "absolute")
                .style("pointer-events", "none")
                .style("z-index", 1)
                .style("left", 0)

            for (let i = 0; i < nb_mapping; i++) {
                legend.append("text")
                    .attr("x", "10%")
                    .attr("y", y(i) + 30 - (height - marginBottom - marginTop) / nb_mapping / 2)
                    .attr("text-anchor", "left")
                    .attr("alignment-baseline", "middle")
                    .style("font-size", "12px")
                    .text(mapping_names[i]);
            }

            // Create the scrolling div 
            const body = parent.append("div")
                .style("overflow-x", "scroll")
                .style("-webkit-overflow-scrolling", "touch");

            const chr_svg = body.append("svg")
                .attr("width", totalWidth)
                .attr("height", 30)
                .style("display", "block");

            // Plot rectangles for each chromosome with a text inside
            for (let chr_i = 0; chr_i < nb_chrom; chr_i++) {
                chr_svg.append("rect")
                    .attr("x", x(chr_i==0? 0 : whole_sequences[chr_i-1].length + chr_i * size_between_chrom))
                    .attr("y", 0)
                    .attr("width", x((chr_i==0? 0 : whole_sequences[chr_i-1].length + chr_i * size_between_chrom) + whole_sequences[chr_i].length) - x(chr_i==0? 0 : whole_sequences[chr_i-1].length + chr_i * size_between_chrom))
                    .attr("height", 30)
                    .attr("fill", "lightgrey");
                chr_svg.append("text")
                    .attr("x", 10 + x(chr_i==0? 0 : whole_sequences[chr_i-1].length + chr_i * size_between_chrom))
                    .attr("y", 15)
                    .attr("text-anchor", "left")
                    .attr("alignment-baseline", "middle")
                    .text("Chromosome " + (chr_i + 1));
            }

            const svg = body.append("svg")
                .attr("width", totalWidth)
                .attr("height", height)
                .style("display", "block");
            
            for (let map_i = 0; map_i < nb_mapping; map_i++) {
                let nucleotide_count = 0;
                for (let chr_i = 0; chr_i < nb_chrom; chr_i++) {

                    let current_nucleotide = nucleotide_count;
                    let current_is_equal = whole_mapped_sequences_chrom[chr_i][map_i][0] == "-"? null : whole_mapped_sequences_chrom[chr_i][map_i][0] == whole_sequences[chr_i][0];

                    for (let nuc_i = 0; nuc_i < whole_sequences[chr_i].length; nuc_i++) {
                        if (current_is_equal == null) {
                            current_is_equal = whole_mapped_sequences_chrom[chr_i][map_i][nuc_i] == "-"? null : whole_mapped_sequences_chrom[chr_i][map_i][nuc_i] == whole_sequences[chr_i][nuc_i];
                            nucleotide_count += 1;
                            current_nucleotide = nucleotide_count;
                            continue
                        }
                        let new_is_equal = whole_mapped_sequences_chrom[chr_i][map_i][nuc_i] == "-"? null : whole_mapped_sequences_chrom[chr_i][map_i][nuc_i] == whole_sequences[chr_i][nuc_i];
                        if ((new_is_equal && current_is_equal) || (!new_is_equal && !current_is_equal)) {
                            current_is_equal = new_is_equal; 
                        }
                        else {
                            svg.append("rect")
                                .attr("x", x(current_nucleotide + chr_i * size_between_chrom))
                                .attr("y", y(map_i+1))
                                .attr("width", x(nucleotide_count + chr_i * size_between_chrom) - x(current_nucleotide + chr_i * size_between_chrom))
                                .attr("height", y(map_i) - y(map_i + 1))
                                .attr("fill", current_is_equal ? "black" : "red");
                            
                            current_nucleotide = nucleotide_count;
                            current_is_equal = new_is_equal;
                        }
                        nucleotide_count += 1;
                    }
                    svg.append("rect")
                        .attr("x", x(current_nucleotide + chr_i * size_between_chrom))
                        .attr("y", y(map_i+1))
                        .attr("width", x(nucleotide_count + chr_i * size_between_chrom) - x(current_nucleotide + chr_i * size_between_chrom))
                        .attr("height", y(map_i) - y(map_i + 1))
                        .attr("fill", current_is_equal ? "black" : "red");
                }
            }

            svg.selectAll("rect").each(function() {
                if (d3.select(this).attr("fill") == "red") {
                    if (d3.select(this).attr("width") < 0.2 && d3.select(this).attr("width") > 0){
                        const width = d3.select(this).attr("width");
                        d3.select(this).attr("width", `0.2px`)
                            .attr("x", d3.select(this).attr("x") - (0.2 - width));
                    }
                }
            });

            // Create the horizontal axis.
            const xAxis = body.append("svg")
                .attr("width", totalWidth)
                .attr("height", 30)
                .style("display", "block")

            let position = 0;
            let next_position = 0;
            for (let chr_i = 0; chr_i < nb_chrom; chr_i++) {
                for (let nuc_i = 0; nuc_i < whole_sequences[chr_i].length; nuc_i++) {
                    if (nuc_i % tickFrequency == 0) {
                        position = x(chr_i==0? nuc_i
                                    : nuc_i + chr_i * size_between_chrom + whole_sequences[chr_i-1].length);
                        next_position = x(chr_i==0? nuc_i + 1
                                    : nuc_i + 1 + chr_i * size_between_chrom + whole_sequences[chr_i-1].length);
                        xAxis.append("text")
                            .attr("x", position + (next_position - position) / 2)
                            .attr("y", 20)
                            .attr("text-anchor", "middle")
                            .attr("alignment-baseline", "middle")
                            .style("font-size", "12px")
                            .style("font-family", "IBM Plex Sans")
                            .text(nuc_i);
                        xAxis.append("line")
                            .attr("x1", position + (next_position - position) / 2)
                            .attr("y1", 0)
                            .attr("x2", position + (next_position - position) / 2)
                            .attr("y2", 10)
                            .attr("stroke", "black")
                            .attr("stroke-width", 1);
                    }
                }
            }
        }
    }
};

function orderOfMagnitude(x) {
    return Math.floor(Math.log10(x));
}
</script>
