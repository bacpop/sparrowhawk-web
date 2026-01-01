<template>
    <div v-if="queryAssembled" class="variants">
        <div id="band" style="height: 30px">
            <DownloadButton></DownloadButton>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import { useStore } from "vuex";
import { useState } from "vuex-composition-helpers";
import DownloadButton from "./DownloadButton.vue";

export default defineComponent({
    name: "ResultsDisplayAssembly",
    components: {
        DownloadButton
    },
    setup() {
        const store = useStore();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { allResults } = useState(["allResults"]) as any;
        const skip: Ref<boolean> = ref(true);

        return {
            allResults,
            skip,
            store
        }
    },

    computed: {
        queryAssembled(): boolean {
            return this.store.getters.queryAssembled;
        },
    },

    methods: {
        use_keys(list_of_keys: (string | number | boolean)[]): string {
            return list_of_keys.join('-');
        },
    },
});
</script>

<style>
  :root {
    --popper-theme-background-color: lightgray;
    --popper-theme-background-color-hover: lightgray;
    --popper-theme-text-color: black;
    --popper-theme-border-width: 3px;
    --popper-theme-border-style: solid;
    --popper-theme-border-radius: 6px;
    --popper-theme-padding: 5px;
  }

  .checkbox {
    float: left;
    text-align: left;
    margin-right: 20px;
  }

  .legend button {
    background-color: #333333;
    color: white;
    border: none;
    cursor: pointer;
    padding: 5px 10px;
    text-decoration: none;
    font-size: 14px;
    transition-duration: 0.4s;
    border-radius: 100px;
    float: left;
  }

  .legend {
    margin-right: 20px;
    float: left;
  }

  #table {
    float: left;
    text-align: left;
    margin-left: 50px;
  }

  .square {
    height: 15px;
    width: 5px;
    margin-right: 30px;
    float: left;
  }
</style>
