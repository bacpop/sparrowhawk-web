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
    },

    async processRef(context: ActionContext<RootState, RootState>, payload: { acceptFiles: Array<File>, k: number }) {
        const { commit, state } = context;
        console.log("Ref file uploaded, k = " + payload.k)
        payload.acceptFiles.forEach((file: File) => {
            if (state.workerState.worker_ska) {
                state.workerState.worker_ska.postMessage({ref: true, file, k : payload.k});
                state.workerState.worker_ska.onmessage = (messageData) => {
                    console.log(messageData.data.ref.name + " has been indexed");
                    commit("addRef", {name: messageData.data.ref.name, sequences:messageData.data.sequences});
                };
            }
        });
    },
    async processQueryMap(context: ActionContext<RootState, RootState>, payload: {acceptFiles: Array<File>, proportion_reads: number}) {
        const { commit, state } = context;
        console.log("Query files uploaded mapping")
        const findReadPair = (fileName: string, files: Array<File>): { pairFile: File | undefined, sampleName: string } => {
            const baseName = fileName.replace(/(_1.fastq.gz|_1.fq.gz)$/, '');
            const pairNameFastq = baseName + '_2.fastq.gz';
            const pairNameFq = baseName + '_2.fq.gz';
            const pairFile = files.find(file => file.name === pairNameFastq || file.name === pairNameFq);
            return { pairFile, sampleName: baseName };
        };

        payload.acceptFiles.forEach((file: File) => {
            let sendJob: boolean = false;
            const messageData: any = { map: true, file, revReads: null, sampleName: null, proportion_reads: payload.proportion_reads };
            if (/(_1|_2)(.fastq.gz|.fq.gz)$/.test(file.name)) {
                const { pairFile, sampleName } = findReadPair(file.name, payload.acceptFiles);
                messageData.sampleName = sampleName;
                if (pairFile) {
                    messageData.revReads = pairFile;
                    sendJob = true;
                } else {
                    // Triggers on _2 input file too
                    if (/_1(.fastq.gz|.fq.gz)$/.test(file.name)) {
                        console.log(file.name + ": only one fastq found")
                    }
                }
            } else {
                messageData.sampleName = file.name.replace(/(.fasta|.fasta.gz|.fa|.fa.gz|.fq|.fastq)$/, '');
                sendJob = true;
            }

            if (sendJob) {
                commit("addQueryFileMap", messageData.sampleName);
                if (state.workerState.worker_ska) {
                    state.workerState.worker_ska.postMessage(messageData);
                    state.workerState.worker_ska.onmessage = (message) => {
                        console.log("Mapping variants: " + message.data.nb_variants);
                        console.log("Mapping coverage: " + message.data.coverage);
                        commit("setMapped", message.data);
                    };
                }
            }
        });
    },

    async processQueryAlign(context: ActionContext<RootState, RootState>, payload: { acceptFiles: Array<File>, k: number, proportion_reads: number }) {
        const { commit, state } = context;
        console.log("Query files uploaded alignment")
        //Initialize the aligned state so that we can know that it is loading
        commit("setAligned", {aligned:false, names: [], newick: ""})

        const messageData = { align: true, files: payload.acceptFiles, k: payload.k, proportion_reads: payload.proportion_reads};

        if (state.workerState.worker_ska) {
            state.workerState.worker_ska.postMessage(messageData);
            state.workerState.worker_ska.onmessage = (message) => {
                commit("setAligned", message.data);
            };
        }
    },

    async resetAllResults_ska(context: ActionContext<RootState, RootState>) {
        const { commit } = context;
        commit("resetAllResults_ska");
    }
};
