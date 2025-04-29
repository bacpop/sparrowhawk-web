import { RootState } from "@/store/state";

export const emptyState = (): RootState => ({
    readsSet: null,
    allResults: {
        assemblyResults : "",
    },
    workerState: {
        worker: null,
    },
});
