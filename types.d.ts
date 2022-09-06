import {BeDecoratedProps, MinimalProxy} from 'be-decorated/types';

export interface EndUserProps {
    whenDefined?: string[],
    xslt?: string,
    /**
     * Clone and expand templates contained within the DOM before applying xslt
     */
    expandTempl?: boolean,
}
export interface VirtualProps extends EndUserProps, MinimalProxy{
    beaconFound: boolean;
    dependenciesLoaded: boolean;
    xsltProcessor: XSLTProcessor,
}

export type Proxy = Element & VirtualProps;

export interface ProxyProps extends VirtualProps {
    proxy: Proxy;
}

export type PP = ProxyProps

export type P = Partial<Element & VirtualProps>;

export interface Actions{
    onBeaconFound(pp: PP): Promise<P>;
    onWhenDefined(pp: PP): Promise<void>;
    onDependenciesLoaded(pp: PP): Promise<P>;
    onXSLTProcessor(pp: PP): Promise<P>;

}

