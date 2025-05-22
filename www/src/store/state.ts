import {
    AllResults,
    ReadsPreprocessing,
    WorkerState,
} from "@/types";

export interface RootState {
    workerState         : WorkerState,
    readsFileNames      : string | null,
    readsPreprocessing  : ReadsPreprocessing,
    allResults          : AllResults,
    errors              : string,
    min_count           : number,
}
