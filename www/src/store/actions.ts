import { ActionContext } from "vuex";
import { RootState } from "@/store/state";

export default {
    async processReads(context: ActionContext<RootState, RootState>, payload: { acceptFiles: Array<File>, k: number, min_count : number, min_qual : number }) {
        const { commit, state } = context;
        console.log("Going to upload reads and assemble with k = " + payload.k + " min_count = " + payload.min_count + " min_qual = " + payload.min_qual)

        if (state.workerState.worker) {
            if (payload.acceptFiles.length == 2) {
                console.log("Assemblying...");
                state.workerState.worker.postMessage({assemble : true,
                                                     file1     : payload.acceptFiles[0],
                                                     file2     : payload.acceptFiles[1],
                                                     min_count : payload.min_count,
                                                     min_qual  : payload.min_qual,
                                                     k         : payload.k,
                                                     verbose   : true,
                });


                state.workerState.worker.onmessage = (messageData) => {
                    commit("setAssembly", {contigs : messageData.data.contigs});
                };
            }
        }
    },

    async resetAllResults(context: ActionContext<RootState, RootState>) {
        const { commit } = context;
        commit("resetAllResults");
    }
};
