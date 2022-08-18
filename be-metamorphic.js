import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
import 'be-a-beacon/be-a-beacon.js';
const xsltLookup = {};
export class BeMetamorphic {
    #target;
    intro(proxy, target, { ifWantsToBe, proxyPropDefaults }) {
        console.log('intro');
        this.#target = target;
    }
    async onWhenDefined({ proxy, whenDefined }) {
        const target = this.#target;
        const beacon = target.querySelector('template[be-a-beacon],template[is-a-beacon]');
        if (beacon !== null) {
            console.log('set beacon found');
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
    }
    async onBeaconFound({ whenDefined }) {
        console.log('onBeaconFound');
        for (const s of whenDefined) {
            await customElements.whenDefined(s);
        }
        console.log('dependencies loaded');
        return {
            dependenciesLoaded: true,
        };
    }
    async onDependenciesLoaded({ xslt }) {
        console.log('onDependenciesLoaded');
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
        //swap(resultDocument, false);
        this.#target.innerHTML = '';
        this.#target.append(resultDocument);
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
            onWhenDefined: 'whenDefined',
            onDependenciesLoaded: 'dependenciesLoaded',
            onXSLTProcessor: 'xsltProcessor',
        }
    },
    complexPropDefaults: {
        controller: BeMetamorphic,
    }
});
register(ifWantsToBe, upgrade, tagName);
