import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {BeMetamorphicVirtualProps, BeMetamorphicProps, BeMetamorphicActions, P} from './types';
import {register} from 'be-hive/register.js';
import 'be-a-beacon/be-a-beacon.js';
import {Mgmt} from 'trans-render/xslt/Mgmt.js';

const xsltLookup: {[key: string]: XSLTProcessor} = {};

export class BeMetamorphic implements BeMetamorphicActions{

    #target!: Element;
    #xsltMgmt = new Mgmt();
    intro(proxy: Element & BeMetamorphicVirtualProps, target: Element, {ifWantsToBe, proxyPropDefaults}: BeDecoratedProps & BeMetamorphicVirtualProps): void {
        this.#target = target;
    }

    async onWhenDefined({proxy, whenDefined}: this): Promise<void>{
        const target = this.#target;
        const beacon = target.querySelector('template[be-a-beacon],template[is-a-beacon]');
        if(beacon !== null){
            proxy.beaconFound = true;
        }else{
            target.addEventListener('i-am-here', e => {
                proxy.beaconFound = true;
            }, {
                once: true,
                capture: true,
            });
        }
    }

    async onBeaconFound({whenDefined}: this): Promise<P> {
        for(const s of whenDefined){
            await customElements.whenDefined(s);
        }
        return {
            dependenciesLoaded: true,
        }
    }

    async onDependenciesLoaded({xslt}: this): Promise<P> {
        const xsltProcessor = await this.#xsltMgmt.getProcessor(xslt);
        return {
            xsltProcessor
        };
    }

    async onXSLTProcessor({expandTempl, xsltProcessor}: this): Promise<P> {
        let xmlSrc = this.#target;
        if(expandTempl){
            const {clone} = await import('trans-render/xslt/clone.js');
            xmlSrc = clone(xmlSrc);
        }
        const {swap} = await import('trans-render/xslt/swap.js');
        swap(xmlSrc, true);
        const resultDocument = xsltProcessor.transformToFragment(xmlSrc, document);
        //swap(resultDocument, false);
        this.#target.innerHTML = '';
        this.#target.append(resultDocument);
        return {}
    }



}

export interface BeMetamorphic extends BeMetamorphicProps{}

const tagName = 'be-metamorphic';

const ifWantsToBe = 'metamorphic';

const upgrade = '*';

define<BeMetamorphicProps & BeDecoratedProps<BeMetamorphicProps, BeMetamorphicActions>, BeMetamorphicActions>({
    config:{
        tagName,
        propDefaults:{
            upgrade,
            ifWantsToBe,
            primaryProp: 'xslt',
            intro: 'intro',
            virtualProps: ['beaconFound', 'xslt', 'whenDefined', 'expandTempl', 'xsltProcessor', 'dependenciesLoaded'],
            proxyPropDefaults:{
                beaconFound: false,
                expandTempl: false,
            }
        },
        actions:{
            onBeaconFound:{
                ifAllOf: ['beaconFound', 'whenDefined']
            },
            onWhenDefined: 'whenDefined',
            onDependenciesLoaded: 'dependenciesLoaded',
            onXSLTProcessor: 'xsltProcessor',
        }
    },
    complexPropDefaults:{
        controller: BeMetamorphic,
    }
});

register(ifWantsToBe, upgrade, tagName);