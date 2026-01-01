<template>
    <div :id="'parent'"></div>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import * as d3 from 'd3';
import { useState } from 'vuex-composition-helpers';
import { getTextWidth } from '../functions';

function orderOfMagnitude(x: number): number {
    return Math.floor(Math.log10(x));
}

export default defineComponent({
    props: {
        zoom_level: {
            type: Number,
            required: true
        }
    },

    mounted(): void {
        this.createSequenceViewer();
    },

    methods: {
        createSequenceViewer(): void {
            console.log("Creating minimised viewer for zoom level: ", this.zoom_level);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { allResults_ska } = useState(["allResults_ska"]) as any;

            const whole_sequences = allResults_ska.value.ref;

            const whole_mapped_sequences_chrom: string[][] = [];
            for (let _ = 0; _ < whole_sequences.length; _++) {
                whole_mapped_sequences_chrom.push([]);
            }
            for (const key of Object.keys(allResults_ska.value.mapResults).reverse()) {
                for (let i = 0; i < whole_sequences.length; i++) {
                    const mapped = allResults_ska.value.mapResults[key].mapped_sequences;
                    if (mapped) {
                        whole_mapped_sequences_chrom[i].push(mapped[i]);
                    }
                }
            }

            const nb_mapping = whole_mapped_sequences_chrom[0].length;
            const mapping_names = Object.keys(allResults_ska.value.mapResults).reverse();

            const text_widths: number[] = [];
            for (let j = 0; j < nb_mapping; j++) {
                text_widths.push(getTextWidth(12, "IBM Plex Sans", mapping_names[j]));
            }

            let length_sequence = 0;
            for (const seq of whole_sequences) {
                length_sequence += seq.length;
            }
            const nb_chrom = whole_sequences.length;

            const parentNode = d3.select("#parent").node() as Element;
            const width = parentNode.getBoundingClientRect().width;
            const totalWidth = width * Math.exp(1 / 8 * this.zoom_level * Math.log(length_sequence / width));
            const height = Math.min(...[nb_mapping * 40, 420]);
            const totalHeight = height + 30;
            const marginTop = 10;
            const marginRight = 20;
            const marginBottom = 3;
            const marginLeft = 1.1 * Math.max(...text_widths);
            const size_between_chrom = 50 / (totalWidth / length_sequence);
            let tickFrequency = length_sequence / (totalWidth / (1.1 * getTextWidth(12, "IBM Plex Sans", String(length_sequence))));
            tickFrequency = Math.ceil(tickFrequency / 10 ** orderOfMagnitude(tickFrequency)) * 10 ** orderOfMagnitude(tickFrequency);

            const x = d3.scaleLinear()
                .domain([0, length_sequence + (nb_chrom - 1) * size_between_chrom])
                .range([marginLeft, totalWidth - marginRight]);

            const y = d3.scaleLinear()
                .domain([0, nb_mapping])
                .range([height - marginBottom, marginTop]);

            const parent = d3.select('#parent');

            const legend = parent.append("svg")
                .attr("width", width)
                .attr("height", totalHeight)
                .style("position", "absolute")
                .style("pointer-events", "none")
                .style("z-index", 1)
                .style("left", 0);

            for (let i = 0; i < nb_mapping; i++) {
                legend.append("text")
                    .attr("x", "10%")
                    .attr("y", y(i) + 30 - (height - marginBottom - marginTop) / nb_mapping / 2)
                    .attr("text-anchor", "left")
                    .attr("alignment-baseline", "middle")
                    .style("font-size", "12px")
                    .text(mapping_names[i]);
            }

            const body = parent.append("div")
                .style("overflow-x", "scroll")
                .style("-webkit-overflow-scrolling", "touch");

            const chr_svg = body.append("svg")
                .attr("width", totalWidth)
                .attr("height", 30)
                .style("display", "block");

            for (let chr_i = 0; chr_i < nb_chrom; chr_i++) {
                chr_svg.append("rect")
                    .attr("x", x(chr_i == 0 ? 0 : whole_sequences[chr_i - 1].length + chr_i * size_between_chrom))
                    .attr("y", 0)
                    .attr("width", x((chr_i == 0 ? 0 : whole_sequences[chr_i - 1].length + chr_i * size_between_chrom) + whole_sequences[chr_i].length) - x(chr_i == 0 ? 0 : whole_sequences[chr_i - 1].length + chr_i * size_between_chrom))
                    .attr("height", 30)
                    .attr("fill", "lightgrey");
                chr_svg.append("text")
                    .attr("x", 10 + x(chr_i == 0 ? 0 : whole_sequences[chr_i - 1].length + chr_i * size_between_chrom))
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
                    let current_is_equal: boolean | null = whole_mapped_sequences_chrom[chr_i][map_i][0] == "-" ? null : whole_mapped_sequences_chrom[chr_i][map_i][0] == whole_sequences[chr_i][0];

                    for (let nuc_i = 0; nuc_i < whole_sequences[chr_i].length; nuc_i++) {
                        if (current_is_equal == null) {
                            current_is_equal = whole_mapped_sequences_chrom[chr_i][map_i][nuc_i] == "-" ? null : whole_mapped_sequences_chrom[chr_i][map_i][nuc_i] == whole_sequences[chr_i][nuc_i];
                            nucleotide_count += 1;
                            current_nucleotide = nucleotide_count;
                            continue;
                        }
                        const new_is_equal: boolean | null = whole_mapped_sequences_chrom[chr_i][map_i][nuc_i] == "-" ? null : whole_mapped_sequences_chrom[chr_i][map_i][nuc_i] == whole_sequences[chr_i][nuc_i];
                        if ((new_is_equal && current_is_equal) || (!new_is_equal && !current_is_equal)) {
                            current_is_equal = new_is_equal;
                        } else {
                            svg.append("rect")
                                .attr("x", x(current_nucleotide + chr_i * size_between_chrom))
                                .attr("y", y(map_i + 1))
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
                        .attr("y", y(map_i + 1))
                        .attr("width", x(nucleotide_count + chr_i * size_between_chrom) - x(current_nucleotide + chr_i * size_between_chrom))
                        .attr("height", y(map_i) - y(map_i + 1))
                        .attr("fill", current_is_equal ? "black" : "red");
                }
            }

            svg.selectAll<SVGRectElement, unknown>("rect").each(function () {
                const selection = d3.select(this);
                if (selection.attr("fill") == "red") {
                    const rectWidth = parseFloat(selection.attr("width"));
                    if (rectWidth < 0.2 && rectWidth > 0) {
                        const rectX = parseFloat(selection.attr("x"));
                        selection.attr("width", "0.2px")
                            .attr("x", rectX - (0.2 - rectWidth));
                    }
                }
            });

            const xAxis = body.append("svg")
                .attr("width", totalWidth)
                .attr("height", 30)
                .style("display", "block");

            let position = 0;
            let next_position = 0;
            for (let chr_i = 0; chr_i < nb_chrom; chr_i++) {
                for (let nuc_i = 0; nuc_i < whole_sequences[chr_i].length; nuc_i++) {
                    if (nuc_i % tickFrequency == 0) {
                        position = x(chr_i == 0 ? nuc_i
                            : nuc_i + chr_i * size_between_chrom + whole_sequences[chr_i - 1].length);
                        next_position = x(chr_i == 0 ? nuc_i + 1
                            : nuc_i + 1 + chr_i * size_between_chrom + whole_sequences[chr_i - 1].length);
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
});
</script>
