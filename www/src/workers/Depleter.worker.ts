import { Depleter } from './Depleter';

interface LoadIndexMessage { loadIndex: true; file: File; }
interface FilterMessage    { filter: true; file: File; revReads: File | null; deplete: boolean; abs_threshold: number; rel_threshold: number; }
interface ResetMessage     { reset: true; }
type WorkerMessage = LoadIndexMessage | FilterMessage | ResetMessage;

const ctx: Worker = self as unknown as Worker;
const depleter = new Depleter(ctx);

ctx.onmessage = (evt: MessageEvent<WorkerMessage>) => {
    if (!(evt.data instanceof Object)) return;
    if ('loadIndex' in evt.data && evt.data.loadIndex) {
        depleter.loadIndex((evt.data as LoadIndexMessage).file);
    } else if ('filter' in evt.data && evt.data.filter) {
        const m = evt.data as FilterMessage;
        depleter.filterReads(m.file, m.revReads, m.deplete, m.abs_threshold, m.rel_threshold);
    } else if ('reset' in evt.data && evt.data.reset) {
        depleter.resetAll();
    }
};
