interface MapResult {
    "Number of variants": number;
    "Coverage": number;
    "Mapped sequences": string[];
}

interface AlignResult {
    names: string[];
    newick: string;
    alignment: string;
}

interface SkaData {
    get_reference(): string;
    map(file: File, revReadFile: File | null, proportion_reads: number, min_count: number, min_qual: number, qual_filter: number): string;
}

interface AlignData {
    align(files: File[], proportion_reads: number, min_count: number, min_qual: number, qual_filter: number): string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WasmModuleAny = any;

export class Mapper {
    worker: Worker;
    wasm: WasmModuleAny | null;
    SkaData: SkaData | null;
    AlignData: AlignData | null;
    wasmPromise: Promise<WasmModuleAny>;

    constructor(worker: Worker) {
        this.worker = worker;
        this.SkaData = null;
        this.AlignData = null;
        this.wasm = null;
        this.wasmPromise = new Promise((resolve) => {
            import("@/pkg_ska")
                .then((w) => {
                    this.wasm = w;
                    resolve(w);
                });
        });
    }

    waitForWasm(): Promise<WasmModuleAny> {
        return this.wasm ? Promise.resolve(this.wasm) : this.wasmPromise;
    }

    async set_ref(file: File, k: number, rc: boolean, ambig_mask: boolean, repeat_mask: boolean): Promise<void> {
        await this.waitForWasm();

        if (this.SkaData === null) {
            this.SkaData = this.wasm.SkaData.new(file, k, rc, ambig_mask, repeat_mask);
        }
        this.worker.postMessage({
            ref: file,
            sequences: this.SkaData!.get_reference().split('\n')
        });
    }

    map(file: File, revReadFile: File | null, proportion_reads: number, min_count: number, min_qual: number, qual_filter: number): void {
        console.log("Mapping reads to reference with proportion_reads: " + proportion_reads);
        if (this.SkaData === null) {
            throw new Error("SkaRef::map - reference does not exist yet.");
        }

        const results: MapResult = JSON.parse(this.SkaData.map(file, revReadFile, proportion_reads, min_count, min_qual, qual_filter));

        this.worker.postMessage({
            nb_variants: results["Number of variants"],
            coverage: results["Coverage"],
            name: file.name.replace(/(.fasta|.fasta.gz|.fa|.fa.gz|.fq|.fq.gz|.fastq|.fastq.gz|_1.fq.gz|_1.fastq.gz)$/, ''),
            mapped_sequences: results["Mapped sequences"],
        });
    }

    align(files: File[], proportion_reads: number, rc: boolean, k: number, min_count: number, min_qual: number, qual_filter: number): void {
        console.log("Processing uploaded fastX files with proportion_reads: " + proportion_reads + " and k: " + k);

        if (this.AlignData === null) {
            this.AlignData = this.wasm.AlignData.new(k, rc);
        }

        const results: AlignResult = JSON.parse(this.AlignData!.align(files, proportion_reads, min_count, min_qual, qual_filter));

        this.worker.postMessage({
            aligned: true,
            names: results.names,
            newick: results.newick,
            alignment: results.alignment
        });
    }

    resetAll(): void {
        this.SkaData = null;
        this.AlignData = null;
    }
}
