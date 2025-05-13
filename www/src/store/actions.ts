import { ActionContext } from "vuex";
import { RootState } from "@/store/state";

export default {
    async processReads(context: ActionContext<RootState, RootState>, payload: { acceptFiles: Array<File>, k: number, min_count : number, min_qual : number }) {
        const { commit, state } = context;
        console.log("Going to upload reads and assemble with k = " + payload.k + " min_count = " + payload.min_count + " min_qual = " + payload.min_qual)
        console.log("Checking number of uploaded files...")
        if (state.workerState.worker) {
            if (payload.acceptFiles.length == 2) {
                console.log("Two files uploaded. Saving filenames...")
                commit("setReadsFileNames", {file1 : payload.acceptFiles[0].name,
                                             file2 : payload.acceptFiles[1].name
                });

                console.log("Preprocessing...");
                state.workerState.worker.postMessage({preprocess : true,
                                                     file1     : payload.acceptFiles[0],
                                                     file2     : payload.acceptFiles[1],
                                                     min_count : payload.min_count,
                                                     min_qual  : payload.min_qual,
                                                     k         : payload.k,
                                                     verbose   : true,
                });

                state.workerState.worker.onmessage = (messageData) => {
                    commit("setPreprocessing", {nKmers : messageData.data.nKmers,
                                                histo  : messageData.data.histo,
                    });
                };
            } else {
                console.log("No paired-end two files uploaded. This case is not supported.");
                commit("resetAllResults");
            }
        }
    },

    async doTheAssembly(context: ActionContext<RootState, RootState>) {
        const { commit, state } = context;
        console.log("Assemblying reads...")
        if (state.workerState.worker) {
            console.log("Assemblying...");
            state.workerState.worker.postMessage({assemble : true});


            state.workerState.worker.onmessage = (messageData) => {
                commit("setAssembly", {ncontigs : messageData.data.ncontigs,
                                       outfasta : messageData.data.outfasta,
                });
            };
        }
    },

    async resetAllResults(context: ActionContext<RootState, RootState>) {
        const { commit } = context;
        commit("resetAllResults");
    }
};
