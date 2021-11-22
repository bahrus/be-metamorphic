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
        for (const s of whenDefined) {
            await customElements.whenDefined(s);
        }
        return { areDefined: true };
    }
    onReady({ proxy, xsltNode, mode }) {
        const xslt = new XSLTProcessor();
        xslt.importStylesheet(xsltNode);
        const resultDocument = xslt.transformToFragment(this.#target, document);
        let appendTo = proxy;
        switch (mode) {
            case 'replace':
            case 'adjacentAfterEnd':
                for (const childNode of resultDocument.children) {
                    appendTo.insertAdjacentElement('afterend', childNode);
                    appendTo = childNode;
                }
                break;
            case 'append':
                appendTo.append(resultDocument);
                break;
            case 'prepend':
                appendTo.prepend(resultDocument);
                break;
        }
        switch (mode) {
            case 'replace':
                proxy.remove();
        }
    }
    async onXsltSearch({ xsltSearch }) {
        const { upShadowSearch } = await import('trans-render/lib/upShadowSearch.js');
        const template = upShadowSearch(this.#target, xsltSearch);
        const xsltNode = template.content;
        return { xsltNode };
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
            virtualProps: ['xslt', 'whenDefined', 'areDefined', 'xsltNode', 'xsltSearch', 'mode'],
            proxyPropDefaults: {
                whenDefined: [],
                mode: 'replace'
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
            onXsltSearch: {
                ifAllOf: ['xsltSearch'],
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
