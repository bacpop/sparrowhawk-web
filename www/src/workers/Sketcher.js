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
            const response = await fetch('/inverted.ski');
            const invertedindex = await response.blob();
            console.log("Types: " + file1.constructor.name + " " + invertedindex.constructor.name + " " + response.constructor.name );

            this.SketchlibData = this.wasm.SketchlibData.new(file1, file2, invertedindex);
        }

        this.worker.postMessage({ results: this.SketchlibData.get_probs() });
    }

    resetAll() {
        this.SketchlibData = null;
    }
}
