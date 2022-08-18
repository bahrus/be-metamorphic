import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
import 'be-a-beacon/be-a-beacon.js';
const xsltLookup = {};
export class BeMetamorphicController {
    #target;
    intro(proxy, target, { ifWantsToBe, proxyPropDefaults }) {
        this.#target = target;
        Object.assign(proxy, proxyPropDefaults);
        const beacon = target.querySelector('template[be-a-beacon],template[is-a-beacon]');
        if (beacon !== null) {
            proxy.beaconFound = true;
        }
        else {
            target.addEventListener('i-am-here', e => {
                proxy.beaconFound = true;
            }, {
                once: true,
                capture: true,
            });
        }
        //     this.#target = target;
        //     const attr = target.getAttribute(`is-${ifWantsToBe}`)!.trim();
        //     const morphParams = {...proxyPropDefaults.morphParams};
        //     if(attr.length > 0){
        //         if(attr[0] === '{'){
        //             Object.assign(morphParams, JSON.parse(attr));
        //         }else{
        //             Object.assign(morphParams, {
        //                 attr:{
        //                     mode: 'replace',
        //                     whenDefined: [],
        //                 }
        //             })
        //         }
        //     }
        //     proxy.morphParams = morphParams;
    }
    async onBeaconFound({ whenDefined }) {
        for (const s of whenDefined) {
            await customElements.whenDefined(s);
        }
        return {
            dependenciesLoaded: true,
        };
    }
    async onDependenciesLoaded({ xslt }) {
        console.log('dependencies loaded');
        let xsltProcessor = xsltLookup[xslt];
        if (xsltProcessor !== undefined) {
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
    async onXSLTProcessor({ expandTempl, xsltProcessor }) {
        let xmlSrc = this.#target;
        if (expandTempl) {
            const { clone } = await import('trans-render/xslt/clone.js');
            xmlSrc = clone(xmlSrc);
        }
        const { swap } = await import('trans-render/xslt/swap.js');
        swap(xmlSrc, true);
        const resultDocument = xsltProcessor.transformToFragment(xmlSrc, document);
        this.#target.innerHTML = '';
        this.#target.append(resultDocument);
        //         if(!cloneAndExpandTempl){
        //             swap(xmlSrc, false);
        //         }
        return {};
    }
}
const tagName = 'be-metamorphic';
const ifWantsToBe = 'metamorphic';
const upgrade = '*';
define({
    config: {
        tagName,
        propDefaults: {
            upgrade,
            ifWantsToBe,
            primaryProp: 'xslt',
            intro: 'intro',
            noParse: true,
            virtualProps: ['beaconFound', 'xslt', 'whenDefined', 'expandTempl', 'xsltProcessor', 'dependenciesLoaded'],
            proxyPropDefaults: {
                beaconFound: false,
                expandTempl: false,
            }
        },
        actions: {
            onBeaconFound: {
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
    complexPropDefaults: {
        controller: BeMetamorphicController,
    }
});
register(ifWantsToBe, upgrade, tagName);
