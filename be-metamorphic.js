import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
const xsltLookup = {};
export class BeMetamorphicController {
    #target;
    intro(proxy, target, { ifWantsToBe, proxyPropDefaults }) {
        this.#target = target;
        const attr = target.getAttribute(`is-${ifWantsToBe}`).trim();
        const morphParams = { ...proxyPropDefaults.morphParams };
        if (attr.length > 0) {
            if (attr[0] === '{') {
                Object.assign(morphParams, JSON.parse(attr));
            }
            else {
                Object.assign(morphParams, {
                    attr: {
                        mode: 'replace',
                        whenDefined: [],
                    }
                });
            }
        }
        proxy.morphParams = morphParams;
    }
    async onMorphParams({ morphParams, proxy }) {
        for (const key in morphParams) {
            const { isUpSearch, whenDefined, mode, target } = morphParams[key];
            let xsltProcessor = xsltLookup[key];
            if (xsltProcessor === undefined) {
                let xsltNode;
                if (isUpSearch) {
                    const { upShadowSearch } = await import('trans-render/lib/upShadowSearch.js');
                    const template = upShadowSearch(this.#target, key);
                    xsltNode = template.content;
                }
                else {
                    const resp = await fetch(key);
                    const xsltString = await resp.text();
                    xsltNode = new DOMParser().parseFromString(xsltString, 'text/xml');
                }
                for (const s of whenDefined) {
                    await customElements.whenDefined(s);
                }
                xsltProcessor = new XSLTProcessor();
                xsltProcessor.importStylesheet(xsltNode);
                xsltLookup[key] = xsltProcessor;
            }
            const resultDocument = xsltProcessor.transformToFragment(this.#target, document);
            let appendTo = this.#target;
            if (target !== undefined) {
                appendTo = this.#target.getRootNode().querySelector(target);
            }
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
    }
    onOn({ on }) {
        for (const key of on) {
            this.#target.addEventListener(key, (e) => {
                this.onMorphParams(this);
            });
        }
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
            virtualProps: ['morphParams'],
            proxyPropDefaults: {}
        },
        actions: {
            onMorphParams: {
                ifAllOf: ['morphParams'],
            }
        }
    },
    complexPropDefaults: {
        controller: BeMetamorphicController,
    }
});
register(ifWantsToBe, upgrade, tagName);
