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

    async preprocess(file1, file2, k, verbose, min_count, min_qual, csize, do_bloom) {
        await this.waitForWasm();

        if (this.helper === null) {
            try {
                this.helper = this.wasm.AssemblyHelper.new(file1, file2, k, verbose, min_count, min_qual, csize, do_bloom);
            } catch (error) {
                console.log("Webassembly error found! Most surely, memory issue.");
                console.error(error);
                this.worker.postMessage({reset : true});

                return;
            }
        }

        let resultsjson = JSON.parse(this.helper.get_preprocessing_info());

        this.worker.postMessage({ nKmers : resultsjson["nkmers"], histo : resultsjson["histo"] });
    }

    async assemble() {
        // await this.waitForWasm();
        console.log("Initiating assembly from worker");
        this.helper.assemble();

        console.log("Assembly finished");
        let resultsjson = JSON.parse(this.helper.get_assembly());

        console.log("Posting output as message");
        this.worker.postMessage({ outfasta: resultsjson["outfasta"], ncontigs : resultsjson["ncontigs"], outdot : resultsjson["outdot"], outgfa : resultsjson["outgfa"], outgfav2 : resultsjson["outgfav2"] });
    }

    resetAll() {
        this.helper = null;
    }
}
