import { Mapper } from './Mapper';

interface RefMessage {
    ref: boolean;
    file: File;
    k: number;
}

interface MapMessage {
    map: boolean;
    file: File;
    revReads: File | null;
    proportion_reads: number;
}

interface AlignMessage {
    align: boolean;
    files: File[];
    proportion_reads: number;
    k: number;
}

interface ResetMessage {
    reset: boolean;
}

type WorkerMessage = RefMessage | MapMessage | AlignMessage | ResetMessage;

const ctx: Worker = self as unknown as Worker;
const mapper = new Mapper(ctx);

ctx.onmessage = (evt: MessageEvent<WorkerMessage>) => {
    if (evt.data instanceof Object) {
        if ('ref' in evt.data && evt.data.ref) {
            const data = evt.data as RefMessage;
            mapper.set_ref(data.file, data.k);
        } else if ('map' in evt.data && evt.data.map) {
            const data = evt.data as MapMessage;
            mapper.map(data.file, data.revReads, data.proportion_reads);
        } else if ('align' in evt.data && evt.data.align) {
            const data = evt.data as AlignMessage;
            mapper.align(data.files, data.proportion_reads, data.k);
        } else if ('reset' in evt.data && evt.data.reset) {
            mapper.resetAll();
        } else {
            throw new Error("Event " + JSON.stringify(evt.data) + " is not supported");
        }
    }
};
