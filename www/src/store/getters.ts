import { RootState } from "@/store/state";
import { GetterTree } from "vuex";

export const getters: GetterTree<RootState, RootState> = {
    readsProcessing(state: RootState) {
        return (state.readsFileNames != null && state.allResults.nContigs == null) ? true : false;
    },
    readsPreprocessing(state: RootState) {
        return (state.readsFileNames != null && state.allResults.nContigs == null && state.readsPreprocessing.nKmers == null) ? true : false;
    },
    readsPreprocessed(state: RootState) {
        return (state.readsPreprocessing.nKmers != null) ? true : false;
    },
    queryAssembled(state: RootState) {
        return state.allResults.fastaOutput == "" ? false : true;
    },
    getErrors(state: RootState) {
        return (state.errors == "") ? false : true;
    },
    readsName(state: RootState) {
        return state.readsFileNames;
    },

    // SKA

    refProcessed(state: RootState) {
        console.log("Ref processed (getters)")
        return state.refSet == null ? false : true;
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
    }
}
