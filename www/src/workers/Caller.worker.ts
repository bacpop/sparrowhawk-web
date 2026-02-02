import { Caller } from './Caller';

interface CallMessage {
    call: boolean;
    input_file: File;
}

interface ResetMessage {
    reset: boolean;
}

type WorkerMessage = CallMessage | ResetMessage;

const ctx: Worker = self as unknown as Worker;
const caller = new Caller(ctx);

ctx.onmessage = (evt: MessageEvent<WorkerMessage>) => {
    if (evt.data instanceof Object) {
        if ('call' in evt.data && evt.data.call) {
            const data = evt.data as CallMessage;
            caller.callGenes(data.input_file);
        } else if ('reset' in evt.data && evt.data.reset) {
            caller.resetAll();
        } else {
            throw new Error("Event " + JSON.stringify(evt.data) + " is not supported");
        }
    }
};