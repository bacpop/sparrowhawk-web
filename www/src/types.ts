export type Dict<T> = Record<string, T>

export interface WorkerState {
    worker: Worker | null;
    worker_ska: Worker | null;
    worker_sketchlib: Worker | null;
    worker_orphos: Worker | null;
}

export interface AllResults {
    nContigs: number | null;
    fastaOutput: string;
    dotOutput: string;
    gfaOutput: string;
    gfav2Output: string;
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

export interface AllResultsSketchlib {
    idProbs: number[] | null
    idSpecies: string[] | null
    idMetadata: string[] | null
}

export interface AllResultsOrphos {
    outputFile: string
    geneCount: number | null
    sequenceCount: number | null
    callingGenes: boolean
}

export interface ReadsPreprocessing {
    nKmers: number | null;
    histo: [];
    used_min_count: number | null;
}

export interface ProcessingState {
    isPreprocessing: boolean;
    isAssembling: boolean;
    isIndexingRef: boolean;
    isMapping: boolean;
    isMappingFiles: Set<string>;  // Track which files are being mapped
    isAligning: boolean;
    isIdentifying: boolean;
}
