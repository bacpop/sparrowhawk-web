<template>
    <div>
        <button @click="downloadFASTA" id="Download">Download assembly as .fasta</button>
    </div>
</template>

<script>
import { useState } from "vuex-composition-helpers";

export default {
    name: 'DownloadButton',
    setup() {
        const { allResults } = useState(["allResults"]);

        return {
            allResults
        }
    },
    methods: {
        downloadFASTA() {

            console.log(this.allResults.assemblyResults);

            let filename = 'assembly.fasta';
            let element = document.createElement('a');
            element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.allResults.assemblyResults));
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
