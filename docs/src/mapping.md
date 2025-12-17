# Mapping

Mapping is often used as an alternative way of reconstructing a genome from sequencing raw data, instead of trying to re-assemble it from scratch. Sparrowhawk offers this service through [ska.rust](https://github.com/bacpop/ska.rust): a toolkit for prokaryotic (and other haploid and small genome beings) sequence analysis with split kmers.

## General considerations

## Parameters
The values in brackets are the default ones:
- **k** \[31\]: controls the size of subsequences used in the algorithm. It is an odd integer that should be between ~17 up until 63.
- **Proportion of reads** \[1.0\]: a real number between 0 and 1 that allows you to choose, when you upload reads, what fraction of those you want to sample (if you want to do so).
