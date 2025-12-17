# Alignment
Alignment is a way of showing the differences between two or more DNA sequences, often used in evolution/phylogenetic studies.Sparrowhawk offers this service through [ska.rust](https://github.com/bacpop/ska.rust): a toolkit for prokaryotic (and other haploid and small genome beings) sequence analysis with split kmers.

## General considerations
- Take into account that ska.rust (the underlying methodology) is designed to work with closely related genomes (less than species level). If you use very different sequences, the results might not be accurate.
- You will need three or more sequences to perform the alignment.
- At the end of the alignment, you will be able to see a phylogenetic tree created with the [speedytree crate](https://crates.io/crates/speedytree).

## Parameters
The values in brackets are the default ones:
- **k** \[31\]: controls the size of subsequences used in the algorithm. It is an odd integer that should be between ~17 up until 63.
- **Proportion of reads** \[1.0\]: a real number between 0 and 1 that allows you to choose, when you upload reads, what fraction of those you want to sample (if you want to do so).
