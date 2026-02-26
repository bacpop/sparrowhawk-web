import type { WasmIndex } from "@/pkg_deacon";

export class Depleter {
    worker: Worker;
    index: WasmIndex | null = null;
    wasm: typeof import("@/pkg_deacon") | null = null;

    constructor(worker: Worker) {
        this.worker = worker;
    }

    async loadIndex(file: File): Promise<void> {
        const wasm = await import("@/pkg_deacon");
        this.wasm = wasm;
        const buf = await file.arrayBuffer();
        this.index = new wasm.WasmIndex(new Uint8Array(buf));
        this.worker.postMessage({ indexLoaded: true, fileName: file.name, info: this.index.info() });
    }

    async filterReads(file: File, deplete: boolean, abs_threshold: number, rel_threshold: number): Promise<void> {
        const buf = await file.arrayBuffer();
        const inputBytes = new Uint8Array(buf);
        const outputGzip: Uint8Array = this.wasm!.filter(this.index!, inputBytes, deplete, abs_threshold, rel_threshold);
        const lines = new TextDecoder().decode(inputBytes).split('\n').filter(l => l.length > 0);
        const total = Math.floor(lines.length / 4);
        this.worker.postMessage(
            { filtered: true, total, outputGzip, fileName: file.name },
            [outputGzip.buffer],
        );
    }

    resetAll(): void {
        this.index = null;
        this.wasm = null;
    }
}
