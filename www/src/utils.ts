import { RootState } from "@/store/state";

export const emptyState = (): RootState => ({
    readsFileNames : null,

    readsPreprocessing: {
        nKmers : null,
        histo  : [],
    },

    allResults: {
        nContigs    : null,
        fastaOutput : "",
    },

    workerState: {
        worker: null,
    },
});
