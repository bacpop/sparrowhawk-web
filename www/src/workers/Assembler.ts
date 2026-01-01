interface PreprocessingResult {
    nkmers: number;
    histo: number[];
    used_min_count: number;
}

interface AssemblyResult {
    outfasta: string;
    ncontigs: number;
    outdot: string;
    outgfa: string;
    outgfav2: string;
}

interface WasmModule {
    AssemblyHelper: {
        new(
            file1: File,
            file2: File,
            k: number,
            verbose: boolean,
            min_count: number,
            min_qual: number,
            csize: number,
            do_bloom: boolean,
            do_fit: boolean
        ): AssemblyHelper;
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WasmModuleAny = any;

interface AssemblyHelper {
    get_preprocessing_info(): string;
    assemble(no_bubble_collapse: boolean, no_dead_end_removal: boolean): void;
    get_assembly(): string;
}

export class Assembler {
    worker: Worker;
    wasm: WasmModuleAny | null;
    helper: AssemblyHelper | null;
    wasmPromise: Promise<WasmModuleAny>;

    constructor(worker: Worker) {
        this.worker = worker;
        this.helper = null;
        this.wasm = null;

        this.wasmPromise = new Promise((resolve) => {
            import("@/pkg")
                .then((w) => {
                    this.wasm = w;
                    resolve(w);
                });
        });
    }

    waitForWasm(): Promise<WasmModuleAny> {
        return this.wasm ? Promise.resolve(this.wasm) : this.wasmPromise;
    }

    async preprocess(
        file1: File,
        file2: File,
        k: number,
        verbose: boolean,
        min_count: number,
        min_qual: number,
        csize: number,
        do_bloom: boolean,
        do_fit: boolean
    ): Promise<void> {
        await this.waitForWasm();

        if (this.helper === null) {
            try {
                this.helper = this.wasm!.AssemblyHelper.new(
                    file1,
                    file2,
                    k,
                    verbose,
                    min_count,
                    min_qual,
                    csize,
                    do_bloom,
                    do_fit
                );
            } catch (error) {
                console.log("Webassembly error found! Most surely, memory issue.");
                console.error(error);
                this.worker.postMessage({ reset: true });
                return;
            }
        }

        const resultsjson: PreprocessingResult = JSON.parse(this.helper!.get_preprocessing_info());

        this.worker.postMessage({
            nKmers: resultsjson.nkmers,
            histo: resultsjson.histo,
            used_min_count: resultsjson.used_min_count
        });
    }

    async assemble(no_bubble_collapse: boolean, no_dead_end_removal: boolean): Promise<void> {
        console.log("Initiating assembly from worker");
        this.helper!.assemble(no_bubble_collapse, no_dead_end_removal);

        console.log("Assembly finished");
        const resultsjson: AssemblyResult = JSON.parse(this.helper!.get_assembly());

        console.log("Posting output as message");
        this.worker.postMessage({
            outfasta: resultsjson.outfasta,
            ncontigs: resultsjson.ncontigs,
            outdot: resultsjson.outdot,
            outgfa: resultsjson.outgfa,
            outgfav2: resultsjson.outgfav2
        });
    }

    resetAll(): void {
        this.helper = null;
    }
}
