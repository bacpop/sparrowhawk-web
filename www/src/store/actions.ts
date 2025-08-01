import { ActionContext } from "vuex";
import { RootState } from "@/store/state";

export default {
    async processReads(context: ActionContext<RootState, RootState>, payload: {
        acceptFiles: Array<File>,
        k: number,
        min_count : number,
        min_qual : number,
        csize : number,
        do_bloom : boolean,
        do_fit : boolean,
    }) {
        const { commit, state } = context;
        console.log("Going to upload reads and assemble with k = " + payload.k + " min_count = " + payload.min_count + " min_qual = " + payload.min_qual + " csize = " + payload.csize + " do_bloom = " + payload.do_bloom)
        console.log("Checking number of uploaded files...")
        if (state.workerState.worker) {
            if (payload.acceptFiles.length == 2) {
                console.log("Removing errors if they are")
                commit("removeErrors");

                console.log("Two files uploaded. Saving filenames...")
                commit("setReadsFileNames", {file1 : payload.acceptFiles[0].name,
                                             file2 : payload.acceptFiles[1].name
                });

                state.min_count = payload.min_count;
                console.log("Preprocessing...");
                state.workerState.worker.postMessage({preprocess : true,
                                                     file1     : payload.acceptFiles[0],
                                                     file2     : payload.acceptFiles[1],
                                                     min_count : payload.min_count,
                                                     min_qual  : payload.min_qual,
                                                     k         : payload.k,
                                                     verbose   : true,
                                                     csize     : payload.csize,
                                                     do_bloom  : payload.do_bloom,
                                                     do_fit    : payload.do_fit,
                });

                state.workerState.worker.onmessage = (messageData) => {
                    if (messageData.data instanceof Object) {
                        if ("nKmers" in messageData.data) {
                            commit("setPreprocessing", {nKmers : messageData.data.nKmers,
                                                        histo  : messageData.data.histo,
                                                        used_min_count : messageData.data.used_min_count,
                            });
                        } else {
                            // Something wrong has happened
                            console.log("Error found during processing, resetting all.");
                            commit("setMemoryError");
                            commit("resetAllResults");
                        }
                    }
                };
            } else {
                console.log("No paired-end two files uploaded. This case is not supported.");
                commit("resetAllResults");
            }
        }
    },

    async doTheAssembly(context: ActionContext<RootState, RootState>, payload: {
        no_bubble_collapse  : boolean,
        no_dead_end_removal : boolean,
    }) {
        const { commit, state } = context;
        console.log("Assemblying reads...")
        if (state.workerState.worker) {
            console.log("Assemblying...");
            state.workerState.worker.postMessage({
                assemble : true,
                no_bubble_collapse  : payload.no_bubble_collapse,
                no_dead_end_removal : payload.no_dead_end_removal,
            });


            state.workerState.worker.onmessage = (messageData) => {
                commit("setAssembly", {ncontigs : messageData.data.ncontigs,
                                       outfasta : messageData.data.outfasta,
                                       outdot   : messageData.data.outdot,
                                       outgfa   : messageData.data.outgfa,
                                       outgfav2 : messageData.data.outgfav2,
                });
            };
        }
    },

    async resetAllResults(context: ActionContext<RootState, RootState>) {
        const { commit } = context;
        commit("resetAllResults");
    },

    async removeErrors(context: ActionContext<RootState, RootState>) {
        const { commit } = context;
        commit("removeErrors");
    }
};
