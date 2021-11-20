import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
export class BeMetamorphicController {
    #target;
    intro(proxy, target, beDecorProps) {
        this.#target = target;
    }
    async onXslt({ xslt }) {
        const resp = await fetch(xslt);
        const xsltString = await resp.text();
        const xsltNode = new DOMParser().parseFromString(xsltString, 'text/xml');
        return { xsltNode };
    }
    async onWhenDefined({ whenDefined }) {
        // const promises: Promise<CustomElementConstructor>[] = whenDefined.map(s => customElements.whenDefined(s));
        // for const 
        // return Promise.all(promises).then((values) => {
        //     return {areDefined: true};
        // });
        for (const s of whenDefined) {
            await customElements.whenDefined(s);
        }
        return { areDefined: true };
    }
    onReady({ proxy, xsltNode }) {
        const xslt = new XSLTProcessor();
        xslt.importStylesheet(xsltNode);
        const resultDocument = xslt.transformToFragment(this.#target, document);
        let appendTo = proxy;
        for (const childNode of resultDocument.children) {
            appendTo.insertAdjacentElement('afterend', childNode);
            appendTo = childNode;
        }
        proxy.remove();
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
            virtualProps: ['xslt', 'whenDefined', 'areDefined', 'xsltNode'],
            proxyPropDefaults: {
                whenDefined: []
            }
        },
        actions: {
            onXslt: {
                ifAllOf: ['xslt'],
                async: true,
            },
            onWhenDefined: {
                ifAllOf: ['whenDefined'],
                async: true,
            },
            onReady: {
                ifAllOf: ['xsltNode', 'areDefined']
            }
        }
    },
    complexPropDefaults: {
        controller: BeMetamorphicController,
    }
});
register(ifWantsToBe, upgrade, tagName);
