export type Dict<T> = Record<string, T>

export interface WorkerState {
    worker: Worker | null;
}

export interface AllResults {
    nContigs    : number | null;
    fastaOutput : string;
    dotOutput   : string;
    gfaOutput   : string;
    gfav2Output   : string;
}

export interface ReadsPreprocessing {
    nKmers : number | null;
    histo  : [];
}
