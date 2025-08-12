<template>
    <div>
        <button @click="downloadALN" id="Download">Download .aln</button>
    </div>
</template>

<script>
import { useState } from "vuex-composition-helpers";

export default {
    name: 'DownloadButtonSka',
    setup() {
        const { allResults_ska } = useState(["allResults_ska"]);

        return {
            allResults_ska
        }
    },
    methods: {
        downloadALN() {

            let text = "";
            let mapping_alignment = "";

            for (let file of Object.keys(this.allResults_ska.mapResults)) {
                text += `>${file}\n`;
                mapping_alignment = "";
                let sequences = this.allResults_ska.mapResults[file].mapped_sequences;
                for (const sequence of sequences) {
                    mapping_alignment += sequence;
                }
                text += mapping_alignment + "\n";
            }
            console.log(text);

            let filename = 'alignment.aln';
            let element = document.createElement('a');
            element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();
            document.body.removeChild(element);
        }
    }
}
</script>

<style scoped>
#Download {
    float: left;
}
</style>
