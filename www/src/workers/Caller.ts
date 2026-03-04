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

    async callGenes(fileName: string, input_file: File, metag: boolean, closed_ends: boolean, mask: boolean, tt: number, non_sd: boolean): Promise<void> {
        console.log("Starting gene calling for: " + fileName);
        await this.waitForWasm();

        try {
            // Always create fresh OrphosData to avoid gene count accumulation between files
            this.OrphosData = await this.wasm.OrphosData.new(metag, "gff", closed_ends, mask, non_sd, tt);

            await this.OrphosData!.analyse_genome(input_file);

            const results: CallResult = JSON.parse(this.OrphosData!.get_results("gff"));

            this.worker.postMessage({
                fileName,
                output_file: results.output_file,
                gene_count: results.gene_count,
                sequence_count: results.sequence_count
            });
        } catch {
            this.worker.postMessage({ error: true, fileName, message: 'memory' });
        }
    }

    resetAll(): void {
        this.OrphosData = null;
    }
}
