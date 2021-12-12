import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {BeMetamorphicVirtualProps, BeMetamorphicProps, BeMetamorphicActions, MorphParam} from './types';
import {register} from 'be-hive/register.js';

const xsltLookup: {[key: string]: XSLTProcessor} = {};

const nogo =  ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

export class BeMetamorphicController implements BeMetamorphicActions{

    #target!: Element
    intro(proxy: Element & BeMetamorphicVirtualProps, target: Element, {ifWantsToBe, proxyPropDefaults}: BeDecoratedProps & BeMetamorphicVirtualProps): void {
        this.#target = target;
        const attr = target.getAttribute(`is-${ifWantsToBe}`)!.trim();
        const morphParams = {...proxyPropDefaults.morphParams};
        if(attr.length > 0){
            if(attr[0] === '{'){
                Object.assign(morphParams, JSON.parse(attr));
            }else{
                Object.assign(morphParams, {
                    attr:{
                        mode: 'replace',
                        whenDefined: [],
                    }
                })
            }
            
        }
        proxy.morphParams = morphParams;
    }

    async onMorphParams({morphParams, proxy}: this){
        for(const key in morphParams){
            const {isUpSearch, whenDefined, mode, target} = morphParams[key] as MorphParam;
            let xsltProcessor = xsltLookup[key];
            if(xsltProcessor === undefined){
                let xsltNode: DocumentFragment | Document | undefined;
                if(isUpSearch){
                    const {upShadowSearch} = await import('trans-render/lib/upShadowSearch.js');
                    const template = upShadowSearch(this.#target, key)! as HTMLTemplateElement;
                    xsltNode = template.content;
                }else{
                    const resp = await fetch(key);
                    const xsltString = await resp.text();
                    xsltNode = new DOMParser().parseFromString(xsltString, 'text/xml');
                }
                for(const s of whenDefined){
                    await customElements.whenDefined(s);
                }
                xsltProcessor = new XSLTProcessor();
                xsltProcessor.importStylesheet(xsltNode);
                xsltLookup[key] = xsltProcessor;
            }
            this.swap(this.#target, true);
            const resultDocument = xsltProcessor.transformToFragment(this.#target, document);
            this.swap(this.#target, false);
            let appendTo = this.#target;
            if(target !== undefined){
                appendTo = (this.#target.getRootNode() as DocumentFragment).querySelector(target) as Element;
            }
            switch(mode){
                case 'replace':
                case 'adjacentAfterEnd':
                    for(const childNode of resultDocument.children){
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
            switch(mode){
                case 'replace':
                    proxy.remove();
            }
        }
    }

    onOn({on}: this){
        for(const key of on){
            this.#target.addEventListener(key, (e: Event) => {
                this.onMorphParams(this);
            });
        }
    }
    
    swap(target: Element, toIsh: boolean){
        const qry = toIsh ? nogo.join(',') : nogo.join('-ish,');
        const problemTags = target.querySelectorAll(qry);
        problemTags.forEach(tag => {
            const newTagName = toIsh ? tag.localName + '-ish' : tag.localName.substring(0, tag.localName.length - 4);
            const newTag = document.createElement(newTagName);
            for(let i = 0, ii = tag.attributes.length; i < ii; i++){
                newTag.setAttribute(tag.attributes[i].name, tag.attributes[i].value);
                tag.insertAdjacentElement('afterend', newTag);
            }
        });
        problemTags.forEach(tag => tag.remove());        
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
            forceVisible: true,
            virtualProps: ['morphParams', 'on'],
            proxyPropDefaults:{
                
            }
        },
        actions:{
            onMorphParams:{
                ifAllOf: ['morphParams'],
            },
            onOn:{
                ifAllOf: ['on', 'morphParams'],
            }

        }
    },
    complexPropDefaults:{
        controller: BeMetamorphicController,
    }
});

register(ifWantsToBe, upgrade, tagName);