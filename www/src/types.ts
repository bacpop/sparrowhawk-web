export type Dict<T> = Record<string, T>

export interface WorkerState {
    worker: Worker | null;
}

export interface AllResults {
    assemblyResults: string
}

