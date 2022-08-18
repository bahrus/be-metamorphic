import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {BeMetamorphicVirtualProps, BeMetamorphicProps, BeMetamorphicActions, P} from './types';
import {register} from 'be-hive/register.js';
import 'be-a-beacon/be-a-beacon.js';

const xsltLookup: {[key: string]: XSLTProcessor} = {};

export class BeMetamorphicController implements BeMetamorphicActions{

    #target!: Element
    intro(proxy: Element & BeMetamorphicVirtualProps, target: Element, {ifWantsToBe, proxyPropDefaults}: BeDecoratedProps & BeMetamorphicVirtualProps): void {
        this.#target = target;
        Object.assign(proxy, proxyPropDefaults);
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
        let xsltProcessor = xsltLookup[xslt];
        if(xsltProcessor !== undefined){
            return {
                xsltProcessor
            };
        } 
        const resp = await fetch(xslt);
        const xsltString = await resp.text();
        const xsltNode = new DOMParser().parseFromString(xsltString, 'text/xml');
        xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xsltNode);
        xsltLookup[xslt] = xsltProcessor;
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

export interface BeMetamorphicController extends BeMetamorphicProps{}

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
            noParse: true,
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
            onDependenciesLoaded: 'dependenciesLoaded',
            onXSLTProcessor: 'xsltProcessor',
            // onMorphParams:{
            //     ifAllOf: ['morphParams'],
            // },
            // onOn:{
            //     ifAllOf: ['on', 'morphParams'],
            // }

        }
    },
    complexPropDefaults:{
        controller: BeMetamorphicController,
    }
});

register(ifWantsToBe, upgrade, tagName);