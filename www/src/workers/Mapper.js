export class Mapper {
    worker;
    wasm;
    SkaRef;

    constructor(worker) {
        this.worker = worker;
        this.SkaData = null;
        this.AlignData = null;
        this.wasm = null;
        this.wasmPromise = new Promise(resolve => {
            import("@/pkg_ska")
                .then((w) => {
                    this.wasm = w;
                    resolve(w);
                });
        });
    }

    waitForWasm() {
        return this.wasm ? Promise.resolve(this.wasm) : this.wasmPromise;
    }

    async set_ref(file, k) {
        await this.waitForWasm();

        if (this.SkaData === null) {
            this.SkaData = this.wasm.SkaData.new(file, k);
        }
        this.worker.postMessage({ ref: file, sequences: this.SkaData.get_reference().split('\n') });
    }

    map(file, revReadFile, proportion_reads) {
        console.log("Mapping reads to reference with proportion_reads: " + proportion_reads);
        if (this.SkaData === null) {
            throw new Error("SkaRef::map - reference does not exist yet.");
        }

        let results = JSON.parse(this.SkaData.map(file, revReadFile, proportion_reads));

        this.worker.postMessage({ nb_variants: results["Number of variants"], 
                                  coverage: results["Coverage"], 
                                  name: file.name.replace(/(.fasta|.fasta.gz|.fa|.fa.gz|.fq|.fq.gz|.fastq|.fastq.gz|_1.fq.gz|_1.fastq.gz)$/, ''),
                                  mapped_sequences: results["Mapped sequences"],
                                });
    }

    align(files, proportion_reads, k) {
        console.log("Processing uploaded fastX files with proportion_reads: " + proportion_reads + " and k: " + k);

        if (this.AlignData === null) {
            this.AlignData = this.wasm.AlignData.new(k);
        }

        let results = JSON.parse(this.AlignData.align(files, proportion_reads));

        this.worker.postMessage({ 
            aligned: true,
            names: results["names"],
            newick: results["newick"],
        });
    }

    resetAll() {
        this.SkaData = null;
        this.AlignData = null;
    }
}
