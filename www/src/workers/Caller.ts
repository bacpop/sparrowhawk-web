interface CallResult {
    output_file: string;
    gene_count: number;
    sequence_count: number;
}

interface OrphosData {
    analyse_genome(input_file: File): Promise<void>;
    get_results(format: string): string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WasmModuleAny = any;

export class Caller {
    worker: Worker;
    wasm: WasmModuleAny | null;
    OrphosData: OrphosData | null;
    wasmPromise: Promise<WasmModuleAny>;

    constructor(worker: Worker) {
        this.worker = worker;
        this.OrphosData = null;
        this.wasm = null;
        this.wasmPromise = new Promise((resolve) => {
            import("@/pkg_orphos-bridge")
                .then((w) => {
                    this.wasm = w;
                    resolve(w);
                });
        });
    }

    waitForWasm(): Promise<WasmModuleAny> {
        return this.wasm ? Promise.resolve(this.wasm) : this.wasmPromise;
    }

    async callGenes(input_file: File, metag: boolean, closed_ends: boolean, mask: boolean, tt: number, non_sd: boolean): Promise<void> {
        console.log("Starting gene calling...");
        await this.waitForWasm();

        if (this.OrphosData === null) {
            // TODO: output formats
            this.OrphosData = await this.wasm.OrphosData.new(metag, "gff", closed_ends, mask, non_sd, tt);
        }

        await this.OrphosData!.analyse_genome(input_file);

        const results: CallResult = JSON.parse(this.OrphosData!.get_results("gff"));

        this.worker.postMessage({
            output_file: results.output_file, 
            gene_count: results.gene_count,
            sequence_count: results.sequence_count
        });
    }

    resetAll(): void {
        this.OrphosData = null;
    }
}
