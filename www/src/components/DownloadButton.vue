<template>
    <div>
        <button @click="downloadFASTA" id="Download">Download assembly as .fasta</button>
    </div>
    <div>
        <button @click="downloadDOT"   id="Download">Download de Bruijn graph as .dot</button>
    </div>
    <div>
        <button @click="downloadGFA"   id="Download">Download de Bruijn graph as .gfa</button>
    </div>
    <div>
        <button @click="downloadGFAv2" id="Download">Download de Bruijn graph as .gfa2</button>
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
                console.log(this.allResults.fastaOutput);

                let filename = 'assembly.fasta';
                let element = document.createElement('a');
                element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.allResults.fastaOutput));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();
                document.body.removeChild(element);
            },


            downloadDOT() {
                console.log(this.allResults.dotOutput);

                let filename = 'graph.dot';
                let element = document.createElement('a');
                element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.allResults.dotOutput));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();
                document.body.removeChild(element);
            },


            downloadGFA() {
                console.log(this.allResults.gfaOutput);

                let filename = 'graph.gfa';
                let element = document.createElement('a');
                element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.allResults.gfaOutput));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();
                document.body.removeChild(element);
            },

            downloadGFAv2() {
                console.log(this.allResults.gfav2Output);

                let filename = 'graph.gfa2';
                let element = document.createElement('a');
                element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.allResults.gfav2Output));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();
                document.body.removeChild(element);
            },
        }
    }
</script>

<style scoped>
    #Download {
        float: left;
    }
    button {
      font-family: 'IBM Plex sans';
    }
</style>
