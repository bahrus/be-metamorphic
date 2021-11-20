import {BeDecoratedProps} from 'be-decorated/types';

export interface BeMetamorphicVirtualProps{
    xslt: string,
    xsltNode: Node,
    areDefined: boolean,
    whenDefined: string[]
}

export interface BeMetamorphicProps extends BeMetamorphicVirtualProps{
    proxy: Element & BeMetamorphicVirtualProps
}

export interface BeMetamorphicActions{
    onXslt(self: this): Promise<{xsltNode: Node}>;
    onWhenDefined(self: this): Promise<{areDefined: boolean}>;
    onReady(self: this): void;
}