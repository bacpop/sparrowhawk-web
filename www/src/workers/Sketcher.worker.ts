import { Sketcher } from './Sketcher';

interface IdentifyMessage {
    identify: boolean;
    file1: File;
    file2: File | null;
    sampleName: string;
    proportion_reads: number;
    min_count: number;
    min_qual: number;
}

interface ResetMessage {
    reset: boolean;
}

type WorkerMessage = IdentifyMessage | ResetMessage;

const ctx: Worker = self as unknown as Worker;
const sketcher = new Sketcher(ctx);

ctx.onmessage = (evt: MessageEvent<WorkerMessage>) => {
    if (evt.data instanceof Object) {
        if ('identify' in evt.data && evt.data.identify) {
            const data = evt.data as IdentifyMessage;
            sketcher.identifyThisFile(data.file1, data.file2, data.sampleName, data.proportion_reads, data.min_count, data.min_qual);
        } else if ('reset' in evt.data && evt.data.reset) {
            sketcher.resetAll();
        } else {
            throw new Error("Event " + JSON.stringify(evt.data) + " is not supported");
        }
    }
};
