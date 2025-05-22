# sparrowhawk-web <img src='sparrowhawk_logo.png' align="right" height="250" />
Web interface for the [sparrowhawk](https://github.com/bacpop/sparrowhawk) genome assembler using WebAssembly and Rust.


<br>
<br>
<br>
<br>


---
## Disclaimer :warning: :construction:
This is a **work in progress** project. This in particular implies:

- Not all the main features we want are yet implemented.
- Code might be messy, and not even documented.
- General documentation on how to install and use the tool might be short or even missing.
- Finding unexpected errors/behaviour or bugs should not be a surprise.
- Some features might be partially hardcoded.

These (and potentially other) items will be progressively fixed before version 1.0.

---


## sparrowhawk?
Sparrowhawk was at one time the Archmage of [Earthsea](https://en.wikipedia.org/wiki/Earthsea).
Also, the [sparrowhawk](https://en.wikipedia.org/wiki/Eurasian_sparrowhawk) (*Accipiter nisus*) is a bird of prey native to Europe (and the island of Gont).

# Description

**Note:** this repository is for the web interface of the assembler. If you are looking for the assembler itself (that can be run locally) see [sparrowhawk](https://github.com/bacpop/sparrowhawk).

This web interface aims to offer a way of having a simple website that offers the WebAssembly compiled [sparrowhawk](https://github.com/bacpop/sparrowhawk) assembler. It has been developed taking advantage/inspiration from other WebAssembly projects from our group (such as [DATACIN](https://github.com/bacpop/DATACIN)).

Current **main features** (see the [sparrowhawk](https://github.com/bacpop/sparrowhawk) repository for details on the assembler itself):
- Simple, working, web-interface.
- Allows to drag-and-drop (or select from a file browser) the Illumina paired-end reads from your computer.
- Download of the assembled contigs in FASTA format, as well as the de Bruijn graph before collapse as DOT, GFAv1.1, and GFAv2 formats.
- Customised parameter setting.
- Due to the current 32bit memory addresses restriction, there is a **total 4GB RAM limit**. This implies that some reads won't be able to be assembled using the standard preprocessing, due to their size. Some additional options have been implemented to try to circumvent this restriction, though keep in mind that they might still not be enough. These are:
    - Chunking of the preprocessing.
    - Alternative preprocessing using a Bloom filter.

:construction: In-progress future main (not all) features: :construction:
- Incorporate 64bit memory addresses, removing the restriction on 4GB.
- Add progress information in the assembly.
- Add automatic parameter setting for the minimum k-mer counts.


# Installation
Development has been done only on x86_64 GNU/Linux-based systems, and most surely will probably stay that way (i.e. no other systems have been tested). To use it you will need to have [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed and then download and install the required packages as follows:

```
git clone https://github.com/bacpop/sparrowhawk-web.git
cd sparrowhawk-web
npm install
```


# Usage
Once you have it installed, you can run the following, that will automatically compile to WebAssembly [sparrowhawk](https://github.com/bacpop/sparrowhawk) and run the development server:

```
cd www
npm run serve
```

## Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
