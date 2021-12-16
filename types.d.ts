import {BeDecoratedProps} from 'be-decorated/types';

export interface BeMetamorphicVirtualProps{
    morphParams: {[key: string]: MorphParam},
    on: string[],
}

export interface BeMetamorphicProps extends BeMetamorphicVirtualProps{
    proxy: Element & BeMetamorphicVirtualProps
}

export interface BeMetamorphicActions{
    // onXslt(self: this): Promise<{xsltNode: Node}>;
    // onXsltSearch(self: this): Promise<{xsltNode: Node}>;
    // onWhenDefined(self: this): Promise<{areDefined: boolean}>;
    // onReady(self: this): void;
    intro(proxy: Element & BeMetamorphicVirtualProps, target: Element, beDecorProps: BeDecoratedProps): void;
    onMorphParams(self: this): void;
    onOn(self: this): void;
}

export interface MorphParam{
    isUpSearch: boolean,
    whenDefined: string[],
    mode: 'replace' | 'append' | 'prepend' | 'adjacentAfterEnd',
    target: string,
    cloneAndExpandTempl: boolean,
}