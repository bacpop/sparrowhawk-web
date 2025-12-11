export class Caller {
    worker;
    wasm;
    OrphosData;

    constructor(worker) {
        this.worker = worker;
        this.OrphosData = null;
        this.wasm = null;
        this.wasmPromise = new Promise(resolve => {
            import("@/pkg_orphos-bridge")
                .then((w) => {
                    this.wasm = w;
                    resolve(w);
                });
        });
    }

    waitForWasm() {
        return this.wasm ? Promise.resolve(this.wasm) : this.wasmPromise;
    }

    async callGenes(inputfile) {
        console.log("Starting gene calling...")
        await this.waitForWasm();
        
        if (this.OrphosData === null) {
            // This is temporal, eventually we'd want to put all parameters
            this.OrphosData = await this.wasm.OrphosData.new("single", "gff", false, false, false, null);
        }

        await this.OrphosData.analyse_genome(inputfile);

        let results = JSON.parse(this.OrphosData.get_results("gff"));

        this.worker.postMessage({
            output_file     : results["output_file"], 
            gene_count      : results["gene_count"],
            sequence_count  : results["sequence_count"] });
    }

    resetAll() {
        this.OrphosData = null;
    }
}
