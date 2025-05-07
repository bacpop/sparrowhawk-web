import { RootState } from "@/store/state";
import { GetterTree } from "vuex";

export const getters: GetterTree<RootState, RootState> = {
    readsProcessed(state: RootState) {
        return state.readsSet == null ? false : true;
    },
    readsName(state: RootState) {
        return state.readsSet == null ? "" : state.readsSet;
    },
    queryAssembled(state: RootState) {
        return state.allResults.assemblyResults == "" ? false : true;
    },
}
