import { Caller } from './Caller.js';

{
    var caller = new Caller(self);

    self.onmessage = (evt) => {
        if (evt.data instanceof Object) {
            if (evt.data.call) {
                caller.callGenes(evt.data.input_file);
            } else if (evt.data.reset) {
                caller.resetAll();
            } else {
                throw "Event " + JSON.stringify(evt.data) + " is not supported";
            }
        }
    }
}

