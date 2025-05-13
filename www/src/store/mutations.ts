import { RootState } from "@/store/state";

export default {
    SET_WORKER(state: RootState, worker: Worker | null) {
        state.workerState.worker = worker;
    },

    setPreprocessing(state: RootState, input: { nKmers : number, histo : [] }) {
        console.log("Preprocessing finished! Saving intermediate information in the state");
        console.log(input.nKmers);

        state.readsPreprocessing.nKmers = input.nKmers;
        state.readsPreprocessing.histo  = input.histo;

    },

    setAssembly(state: RootState, input: { ncontigs : number, outfasta : string }) {
        console.log("Assembly finished! Saving contigs as fasta in the state");

        state.allResults.nContigs    = input.ncontigs;
        state.allResults.fastaOutput = input.outfasta;

    },

    setReadsFileNames(state: RootState, input: { file1 : string, file2 : string }) {
        console.log("Setting names of reads");

        state.readsFileNames = input.file1 + "," + input.file2;

    },

    resetAllResults(state: RootState) {
        state.readsFileNames = null;
        state.readsPreprocessing = {
            nKmers : null,
            histo  : [],
        }
        state.allResults = {
            nContigs    : null,
            fastaOutput : "",
        };

        if (state.workerState.worker) {
            state.workerState.worker.postMessage({reset: true});
        }
    }
};
