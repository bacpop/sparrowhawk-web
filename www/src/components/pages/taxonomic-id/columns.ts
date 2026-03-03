import { h } from 'vue'
import type { ColumnDef, Row } from '@tanstack/vue-table'
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

export interface TaxonomicIDRow {
    sample: string
    rank: number
    species: string
    probability: number
    metaSpecies: string
    metaGemsparcl: string
    metaGtdb: string
    subRows?: TaxonomicIDRow[]
}

function sortableHeader(label: string, align?: 'right') {
    return ({ column }: { column: { toggleSorting: (asc: boolean) => void; getIsSorted: () => string | false } }) => {
        const sorted = column.getIsSorted()
        const icon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown
        return h(Button, {
            variant: 'ghost',
            class: align === 'right' ? 'w-full justify-end' : undefined,
            onClick: () => column.toggleSorting(sorted === 'asc'),
        }, () => [label, h(icon, { class: 'ml-2 h-4 w-4' })])
    }
}

export const columns: ColumnDef<TaxonomicIDRow>[] = [
    {
        accessorKey: 'sample',
        header: sortableHeader('Sample'),
        cell: ({ row }: { row: Row<TaxonomicIDRow> }) => {
            const canExpand = row.getCanExpand()
            const isExpanded = row.getIsExpanded()
            return h('div', { class: 'flex items-center gap-1' }, [
                canExpand
                    ? h(Button, {
                        variant: 'ghost',
                        size: 'sm',
                        class: 'h-5 w-5 p-0 text-gray-400 hover:text-gray-700',
                        onClick: row.getToggleExpandedHandler(),
                    }, () => h(isExpanded ? ChevronDown : ChevronRight, { class: 'h-3.5 w-3.5' }))
                    : h('span', { class: 'w-5' }),
                h('span', { class: 'font-medium font-mono truncate' }, row.getValue('sample')),
            ])
        },
    },
    {
        accessorKey: 'rank',
        header: sortableHeader('Rank'),
        cell: ({ row }) => h('div', { class: 'text-center' }, row.getValue('rank')),
    },
    {
        accessorKey: 'species',
        header: sortableHeader('Species'),
        cell: ({ row }) => h('div', { class: 'italic' }, row.getValue('species')),
    },
    {
        accessorKey: 'probability',
        header: sortableHeader('K-mer matches', 'right'),
        cell: ({ row }) => {
            const prob = row.getValue('probability') as number
            return h('div', { class: 'text-right font-medium' }, `${(prob * 100).toFixed(1)}%`)
        },
    },
    {
        accessorKey: 'metaSpecies',
        header: 'Species',
    },
    {
        accessorKey: 'metaGemsparcl',
        header: 'Gemsparcl ID',
    },
    {
        accessorKey: 'metaGtdb',
        header: 'GTDB species composition',
    },
]
