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
}
