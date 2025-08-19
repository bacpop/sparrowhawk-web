import { Sketcher } from './Sketcher.js';

{
    var sketcher = new Sketcher(self);

    self.onmessage = (evt) => {
        if (evt.data instanceof Object) {
            if (evt.data.identify) {
                sketcher.identifyThisFile(evt.data.file1, evt.data.file2);

            } else if (evt.data.reset) {
                sketcher.resetAll();
            } else {
                throw "Event " + JSON.stringify(evt.data) + " is not supported";
            }
        }
    }
}

