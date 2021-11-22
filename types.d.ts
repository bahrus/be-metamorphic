import {BeDecoratedProps} from 'be-decorated/types';

export interface BeMetamorphicVirtualProps{
    xslt: string,
    xsltNode: Node,
    xsltSearch: string,
    areDefined: boolean,
    whenDefined: string[],
    mode: 'replace' | 'append' | 'prepend' | 'adjacentAfterEnd'
}

export interface BeMetamorphicProps extends BeMetamorphicVirtualProps{
    proxy: Element & BeMetamorphicVirtualProps
}

export interface BeMetamorphicActions{
    onXslt(self: this): Promise<{xsltNode: Node}>;
    onXsltSearch(self: this): Promise<{xsltNode: Node}>;
    onWhenDefined(self: this): Promise<{areDefined: boolean}>;
    onReady(self: this): void;
    intro(proxy: HTMLTemplateElement & BeMetamorphicVirtualProps, target: Element, beDecorProps: BeDecoratedProps): void;
}