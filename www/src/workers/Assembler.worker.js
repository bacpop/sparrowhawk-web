import { Assembler } from './Assembler.js';

{
    var assembler = new Assembler(self);

    self.onmessage = (evt) => {
        if (evt.data instanceof Object) {
            if (evt.data.preprocess) {
                console.log("Trying to preprocess!");
                assembler.preprocess(evt.data.file1, evt.data.file2, evt.data.k, evt.data.verbose, evt.data.min_count, evt.data.min_qual, evt.data.csize, evt.data.do_bloom, evt.data.do_fit);

            } else if (evt.data.assemble) {
                console.log("Trying to assemble!");
                assembler.assemble();

            } else if (evt.data.reset) {
                console.log("Trying to reset!");
                assembler.resetAll();

            } else {
                throw "Event " + JSON.stringify(evt.data) + " is not supported";

            }
        }
    }
}

