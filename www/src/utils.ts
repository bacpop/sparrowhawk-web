import {RootState} from "@/store/state";

export const emptyState = (): RootState => ({
    readsFileNames: null,
    errors: "",
    min_count: 0,
    refSet: null,

    readsPreprocessing: {
        nKmers: null,
        histo: [],
        used_min_count: null,
    },

    allResults: {
        nContigs: null,
        fastaOutput: "",
        dotOutput: "",
        gfaOutput: "",
        gfav2Output: "",
    },

    allResults_ska: {
        mapResults: {},
        alignResults: {},
        ref: [],
    },

    allResults_sketchlib: {
        results: {},
    },

    allResults_orphos: {
        outputFile: "",
        geneCount: null,
        sequenceCount: null,
        callingGenes: false,
    },

    workerState: {
        worker: null,
        worker_ska: null,
        worker_orphos: null,
        workers_sketchlib: [],
    },

    processingState: {
        isPreprocessing: false,
        isAssembling: false,
        isIndexingRef: false,
        isMapping: false,
        isMappingFiles: new Set<string>(),
        isAligning: false,
        isIdentifying: false,
        isIdentifyingFiles: new Set<string>(),
        assemblyState: '',
    },
});
