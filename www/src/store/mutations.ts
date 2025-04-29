import { RootState } from "@/store/state";

export default {
    SET_WORKER(state: RootState, worker: Worker | null) {
        state.workerState.worker = worker;
    },

    assemble(state: RootState, input: { name: string, sequences: string[] }) {
        console.log("vuex: Assemblying thing" + input.name);

        // This seems to be for nothing, so let's do exactly that for now

        // state.allResults.assemblyResults = ; //akfjsdklfjskldajfklsdajfkl

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
