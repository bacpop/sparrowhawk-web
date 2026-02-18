/* eslint-disable */
declare module '*.vue' {
    import type {DefineComponent} from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module '@phylocanvas/phylocanvas.gl';

interface PhylocanvasProps {
    size: { width: number; height: number };
    source?: string;
    type?: string;
    interactive?: boolean;
    showLabels?: boolean;
    showLeafLabels?: boolean;
    showInternalLabels?: boolean;
    showBranchLengths?: boolean;
    alignLabels?: boolean;
    padding?: number;
    fontSize?: number;
    [key: string]: unknown;
}

declare class PhylocanvasGLClass {
    constructor(container: HTMLElement | string, props?: PhylocanvasProps, plugins?: unknown[]);
    setProps(props: Partial<PhylocanvasProps>): void;
    destroy(): void;
}

declare const phylocanvas: {
    PhylocanvasGL: typeof PhylocanvasGLClass;
    TreeTypes: {
        Rectangular: 'rc';
        Circular: 'cr';
        Radial: 'rd';
        Diagonal: 'dg';
        Hierarchical: 'hr';
    };
};