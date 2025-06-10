import { RootState } from "@/store/state";

export const emptyState = (): RootState => ({
    readsFileNames : null,
    errors         : "",
    min_count      : 0,

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

    workerState: {
        worker: null,
    },
});
