// A .tsx is a file that allows you to use JSX syntax in TypeScript files.
// JSX allows the user to write html and return it as a vue component.

import {computed, defineComponent, h, ref} from "vue";
import {useState} from "vuex-composition-helpers";
import SingleRow from './SingleRow.vue'
import {Row, Rows} from './SequenceViewerConstruction'
import {useVirtualizer} from '@tanstack/vue-virtual'

export default defineComponent({
    name: "SequenceViewer",

    props: {
        zoom_level: {
            type: Number,
        },
        no_skip: {    // Defines whether or not we show all sequences, even if they are not mapped
            type: Boolean,
            default: false,
        },
    },

    setup(props: { zoom_level: number | undefined, no_skip: boolean }) {
        console.log("Creating viewer for zoom level: ", props.zoom_level)
        const {allResults_ska} = useState(["allResults_ska"]);
        const whole_sequences: string[] = allResults_ska.value.ref;

        const whole_mapped_sequences_chrom: string[][] = [];
        for (let _ = 0; _ < whole_sequences.length; _++) {
            whole_mapped_sequences_chrom.push([]);
        }
        for (const key in allResults_ska.value.mapResults) {
            for (let i = 0; i < whole_sequences.length; i++) {
                whole_mapped_sequences_chrom[i].push(allResults_ska.value.mapResults[key].mapped_sequences[i]);
            }
        }
        const parentRef = ref(null)
        const zoom_level = ref(props.zoom_level);

        const font_family = "IBM Plex Sans";
        const font_size: number = zoom_level.value ? zoom_level.value : 10;

        // Compute the rows before displaying them to adapt to the width of the webpage and use the virtualizer
        const rows: Row[] = Rows(font_size, font_family, whole_mapped_sequences_chrom, whole_sequences, props.no_skip, Object.keys(allResults_ska.value.mapResults));

        // A virtualizer is a component that allows you to render only the elements that are visible on the screen
        const rowVirtualizer = useVirtualizer({
            count: rows.length,
            getScrollElement: () => parentRef.value,
            estimateSize: () => (3.5 + rows[0].mapped_sequences.length) * Number(font_size),
            overscan: 5,
        });

        const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());
        const totalSize = computed(() => rowVirtualizer.value.getTotalSize());

        return () => {
            return (
                h('div', {ref: parentRef, style: {height: "400px", overflow: 'auto'}},
                    [h('div', {
                            style: {height: `${totalSize.value}px`, width: '100%', position: 'relative'}
                        },
                        [virtualRows.value.map((virtualRow: { index: number, size: number, start: number }) => {
                            return (
                                h('div', {
                                        key: virtualRow.index,
                                        style: {
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: `${virtualRow.size}px`,
                                            transform: `translateY(${virtualRow.start}px)`,
                                        }
                                    },
                                    // Use the custom SingleRow component to display each row one by one
                                    [h(SingleRow, {
                                        virtualRow,
                                        row: rows[virtualRow.index],
                                        font_size: font_size,
                                        font_family: font_family,
                                        mapping_names: Object.keys(allResults_ska.value.mapResults)
                                    })])
                            );
                        })
                        ])
                    ])
            );
        };
    },
});
