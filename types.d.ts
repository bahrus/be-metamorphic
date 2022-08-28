import {BeDecoratedProps, MinimalProxy} from 'be-decorated/types';

export interface BeMetaMorphicEndUserProps {
    whenDefined: string[],
    xslt: string,
    /**
     * Clone and expand templates contained within the DOM before applying xslt
     */
    expandTempl: boolean,
}
export interface BeMetamorphicVirtualProps extends BeMetaMorphicEndUserProps, MinimalProxy{
    beaconFound: boolean;
    dependenciesLoaded: boolean;
    xsltProcessor: XSLTProcessor,
}

export interface BeMetamorphicProps extends BeMetamorphicVirtualProps{
    proxy: Element & BeMetamorphicVirtualProps
}

export type P = Partial<Element & BeMetamorphicVirtualProps>;

export interface BeMetamorphicActions{
    onBeaconFound(self: this): Promise<P>;
    onWhenDefined(self: this): Promise<void>;
    onDependenciesLoaded(self: this): Promise<P>;
    onXSLTProcessor(self: this): Promise<P>;

}

