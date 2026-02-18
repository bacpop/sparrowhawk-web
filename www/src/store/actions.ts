import {ActionContext} from "vuex";
import {RootState} from "@/store/state";
import WorkerSketcher from '@/workers/Sketcher.worker';

export default {
    async processReads(context: ActionContext<RootState, RootState>, payload: {
        acceptFiles: Array<File>,
        k: number,
        min_count: number,
        min_qual: number,
        csize: number,
        do_bloom: boolean,
        do_fit: boolean,
        no_bubble_collapse: boolean,
        no_dead_end_removal: boolean
    }) {
        const {commit, state} = context;
        console.log("Going to upload reads and assemble with k = " + payload.k + " min_count = " + payload.min_count + " min_qual = " + payload.min_qual + " csize = " + payload.csize + " do_bloom = " + payload.do_bloom)
        console.log("Checking number of uploaded files...")
        if (state.workerState.worker) {
            if (payload.acceptFiles.length == 2) {
                commit("resetAllResults");

                console.log("Removing errors if they are")
                commit("removeErrors");

                console.log("Two files uploaded. Saving filenames...")
                commit("setReadsFileNames", {
                    file1: payload.acceptFiles[0].name,
                    file2: payload.acceptFiles[1].name
                });

                state.min_count = payload.min_count;
                console.log("Preprocessing...");

                // Set processing state
                commit("setPreprocessingState", true);

                state.workerState.worker.postMessage({
                    preprocess: true,
                    file1: payload.acceptFiles[0],
                    file2: payload.acceptFiles[1],
                    min_count: payload.min_count,
                    min_qual: payload.min_qual,
                    k: payload.k,
                    verbose: true,
                    csize: payload.csize,
                    do_bloom: payload.do_bloom,
                    do_fit: payload.do_fit,
                    no_bubble_collapse: payload.no_bubble_collapse,
                    no_dead_end_removal: payload.no_dead_end_removal
                });

                state.workerState.worker.onmessage = (messageData) => {
                    // Handle state progress messages from Sparrowhawk wasm
                    if (messageData.data instanceof Object && "assemblyState" in messageData.data) {
                        console.log("[Sparrowhawk] State:", messageData.data.assemblyState);
                        commit("setAssemblyState", messageData.data.assemblyState);
                        return;
                    }

                    // Clear processing state
                    commit("setPreprocessingState", false);
                    commit("setAssemblyState", "");

                    if (messageData.data instanceof Object) {
                        if ("nKmers" in messageData.data) {
                            commit("setPreprocessing", {
                                nKmers: messageData.data.nKmers,
                                histo: messageData.data.histo,
                                used_min_count: messageData.data.used_min_count,
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

    async doTheAssembly(context: ActionContext<RootState, RootState>) {
        const {commit, state} = context;
        console.log("Assemblying reads...")
        if (state.workerState.worker) {
            console.log("Assemblying...");

            // Set assembling state
            commit("setAssemblingState", true);

            state.workerState.worker.postMessage({
                assemble: true,
            });


            state.workerState.worker.onmessage = (messageData) => {
                // Handle state progress messages from WASM
                if ("assemblyState" in messageData.data) {
                    console.log("[Sparrowhawk] Assembly state:", messageData.data.assemblyState);
                    commit("setAssemblyState", messageData.data.assemblyState);
                    return;
                }

                // Clear assembling state
                commit("setAssemblingState", false);
                commit("setAssemblyState", "");

                commit("setAssembly", {
                    ncontigs: messageData.data.ncontigs,
                    outfasta: messageData.data.outfasta,
                    outdot: messageData.data.outdot,
                    outgfa: messageData.data.outgfa,
                    outgfav2: messageData.data.outgfav2,
                });
            };
        }
    },

    async resetAllResults(context: ActionContext<RootState, RootState>) {
        const {commit} = context;
        commit("resetAllResults");
    },

    async removeErrors(context: ActionContext<RootState, RootState>) {
        const {commit} = context;
        commit("removeErrors");
    },

    async processRef(context: ActionContext<RootState, RootState>, payload: { acceptFiles: Array<File>, k: number }) {
        const {commit, state} = context;
        console.log("Ref file uploaded, k = " + payload.k)

        // Set indexing state
        commit("setIndexingRefState", true);

        payload.acceptFiles.forEach((file: File) => {
            if (state.workerState.worker_ska) {
                state.workerState.worker_ska.postMessage({ref: true, file, k: payload.k});
                state.workerState.worker_ska.onmessage = (messageData) => {
                    // Clear indexing state
                    commit("setIndexingRefState", false);

                    console.log(messageData.data.ref.name + " has been indexed");
                    commit("addRef", {name: messageData.data.ref.name, sequences: messageData.data.sequences});
                };
            }
        });
    },

    async processQueryMap(context: ActionContext<RootState, RootState>, payload: {
        acceptFiles: Array<File>,
        proportion_reads: number
    }) {
        const {commit, state} = context;
        console.log("Query files uploaded mapping")
        const findReadPair = (fileName: string, files: Array<File>): {
            pairFile: File | undefined,
            sampleName: string
        } => {
            const baseName = fileName.replace(/(_1.fastq.gz|_1.fq.gz)$/, '');
            const pairNameFastq = baseName + '_2.fastq.gz';
            const pairNameFq = baseName + '_2.fq.gz';
            const pairFile = files.find(file => file.name === pairNameFastq || file.name === pairNameFq);
            return {pairFile, sampleName: baseName};
        };

        // Set mapping state
        commit("setMappingState", true);

        payload.acceptFiles.forEach((file: File) => {
            let sendJob: boolean = false;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const messageData: any = {
                map: true,
                file,
                revReads: null,
                sampleName: null,
                proportion_reads: payload.proportion_reads
            };
            if (/(_1|_2)(.fastq.gz|.fq.gz)$/.test(file.name)) {
                const {pairFile, sampleName} = findReadPair(file.name, payload.acceptFiles);
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
                // Track this file as being mapped
                commit("addMappingFile", messageData.sampleName);
                commit("addQueryFileMap", messageData.sampleName);
                if (state.workerState.worker_ska) {
                    state.workerState.worker_ska.postMessage(messageData);
                    state.workerState.worker_ska.onmessage = (message) => {
                        console.log("Mapping variants: " + message.data.nb_variants);
                        console.log("Mapping coverage: " + message.data.coverage);

                        // Remove this file from mapping set
                        commit("removeMappingFile", message.data.name);

                        commit("setMapped", message.data);
                    };
                }
            }
        });
    },

    async processQueryAlign(context: ActionContext<RootState, RootState>, payload: {
        acceptFiles: Array<File>,
        k: number,
        proportion_reads: number
    }) {
        const {commit, state} = context;
        console.log("Processing query of uploaded files for alignment...")

        // Initialize the aligned state so that we can know that it is loading
        commit("setAligned", {aligned: false, names: [], newick: ""})

        // Set aligning state
        commit("setAligningState", true);

        const messageData = {
            align: true,
            files: payload.acceptFiles,
            k: payload.k,
            proportion_reads: payload.proportion_reads
        };

        if (state.workerState.worker_ska) {
            state.workerState.worker_ska.postMessage(messageData);
            state.workerState.worker_ska.onmessage = (message) => {
                // Clear aligning state
                commit("setAligningState", false);

                commit("setAligned", message.data);
            };
        }
    },

    async resetAllResults_ska(context: ActionContext<RootState, RootState>) {
        const {commit} = context;
        commit("resetAllResults_ska");
    },

    async identifyFiles(context: ActionContext<RootState, RootState>, payload: { acceptFiles: Array<File> }) {
        const {commit, state} = context;
        console.log("Uploaded file(s) for taxonomic identification");

        const pool = state.workerState.workers_sketchlib;
        if (!pool.length) {
            console.log("No sketchlib workers available");
            return;
        }

        // Helper to find paired-end read file
        const findReadPair = (fileName: string, files: Array<File>): {
            pairFile: File | undefined,
            sampleName: string
        } => {
            const baseName = fileName.replace(/(_1.fastq.gz|_1.fq.gz)$/, '');
            const pairNameFastq = baseName + '_2.fastq.gz';
            const pairNameFq = baseName + '_2.fq.gz';
            const pairFile = files.find(file => file.name === pairNameFastq || file.name === pairNameFq);
            return {pairFile, sampleName: baseName};
        };

        // Build list of samples to process
        interface SampleToProcess {
            sampleName: string;
            file1: File;
            file2: File | null;
        }
        const samplesToProcess: SampleToProcess[] = [];

        payload.acceptFiles.forEach((file: File) => {
            if (/(_1|_2)(.fastq.gz|.fq.gz)$/.test(file.name)) {
                if (/_1(.fastq.gz|.fq.gz)$/.test(file.name)) {
                    const {pairFile, sampleName} = findReadPair(file.name, payload.acceptFiles);
                    if (pairFile) {
                        samplesToProcess.push({sampleName, file1: file, file2: pairFile});
                    } else {
                        console.log(file.name + ": only one fastq found, skipping");
                    }
                }
            } else {
                const sampleName = file.name.replace(/(.fasta|.fasta.gz|.fa|.fa.gz|.fq|.fq.gz|.fastq|.fastq.gz)$/, '');
                samplesToProcess.push({sampleName, file1: file, file2: null});
            }
        });

        if (samplesToProcess.length === 0) {
            console.log("No valid samples found to process");
            return;
        }

        // Attach a result handler to each worker in the pool
        pool.forEach((worker) => {
            worker.onmessage = (messageData) => {
                if (messageData.data instanceof Object) {
                    if ("probs" in messageData.data && "sampleName" in messageData.data) {
                        const sampleName = messageData.data.sampleName;
                        console.log("Saving results for sample: " + sampleName);
                        commit("removeIdentifyingFile", sampleName);
                        commit("saveIDResults", {
                            sampleName: sampleName,
                            probs: messageData.data.probs,
                            names: messageData.data.names,
                            metadata: messageData.data.metadata
                        });
                    } else {
                        console.log("Error found during processing");
                    }
                }
            };
        });

        // Distribute samples across the pool via round-robin
        samplesToProcess.forEach((sample, index) => {
            const worker = pool[index % pool.length];
            console.log(`Queuing identification for sample: ${sample.sampleName} on worker ${index % pool.length}`);
            commit("addIdentifyingFile", sample.sampleName);
            worker.postMessage({
                identify: true,
                file1: sample.file1,
                file2: sample.file2,
                sampleName: sample.sampleName,
            });
        });
    },

    async initSketchlibWorkers(context: ActionContext<RootState, RootState>, numWorkers: number) {
        const {commit, state} = context;
        // Terminate existing workers
        for (const worker of state.workerState.workers_sketchlib) {
            worker.terminate();
        }
        // Spawn new pool
        const pool: Worker[] = [];
        for (let i = 0; i < numWorkers; i++) {
            pool.push(new WorkerSketcher());
        }
        console.log(`Spawned ${numWorkers} sketchlib worker(s)`);
        commit("SET_WORKERS_SKETCHLIB", pool);
    },

    async resetAllResults_sketchlib(context: ActionContext<RootState, RootState>) {
        const {commit} = context;
        commit("resetAllResults_sketchlib");
    },

};
