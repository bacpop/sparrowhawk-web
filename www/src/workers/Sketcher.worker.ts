import { Sketcher } from './Sketcher';

interface IdentifyMessage {
    identify: boolean;
    file1: File;
    file2: File | null;
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
            sketcher.identifyThisFile(data.file1, data.file2);
        } else if ('reset' in evt.data && evt.data.reset) {
            sketcher.resetAll();
        } else {
            throw new Error("Event " + JSON.stringify(evt.data) + " is not supported");
        }
    }
};
