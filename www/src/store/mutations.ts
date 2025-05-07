import { RootState } from "@/store/state";

export default {
    SET_WORKER(state: RootState, worker: Worker | null) {
        state.workerState.worker = worker;
    },

    setAssembly(state: RootState, input: { contigs : string }) {
        console.log("Assembly finished! Saving contigs as fasta in the state");

        // This seems to be for nothing, so let's do exactly that for now

        state.allResults.assemblyResults = input.contigs; //akfjsdklfjskldajfklsdajfkl

    },

    resetAllResults(state: RootState) {
        state.allResults= {
            assemblyResults : ""
        };

        if (state.workerState.worker) {
            state.workerState.worker.postMessage({reset: true});
        }
    }
};
