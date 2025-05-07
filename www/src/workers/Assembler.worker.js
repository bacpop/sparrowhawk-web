import { Assembler } from './Assembler.js';

{
    var assembler = new Assembler(self);

    self.onmessage = (evt) => {
        if (evt.data instanceof Object) {
            if (evt.data.assemble) {
                console.log("Trying to assemble!");
                assembler.assemble(evt.data.file1, evt.data.file2, evt.data.k, evt.data.verbose, evt.data.min_count, evt.data.min_qual);
            } else {
                throw "Event " + JSON.stringify(evt.data) + " is not supported";
            }
        }
    }

}

