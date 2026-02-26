export type Dict<T> = Record<string, T>

export interface WorkerState {
    worker: Worker | null;
    worker_ska: Worker | null;
    worker_orphos: Worker | null;
    worker_deacon: Worker | null;
    workers_sketchlib: Worker[];
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
    alignment: string
}

export interface AllResultsSka {
    alignResults: Dict<Alignment>
    mapResults: Dict<IsolateMapping>
    ref: string[]
}

export interface SampleIdentifyResult {
    idProbs: number[]
    idSpecies: string[]
    idMetadata: string[]
}

export interface AllResultsSketchlib {
    results: Dict<SampleIdentifyResult>
}

export interface AllResultsOrphos {
    outputFile: string
    geneCount: number | null
    sequenceCount: number | null
    callingGenes: boolean
}

export interface AllResultsDeacon {
    indexFileName: string | null;
    indexInfo: string | null;
    indexLoaded: boolean;
    isLoadingIndex: boolean;
    isFiltering: boolean;
    readsFileName: string | null;
    totalReads: number | null;
    keptReads: number | null;
    removedReads: number | null;
    outputGzip: Uint8Array | null;
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
    isIdentifyingFiles: Set<string>;  // Track which files are being identified
    assemblyState: string;  // Current state from Sparrowhawk assembly
}
