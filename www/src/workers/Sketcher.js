export class Sketcher {
    worker;
    wasm;
    SketchlibData;

    constructor(worker) {
        this.worker = worker;
        this.SketchlibData = null;
        this.wasm = null;
        this.wasmPromise = new Promise(resolve => {
            import("@/pkg_sketchlib")
                .then((w) => {
                    this.wasm = w;
                    resolve(w);
                });
        });
    }

    waitForWasm() {
        return this.wasm ? Promise.resolve(this.wasm) : this.wasmPromise;
    }

    async identifyThisFile(file1, file2) {
        console.log("Starting identification...")
        await this.waitForWasm();

        if (this.SketchlibData === null) {
            const response = await fetch('/inverted_k_17_ss_10.ski');
            const invertedindex = await response.blob();

            this.SketchlibData = await this.wasm.SketchlibData.new(invertedindex);
        }

        await this.SketchlibData.query(file1, file2);

        let results = JSON.parse(this.SketchlibData.get_probs(3));

        this.worker.postMessage({ probs: results["probs"], names : results["names"], metadata : results["metadata"] });
    }

    resetAll() {
        this.SketchlibData = null;
    }
}
