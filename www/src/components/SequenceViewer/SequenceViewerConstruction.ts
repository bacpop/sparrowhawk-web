// This file contains the functions to construct the rows of the sequence viewer
// This is done to adapt the width of the webpage and use the virtualizer

// The Row class is used to store the information of a row of the sequence viewer
// It is returned to the component to be displayed

import { getTextWidth } from '../functions';

export class Row {
    sequence: string[];
    mapped_sequences: string[][];
    font_widths: number[];
    nucleotides_position: number[];
    first_row: number;

    constructor(sequence: string[], mapped_sequences: string[][], font_widths: number[], nucleotides_position: number[], first_row: number = 0) {
        this.sequence = sequence;
        this.mapped_sequences = mapped_sequences;
        this.font_widths = font_widths; // The width allocated to each caracter of the sequence (letter, -, space or .......)
        this.nucleotides_position = nucleotides_position;
        this.first_row = first_row; // Is it the first row of the chromosome ? If yes, this is the number of the chromosome
    }
}

export function Rows(
    font_size: Number, 
    font_family: string, 
    whole_mapped_sequences_chrom: string[][], 
    whole_sequences: string[], no_skip: boolean, 
    mapping_names: string[]) 
    {
    const nb_mapping = whole_mapped_sequences_chrom[0].length;

    const width_page = 0.8*document.body.clientWidth;

    let sequence: string[];
    let mapped_sequences: string[][];
    let font_widths: number[];
    let nucleotides_position: number[];
    const font_width = getTextWidth(font_size, font_family);
    
    const Rows = [];
    let current_width = 0;

    let nucleotide = "";
    const nucleotide_mapped: string[] = [];
    // While the sequence is not mapped by any mapping, we skip it
    let skip = false;
    // We want to add additionnal information to the first row of each chromosome
    let first_row;

    // We go through each chromosome, skip unmapped sequences (or not if no_skip is true) and construct the
    // rows using the Row class
    for (let seq_i = 0; seq_i < whole_sequences.length; seq_i++){
        sequence = [];
        mapped_sequences = [];
        for (let _ = 0; _ < nb_mapping; _++){
            mapped_sequences.push([]);
        }
        font_widths = [];
        nucleotides_position = [];

        first_row = seq_i + 1;
        const text_widths = [];
        text_widths.push(getTextWidth(font_size, font_family, "Chromosome 1"));
        for (let j = 0; j < nb_mapping; j++){
            text_widths.push(getTextWidth(font_size, font_family, mapping_names[j]));
        }
        current_width = 1.1*Math.max(...text_widths);

        const whole_sequence = whole_sequences[seq_i];
        const whole_mapped_sequences: string[] = whole_mapped_sequences_chrom[seq_i];

        for (let i = 0; i < whole_sequence.length; i++) {
            if (current_width + font_width > width_page - 40) {
                Rows.push(new Row(
                    sequence, 
                    mapped_sequences, 
                    font_widths, 
                    nucleotides_position,
                    first_row
                ));
                sequence = [];
                mapped_sequences = [];
                for (let _ = 0; _ < nb_mapping; _++){
                    mapped_sequences.push([]);
                }
                font_widths = [];
                nucleotides_position = [];

                first_row = 0;
                current_width = 0;
            }

            nucleotide = whole_sequence[i].toUpperCase();

            if (whole_mapped_sequences.every(mapped_sequence => mapped_sequence[i] == "-") && !no_skip) {
                if (!skip) {
                    if (current_width + font_width > width_page - 40) {
                        current_width = 0;
                        Rows.push(new Row(
                            sequence, 
                            mapped_sequences, 
                            font_widths, 
                            nucleotides_position
                        ));
                        sequence = [];
                        mapped_sequences = [];
                        for (let _ = 0; _ < nb_mapping; _++){
                            mapped_sequences.push([]);
                        }
                        font_widths = [];
                        nucleotides_position = [];
                    }
                    
                    nucleotide = ".......";
                    for (let j = 0; j < nb_mapping; j++){
                        nucleotide_mapped[j] = ".......";
                    }
                    const font_width_skip = getTextWidth(font_size, font_family, nucleotide_mapped[0]) + 2;
                    current_width += font_width_skip;

                    font_widths.push(font_width_skip);
                    nucleotides_position.push(1); // We don't care about the number of the dots and 1 is not divisible by anything else than himself
                    sequence.push(nucleotide);
                    for (let j = 0; j < nb_mapping; j++){
                        mapped_sequences[j].push(nucleotide_mapped[j]);
                    }
                }
                skip = true;
                continue;
            }
            else {
                for (let j = 0; j < nb_mapping; j++){

                    if (whole_mapped_sequences[j][i].toUpperCase() == nucleotide) {
                        nucleotide_mapped[j] = "-";
                    }
                    else if (whole_mapped_sequences[j][i] == "-") {
                        nucleotide_mapped[j] = " ";
                    }
                    else {
                        nucleotide_mapped[j] = whole_mapped_sequences[j][i].toUpperCase();
                    }
                }
                skip = false;
            }

            current_width += font_width;
            font_widths.push(font_width);
            nucleotides_position.push(i + 1);
            sequence.push(nucleotide.toUpperCase());
            for (let j = 0; j < nb_mapping; j++){
                mapped_sequences[j].push(nucleotide_mapped[j]);
            }
        }
        Rows.push(new Row(
            sequence,
            mapped_sequences,
            font_widths,
            nucleotides_position,
            first_row
        ));
        first_row = 0;
        current_width = 0;
    }

    return Rows;
}