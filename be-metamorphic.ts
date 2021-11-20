import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {BeMetamorphicVirtualProps, BeMetamorphicProps, BeMetamorphicActions} from './types';
import {register} from 'be-hive/register.js';

export class BeMetamorphicController implements BeMetamorphicActions{
    
    async onXslt({xslt}: this){
        const resp = await fetch(xslt);
        const xsltString = await resp.text();
        const xsltNode = new DOMParser().parseFromString(xsltString, 'text/xml');
        return {xsltNode};
    }
    async onWhenDefined({whenDefined}: this){
        const promises: Promise<CustomElementConstructor>[] = whenDefined.map(s => customElements.whenDefined(s));
        return Promise.all(promises).then((values) => {
            return {areDefined: true};
        });
    }
    onReady({proxy, xsltNode}: this): void{
        const xslt = new XSLTProcessor();
        xslt.importStylesheet(xsltNode);
        const resultDocument = xslt.transformToFragment(proxy, document);
        let appendTo = proxy as Element;
        for(const childNode of resultDocument.children){
            appendTo.insertAdjacentElement('afterend', childNode);
            appendTo = childNode;
        }
        proxy.remove();   
        
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
            virtualProps: ['xslt', 'whenDefined', 'areDefined', 'xsltNode'],
            proxyPropDefaults:{

            }
        },
        actions:{
            onXslt: {
                ifAllOf: ['xslt']
            },
            onWhenDefined: {
                ifAllOf: ['whenDefined'],
            },
            onReady:{
                ifAllOf: ['xsltNode', 'areDefined']
            }
        }
    },
    complexPropDefaults:{
        controller: BeMetamorphicController,
    }
});

register(ifWantsToBe, upgrade, tagName);