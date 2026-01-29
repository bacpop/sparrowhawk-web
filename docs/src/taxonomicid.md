# Taxonomic identification
This tab will try to assess what bacterial species correspond to any reads or genomic sequences that you "upload" (load into memory really) in it. Sparrowhawk offers this service through [sketchlib.rust](https://github.com/bacpop/sketchlib.rust): a further developed Rust port of [pp-sketchlib](https://github.com/bacpop/pp-sketchlib), that allows for fast comparisons of sequences. The data for the reference database comes from the [AllTheBacteria dataset](https://allthebacteria.org), that comprises close to 2.5 million bacterial genomes uniformly assembled. These have been clustered using gemsparcl, to obtain high-quality groups of sequences whose species we know.

## General considerations
- The underlying code uses an inverted index (already implemented inside sketchlib.rust), built with sketches (akin to "fingerprints")[^notesketch] of representatives of high-quality clusters extracted from the AllTheBacteria dataset. When one sample is uploaded to this web page (either as a FASTA or FASTQ file), it is sketched as well, and its sketch is compared with the representative ones using sketchlib.rust's inverted index functionality. The sketches with highest [Jaccard index](https://en.wikipedia.org/wiki/Jaccard_index) are returned.

## Parameters
None


[^notesketch]: See the [sketchlib.rust code repository](https://github.com/bacpop/sketchlib.rust) for more documentation on how sketches are obtained from a genome.