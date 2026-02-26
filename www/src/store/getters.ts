import {RootState} from "@/store/state";
import {GetterTree} from "vuex";

export const getters: GetterTree<RootState, RootState> = {
    // Processing state getters
    isPreprocessing(state: RootState): boolean {
        return state.processingState.isPreprocessing;
    },
    isAssembling(state: RootState): boolean {
        return state.processingState.isAssembling;
    },
    isIndexingRef(state: RootState): boolean {
        return state.processingState.isIndexingRef;
    },
    isMapping(state: RootState): boolean {
        return state.processingState.isMapping;
    },
    isMappingFiles(state: RootState): Set<string> {
        return state.processingState.isMappingFiles;
    },
    isAligning(state: RootState): boolean {
        return state.processingState.isAligning;
    },
    isIdentifying(state: RootState): boolean {
        return state.processingState.isIdentifying;
    },
    isAnyProcessing(state: RootState): boolean {
        return state.processingState.isPreprocessing ||
            state.processingState.isAssembling ||
            state.processingState.isIndexingRef ||
            state.processingState.isMapping ||
            state.processingState.isAligning ||
            state.processingState.isIdentifying;
    },
    assemblyState(state: RootState): string {
        return state.processingState.assemblyState;
    },
    readsProcessing(state: RootState) {
        return (state.readsFileNames != null && state.allResults.nContigs == null);
    },
    readsPreprocessing(state: RootState) {
        return (state.readsFileNames != null && state.allResults.nContigs == null && state.readsPreprocessing.nKmers == null);
    },
    readsPreprocessed(state: RootState) {
        return (state.readsPreprocessing.nKmers != null);
    },
    queryAssembled(state: RootState) {
        return state.allResults.fastaOutput != "";
    },
    getErrors(state: RootState) {
        return (state.errors != "");
    },
    readsName(state: RootState) {
        return state.readsFileNames;
    },

    // SKA
    refProcessed(state: RootState) {
        console.log("Ref processed (getters)")
        return state.refSet != null;
    },
    refName(state: RootState) {
        return state.refSet == null ? "" : state.refSet;
    },
    queryProcessed(state: RootState) {
        const first_input: string = Object.keys(state.allResults_ska.mapResults)[0]
        console.log(state.allResults_ska.mapResults[first_input] ? state.allResults_ska.mapResults[first_input].mapped : false)
        return state.allResults_ska.mapResults[first_input] ? state.allResults_ska.mapResults[first_input].mapped : false;
    },
    alignmentProcessed(state: RootState) {
        return state.allResults_ska.alignResults[0] ? state.allResults_ska.alignResults[0].aligned : false;
    },

    // SKETCHLIB
    sampleIdentified(state: RootState) {
        return Object.keys(state.allResults_sketchlib.results).length > 0;
    },
    isIdentifyingFiles(state: RootState): Set<string> {
        return state.processingState.isIdentifyingFiles;
    },
    sketchlibResults(state: RootState) {
        return state.allResults_sketchlib.results;
    },
    
    // ORPHOS
    genesCalled(state: RootState) {
       return state.allResults_orphos.geneCount != null;
    },
    callingGenes(state: RootState) {
        return state.allResults_orphos.callingGenes;
    },

    // DEACON
    deaconIndexLoaded(state: RootState) { return state.allResults_deacon.indexLoaded; },
    isFilteringDeacon(state: RootState)  { return state.allResults_deacon.isFiltering; },
    deaconFiltered(state: RootState)     { return state.allResults_deacon.outputGzip !== null; },
    isLoadingDeaconIndex(state: RootState) { return state.allResults_deacon.isLoadingIndex; },
}
