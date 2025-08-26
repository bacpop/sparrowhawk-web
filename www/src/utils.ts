import { RootState } from "@/store/state";

export const emptyState = (): RootState => ({
    readsFileNames : null,
    errors         : "",
    min_count      : 0,
    refSet         : null,

    readsPreprocessing: {
        nKmers : null,
        histo  : [],
        used_min_count : null,
    },

    allResults: {
        nContigs    : null,
        fastaOutput : "",
        dotOutput   : "",
        gfaOutput   : "",
        gfav2Output : "",
    },

    allResults_ska: {
        mapResults: {},
        alignResults: {},
        ref: [],
    },

    allResults_sketchlib: {
        idProbs: null,
        idSpecies: null,
        idMetadata: null,
    },

    workerState: {
        worker: null,
        worker_ska: null,
        worker_sketchlib: null,
    },
});
