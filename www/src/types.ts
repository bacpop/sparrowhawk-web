export type Dict<T> = Record<string, T>

export interface WorkerState {
    worker:     Worker | null;
    worker_ska: Worker | null;
}

export interface AllResults {
    nContigs    : number | null;
    fastaOutput : string;
    dotOutput   : string;
    gfaOutput   : string;
    gfav2Output   : string;
}

export interface IsolateMapping {
    mapped: boolean
    nb_variants?: number | null
    coverage?: number | null
    mapped_sequences?: string[]
}

export interface Alignment {
    aligned: boolean
    names?: string[]
    newick?: string
}

export interface AllResultsSka {
    alignResults: Dict<Alignment>
    mapResults: Dict<IsolateMapping>
    ref: string[]
}

export interface ReadsPreprocessing {
    nKmers : number | null;
    histo  : [];
    used_min_count : number | null;
}
