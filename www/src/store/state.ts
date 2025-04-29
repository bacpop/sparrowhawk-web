import {
    AllResults,
    WorkerState,
} from "@/types";

export interface RootState {
    readsSet   : string | null,
    allResults : AllResults,
    workerState: WorkerState,
}
