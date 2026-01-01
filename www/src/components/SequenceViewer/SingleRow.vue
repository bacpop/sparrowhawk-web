<template>
  <svg :id="'svg_' + virtualRow.index" width="100%" height="100%"></svg>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import * as d3 from 'd3';
import { getTextWidth } from '../functions';

interface VirtualRow {
    index: number;
}

interface RowData {
    sequence: string[];
    mapped_sequences: string[][];
    font_widths: number[];
    nucleotides_position: number[];
    first_row: number;
}

export default defineComponent({
    props: {
        virtualRow: {
            type: Object as PropType<VirtualRow>,
            required: true
        },
        row: {
            type: Object as PropType<RowData>,
            required: true
        },
        font_size: {
            type: Number,
            required: true
        },
        font_family: {
            type: String,
            required: true
        },
        mapping_names: {
            type: Array as PropType<string[]>,
            required: true
        }
    },
    mounted(): void {
        this.modifySvg();
    },
    methods: {
        modifySvg(): void {
            const svg = d3.select('#svg_' + this.virtualRow.index);

            const sequence = this.row.sequence;
            const mapped_sequences = this.row.mapped_sequences;
            const font_widths = this.row.font_widths;
            const nucleotides_position = this.row.nucleotides_position;
            const nb_mapping = mapped_sequences.length;

            let x: number;
            if (this.row.first_row != 0) {
                const text_widths: number[] = [];
                text_widths.push(getTextWidth(this.font_size, this.font_family, "Chromosome " + this.row.first_row));
                for (let j = 0; j < nb_mapping; j++) {
                    text_widths.push(getTextWidth(this.font_size, this.font_family, this.mapping_names[j]));
                }
                x = 1.1 * Math.max(...text_widths) + font_widths[0] / 2;

                svg.append("text")
                    .attr("x", 0)
                    .attr("y", this.font_size)
                    .attr("font-size", this.font_size + "px")
                    .attr("text-anchor", "left")
                    .attr("font-family", this.font_family)
                    .text("Chromosome " + this.row.first_row);

                for (let j = 0; j < nb_mapping; j++) {
                    svg.append("text")
                        .attr("x", 0)
                        .attr("y", (2 + j) * this.font_size)
                        .attr("font-size", this.font_size + "px")
                        .attr("fill", "red")
                        .attr("text-anchor", "left")
                        .attr("font-family", this.font_family)
                        .text(this.mapping_names[j]);
                }
            } else {
                x = font_widths[0] / 2;
            }
            const initial_x = x;
            const initial_font_width = font_widths[0];

            let nucleotide = "";
            let nucleotide_mapped = "";
            let color_mapped = "";
            let current_font_width = font_widths[0];

            for (let i = 0; i < sequence.length; i++) {
                nucleotide = sequence[i];

                svg.append("text")
                    .attr("x", x - current_font_width / 2 + font_widths[i] / 2)
                    .attr("y", this.font_size)
                    .attr("font-size", this.font_size + "px")
                    .attr("text-anchor", "middle")
                    .attr("font-family", this.font_family)
                    .text(nucleotide);

                for (let j = 0; j < nb_mapping; j++) {
                    nucleotide_mapped = mapped_sequences[j][i];

                    if (nucleotide_mapped === "-" || nucleotide_mapped === ".......") {
                        color_mapped = "black";
                    } else {
                        color_mapped = "red";
                    }

                    svg.append("text")
                        .attr("x", x - current_font_width / 2 + font_widths[i] / 2)
                        .attr("y", (2 + j) * this.font_size)
                        .attr("font-size", this.font_size + "px")
                        .attr("fill", color_mapped)
                        .attr("text-anchor", "middle")
                        .attr("font-family", this.font_family)
                        .text(nucleotide_mapped);
                }

                if ((nucleotides_position[i]) % 10 === 0) {
                    svg.append("line")
                        .attr("x1", x)
                        .attr("y1", (1.5 + nb_mapping) * this.font_size)
                        .attr("x2", x)
                        .attr("y2", (2 + nb_mapping) * this.font_size)
                        .attr("stroke", "black")
                        .attr("stroke-width", 1 * this.font_size / 12);

                    svg.append("text")
                        .attr("x", x)
                        .attr("y", (2.5 + nb_mapping) * this.font_size)
                        .attr("font-size", this.font_size / 1.7 + "px")
                        .attr("fill", "black")
                        .attr("text-anchor", "middle")
                        .text(nucleotides_position[i]);
                }
                x = x - current_font_width / 2 + font_widths[i] / 2 + font_widths[i];
                current_font_width = font_widths[i];
            }
            svg.append("line")
                .attr("x1", initial_x - initial_font_width / 2)
                .attr("y1", (1.5 + nb_mapping) * this.font_size)
                .attr("x2", x - font_widths[sequence.length - 1] / 2)
                .attr("y2", (1.5 + nb_mapping) * this.font_size)
                .attr("stroke", "black")
                .attr("stroke-width", this.font_size / 12);
        },
    },
});
</script>