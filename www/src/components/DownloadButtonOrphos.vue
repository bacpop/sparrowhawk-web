<template>
    <div>
        <button @click="downloadGFF" id="Download">Download gene calls as .gff</button>
    </div>
</template>

<script>
    import { useState } from "vuex-composition-helpers";

    export default {
        name: 'DownloadButtonOrphos',
        setup() {
            const { allResults_orphos } = useState(["allResults_orphos"]);

            return {
                allResults_orphos
            }
        },
        methods: {
            downloadGFF() {
                console.log(this.allResults_orphos.outputFile);

                let filename = 'genecalls.gff';
                let element = document.createElement('a');
                element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.allResults_orphos.outputFile));
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
