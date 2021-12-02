# be-metamorphic 

be-metamorphic let's us party like it's 1999, and take advantage of the [increasingly popular](https://www.chromestatus.com/metrics/feature/timeline/popularity/79) XSLT to turn a caterpillar of native HTML markup into a butterfly of web components-filled goodness.

<a href="https://nodei.co/npm/be-netaniroguc/"><img src="https://nodei.co/npm/be-metamorphic.png"></a>

## Problem Statements

1.  Progressively enhance a web page by converting swaths of native HTML into web components once components are downloaded.
2.  Use common definition of web component, based on native elements, to provide bare-bones implementation of web component or web composition, then, based on which design library is loaded, invoke the appropriate transform to morph the native elements into the design library based components.
3.  Use tag names that are meaningful to the business, but transform them to a design library based on their presence.
4.  Generate table of contents from large document.

```html

<ul  be-metamorphic=./ui5-list.xsl>
	<li>
    Pineapple
    <span slot=description>Occurs between red and yellow</span>
    <span slot=additional-text>Expires</span>
    <span slot=additional-text-state>Warning</span>
  </li>
  <li>
    Banana
    <span slot=description>The yellow lengthy fruit</span>
    <span slot=additional-text>Re-stock</span>
    <span slot=additional-text-state>Error</span>   
  </li>
</ul>

```

Combined with xslt file:

```xslt
<xsl:template match="ul" >
    <ui5-list style="height: 300px" growing="Scroll">
        <xsl:apply-templates select="li" />
    </ui5-list>
</xsl:template>
<xsl:template match="li">

    <ui5-li 
        icon="nutrition-activity" 
        description="{span[@slot='description']}" 
        additional-text="{span[@slot='additional-text']}"
        additional-text-state="{span[@slot='additional-text-state']}"
    >
        <xsl:value-of select="node()"/>
    </ui5-li>
</xsl:template>
```

generates:

```html
<ui5-list style="height: 300px" growing="Scroll">
  <ui5-li icon="nutrition-activity" description="Occurs between red and yellow" additional-text="Expires" additional-text-state="Warning">
      Pineapple
      </ui5-li>
  <ui5-li icon="nutrition-activity" description="The yellow lengthy fruit" additional-text="Re-stock" additional-text-state="Error">
      Banana
  </ui5-li>
</ui5-list>
```

## Shared template

```html

<ul  be-metamorphic>
	<li>
    Pineapple
    <span slot=description>Occurs between red and yellow</span>
    <span slot=additional-text>Expires</span>
    <span slot=additional-text-state>Warning</span>
  </li>
  <li>
    Banana
    <span slot=description>The yellow lengthy fruit</span>
    <span slot=additional-text>Re-stock</span>
    <span slot=additional-text-state>Error</span>   
  </li>
</ul>

<table be-metamorphic>
</table>
<be-hive>
  <be-metamorphic proxy-prop-defaults='{
    "./ui5.xslt": {
      "isUpSearch": false,
      "when-defined": ["ui5-list", "ui5-li"],
      "mode": "replace"
    }
  }'>
</be-hive>
```

If no settings are specified (like with the table), share the same settings for all the elements in the ShadowDOM realm.

## Delayed Satisfaction / Conditional Template [TODO]

Oftentimes we don't want to transform the original native html into the more robust markup until the needed downloads have finished. 

And/or we want to apply a conditional transformation based on the presence of the dependencies, allowing us to decide which design library to use via import maps (or some other approach).

```html
<ul be-metamorphic='{
  "./ui5.xslt": {
    "isUpSearch": false,
    "when-defined": ["ui5-list", "ui5-li"],
    "mode": "replace"
  }
}'
>
</ul>
```

## Specifying Target

By default, the output of the xslt replaces the element that the be-metamorphic attribute is attached to.

However, other "modes" are also supported:

```typeScript
export interface BeMetamorphicVirtualProps{
  mode: 'replace' | 'append' | 'prepend' | 'adjacentAfterEnd'
}
```

