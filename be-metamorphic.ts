import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {BeMetamorphicVirtualProps, BeMetamorphicProps, BeMetamorphicActions, MorphParam, P} from './types';
import {register} from 'be-hive/register.js';

const xsltLookup: {[key: string]: XSLTProcessor} = {};

export class BeMetamorphicController implements BeMetamorphicActions{

    #target!: Element
    intro(proxy: Element & BeMetamorphicVirtualProps, target: Element, {ifWantsToBe, proxyPropDefaults}: BeDecoratedProps & BeMetamorphicVirtualProps): void {
        this.#target = target;
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
        this.#target.innerHTML = '';
        this.#target.append(resultDocument);
    //         if(!cloneAndExpandTempl){
    //             swap(xmlSrc, false);
    //         }
        return {}
    }

    // async onMorphParams({morphParams, proxy}: this){
    //     const {swap} = await import('trans-render/xslt/swap.js');
    //     for(const key in morphParams){
    //         const {isUpSearch, whenDefined, mode, cloneAndExpandTempl} = morphParams[key] as MorphParam;
    //         let xsltProcessor = xsltLookup[key];
    //         if(xsltProcessor === undefined){
    //             let xsltNode: DocumentFragment | Document | undefined;
    //             if(isUpSearch){
    //                 const {upShadowSearch} = await import('trans-render/lib/upShadowSearch.js');
    //                 const template = upShadowSearch(this.#target, key)! as HTMLTemplateElement;
    //                 xsltNode = template.content;
    //             }else{
    //                 const resp = await fetch(key);
    //                 const xsltString = await resp.text();
    //                 xsltNode = new DOMParser().parseFromString(xsltString, 'text/xml');
    //             }
    //             for(const s of whenDefined){
    //                 await customElements.whenDefined(s);
    //             }
    //             xsltProcessor = new XSLTProcessor();
    //             xsltProcessor.importStylesheet(xsltNode);
    //             xsltLookup[key] = xsltProcessor;
    //         }
    //         let xmlSrc = this.#target;
    //         if(cloneAndExpandTempl){
    //             const {clone} = await import('trans-render/xslt/clone.js');
    //             xmlSrc = clone(xmlSrc);
    //         }
            
    //         swap(xmlSrc, true);

    //         const resultDocument = xsltProcessor.transformToFragment(xmlSrc, document);
    //         if(!cloneAndExpandTempl){
    //             swap(xmlSrc, false);
    //         }
            
    //         let appendTo = this.#target;
    //         switch(mode){
    //             case 'replace':
    //             case 'adjacentAfterEnd':
    //                 for(const childNode of resultDocument.children){
    //                     appendTo.insertAdjacentElement('afterend', childNode);
    //                     appendTo = childNode;
    //                 }
    //                 break;
    //             case 'append':
    //                 appendTo.append(resultDocument);
    //                 break;
    //             case 'prepend':
    //                 appendTo.prepend(resultDocument);
    //                 break;
    //         }
    //         switch(mode){
    //             case 'replace':
    //                 proxy.remove();
    //         }
    //     }
    // }

    // onOn({on}: this){
    //     for(const key of on){
    //         this.#target.addEventListener(key, (e: Event) => {
    //             this.onMorphParams(this);
    //         });
    //     }
    // }

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
            virtualProps: ['beaconFound', 'xslt', 'whenDefined', 'expandTempl', 'xsltProcessor'],
            proxyPropDefaults:{
                beaconFound: false,
                expandTempl: false,
            }
        },
        actions:{
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