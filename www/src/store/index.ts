import Vuex from "vuex";
import actions from "@/store/actions";
import mutations from "@/store/mutations";
import {getters} from "@/store/getters";
import {RootState} from "@/store/state";
import {emptyState} from "@/utils";

export default new Vuex.Store<RootState>({
    state: emptyState(),
    getters,
    mutations,
    actions,
    modules: {}
});
