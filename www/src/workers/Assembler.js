export class Assembler {
    worker;
    wasm;
    helper;

    constructor(worker) {
        this.worker = worker;
        this.helper = null;
        this.wasm   = null;

        this.wasmPromise = new Promise(resolve => {
            import("@/pkg")
                .then((w) => {
                    this.wasm = w;
                    resolve(w);
                });
        });
    }

    waitForWasm() {
        return this.wasm ? Promise.resolve(this.wasm) : this.wasmPromise;
    }

    async assemble(file1, file2, k, verbose, min_count, min_qual) {
        await this.waitForWasm();

        if (this.helper === null) {
            this.helper = this.wasm.AssemblyHelper.new(file1, file2, k, verbose, min_count, min_qual);
        }

        let resultsjson = JSON.parse(this.helper.get_assembly());

        this.worker.postMessage({ contigs: resultsjson["outfasta"] });
    }

    resetAll() {
        this.helper = null;
    }
}
