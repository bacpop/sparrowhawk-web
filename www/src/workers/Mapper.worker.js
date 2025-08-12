import { Mapper } from './Mapper.js';

{
    var mapper = new Mapper(self);

    self.onmessage = (evt) => {
        if (evt.data instanceof Object) {
            if (evt.data.ref) {
                mapper.set_ref(evt.data.file, evt.data.k);

            } else if (evt.data.map) {
                mapper.map(evt.data.file, evt.data.revReads, evt.data.proportion_reads);

            } else if (evt.data.align) {
                mapper.align(evt.data.files, evt.data.proportion_reads, evt.data.k);

            } else if (evt.data.reset) {
                mapper.resetAll();

            } else {
                throw "Event " + JSON.stringify(evt.data) + " is not supported";
            }
        }
    }

}

