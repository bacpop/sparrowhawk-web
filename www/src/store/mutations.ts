import {RootState} from "@/store/state";

export default {
    // Processing state mutations
    setPreprocessingState(state: RootState, isProcessing: boolean) {
        state.processingState.isPreprocessing = isProcessing;
    },
    setAssemblingState(state: RootState, isAssembling: boolean) {
        state.processingState.isAssembling = isAssembling;
    },
    setIndexingRefState(state: RootState, isIndexing: boolean) {
        state.processingState.isIndexingRef = isIndexing;
    },
    setMappingState(state: RootState, isMapping: boolean) {
        state.processingState.isMapping = isMapping;
    },
    addMappingFile(state: RootState, fileName: string) {
        state.processingState.isMappingFiles.add(fileName);
    },
    removeMappingFile(state: RootState, fileName: string) {
        state.processingState.isMappingFiles.delete(fileName);
        if (state.processingState.isMappingFiles.size === 0) {
            state.processingState.isMapping = false;
        }
    },
    setAligningState(state: RootState, isAligning: boolean) {
        state.processingState.isAligning = isAligning;
    },
    setIdentifyingState(state: RootState, isIdentifying: boolean) {
        state.processingState.isIdentifying = isIdentifying;
    },
    resetProcessingState(state: RootState) {
        state.processingState = {
            isPreprocessing: false,
            isAssembling: false,
            isIndexingRef: false,
            isMapping: false,
            isMappingFiles: new Set<string>(),
            isAligning: false,
            isIdentifying: false,
            isIdentifyingFiles: new Set<string>(),
        };
    },

    SET_WORKER(state: RootState, worker: Worker | null) {
        state.workerState.worker = worker;
    },
    SET_WORKER_SKA(state: RootState, worker: Worker | null) {
        state.workerState.worker_ska = worker;
    },
    SET_WORKER_SKETCHLIB(state: RootState, worker: Worker | null) {
        state.workerState.worker_sketchlib = worker;
    },

    setPreprocessing(state: RootState, input: { nKmers: number, histo: [], used_min_count: number }) {
        console.log("Preprocessing finished! Saving intermediate information in the state");
        console.log(input.nKmers);

        state.readsPreprocessing.nKmers = input.nKmers;
        state.readsPreprocessing.histo = input.histo;
        state.readsPreprocessing.used_min_count = input.used_min_count;

    },

    setAssembly(state: RootState, input: {
        ncontigs: number,
        outfasta: string,
        outdot: string,
        outgfa: string,
        outgfav2: string
    }) {
        console.log("Assembly finished! Saving contigs as fasta in the state");

        state.allResults.nContigs = input.ncontigs;
        state.allResults.fastaOutput = input.outfasta;
        state.allResults.dotOutput = input.outdot;
        state.allResults.gfaOutput = input.outgfa;
        state.allResults.gfav2Output = input.outgfav2;

    },

    setReadsFileNames(state: RootState, input: { file1: string, file2: string }) {
        console.log("Setting names of reads");

        state.readsFileNames = input.file1 + "," + input.file2;

    },

    removeErrors(state: RootState) {
        console.log("Removing errors");

        state.errors = "";

    },

    setMemoryError(state: RootState) {
        console.log("Setting memory error in state");

        state.errors = "memory";

    },

    resetAllResults(state: RootState) {
        state.readsFileNames = null;
        state.min_count = 0;
        state.readsPreprocessing = {
            nKmers: null,
            histo: [],
            used_min_count: null,
        }
        state.allResults = {
            nContigs: null,
            fastaOutput: "",
            dotOutput: "",
            gfaOutput: "",
            gfav2Output: "",
        };

        if (state.workerState.worker) {
            state.workerState.worker.postMessage({reset: true});
        }
    },

    // SKA

    addRef(state: RootState, input: { name: string, sequences: string[] }) {
        console.log("vuex: Adding ref " + input.name);
        state.refSet = input.name;
        state.allResults_ska.ref = input.sequences;
    },

    addQueryFileMap(state: RootState, name: string) {
        console.log("vuex: Adding query file for mapping " + name)
        if (!state.allResults_ska.mapResults[name]) {
            state.allResults_ska.mapResults[name] = {
                mapped: true,
                nb_variants: null,
                coverage: null,
                mapped_sequences: [],
            };
        }
    },

    setMapped(state: RootState,
              input: {
                  name: string,
                  nb_variants: number | null,
                  coverage: number | null,
                  mapped_sequences: string[]
              }) {
        state.allResults_ska.mapResults[input.name].nb_variants = input.nb_variants
        state.allResults_ska.mapResults[input.name].coverage = input.coverage
        state.allResults_ska.mapResults[input.name].mapped_sequences = input.mapped_sequences
    },

    setAligned(state: RootState, input: { aligned: boolean, names: string[], newick: string }) {
        state.allResults_ska.alignResults[0] = {
            aligned: input.aligned,
            names: input.names,
            newick: input.newick
        }
    },

    resetAllResults_ska(state: RootState) {
        state.refSet = null;
        state.allResults_ska = {
            mapResults: {},
            alignResults: {},
            ref: [],
        };

        if (state.workerState.worker_ska) {
            state.workerState.worker_ska.postMessage({reset: true});
        }
    },

    // SKETCHLIB
    addIdentifyingFile(state: RootState, sampleName: string) {
        state.processingState.isIdentifyingFiles.add(sampleName);
        state.processingState.isIdentifying = true;
    },
    removeIdentifyingFile(state: RootState, sampleName: string) {
        state.processingState.isIdentifyingFiles.delete(sampleName);
        if (state.processingState.isIdentifyingFiles.size === 0) {
            state.processingState.isIdentifying = false;
        }
    },
    saveIDResults(state: RootState, input: { sampleName: string, probs: number[], names: string[], metadata: string[] }) {
        console.log("Storing results for sample: " + input.sampleName);
        state.allResults_sketchlib.results[input.sampleName] = {
            idProbs: input.probs,
            idSpecies: input.names,
            idMetadata: input.metadata,
        };
    },

    resetAllResults_sketchlib(state: RootState) {
        state.allResults_sketchlib = {
            results: {},
        };

        if (state.workerState.worker_sketchlib) {
            state.workerState.worker_sketchlib.postMessage({reset: true});
        }
    }

};
