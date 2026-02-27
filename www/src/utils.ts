import {RootState} from "@/store/state";

export const emptyState = (): RootState => ({
    readsFileNames: null,
    errors: "",
    min_count: 0,
    refSet: null,

    readsPreprocessing: {
        nKmers: null,
        histo: [],
        used_min_count: null,
    },

    allResults: {
        nContigs: null,
        fastaOutput: "",
        dotOutput: "",
        gfaOutput: "",
        gfav2Output: "",
    },

    allResults_ska: {
        mapResults: {},
        alignResults: {},
        ref: [],
    },

    allResults_sketchlib: {
        results: {},
    },

    allResults_orphos: {
        outputFile: "",
        geneCount: null,
        sequenceCount: null,
        callingGenes: false,
    },

    allResults_deacon: {
        indexFileName: null,
        indexInfo: null,
        indexLoaded: false,
        isLoadingIndex: false,
        isFiltering: false,
        readsFileName: null,
        readsFileName2: null,
        totalReads: null,
        keptReads: null,
        removedReads: null,
        outputGzip: null,
        outputGzip2: null,
    },

    workerState: {
        worker: null,
        worker_ska: null,
        worker_orphos: null,
        worker_deacon: null,
        workers_sketchlib: [],
    },

    processingState: {
        isPreprocessing: false,
        isAssembling: false,
        isIndexingRef: false,
        isMapping: false,
        isMappingFiles: new Set<string>(),
        isAligning: false,
        isIdentifying: false,
        isIdentifyingFiles: new Set<string>(),
        assemblyState: '',
    },
});

export const findReadPair = (fileName: string, files: Array<File>): {
    pairFile: File | undefined,
    sampleName: string
} => {
    const baseName = fileName.replace(regExpWithOneOnly, '');
    const pairNameFastq = baseName + '_2.fastq';
    const pairNameFq = baseName + '_2.fq';
    const pairNameFastqGz = baseName + '_2.fastq.gz';
    const pairNameFqGz = baseName + '_2.fq.gz';
    const pairFile = files.find(file => file.name === pairNameFastq || file.name === pairNameFq || file.name === pairNameFqGz || file.name === pairNameFastqGz);
    return {pairFile, sampleName: baseName};
};

export const fastqExtensionsWithDot = ".fastq|.fastq.gz|.fq|.fq.gz";
export const fastxExtensionsWithDot = ".fasta|.fasta.gz|.fa|.fa.gz|.fq|.fq.gz|.fastq|.fastq.gz";

export const regExpWithTwoNumbers = new RegExp("/(_1|_2)(" + fastqExtensionsWithDot + ")$/");
export const regExpWithOneOnly = new RegExp("/_1(" + fastqExtensionsWithDot + ")$/");
export const regExpForAnyFastx = new RegExp("/(" + fastxExtensionsWithDot + ")$/");