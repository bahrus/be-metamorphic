# be-metamorphic [WIP]

be-metamorphic let's us party like it's 1999, and take advantage of the [increasingly popular](https://www.chromestatus.com/metrics/feature/timeline/popularity/79) XSLT to turn a caterpillar of native HTML markup into a butterfly of web components-filled goodness.

<a href="https://nodei.co/npm/be-netaniroguc/"><img src="https://nodei.co/npm/be-metamorphic.png"></a>

[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-metamorphic?style=for-the-badge)](https://bundlephobia.com/result?p=be-metamorphic)

<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-metamorphic?compression=gzip">

## Problem Statements

1.  Progressively enhance a web page by converting swaths of native HTML, or tag names that are meaningful to the business into web components once component dependencies are downloaded.
2.  ~~Generate table of contents from large document.~~  This will be handled by be-restated.

```html

<ul be-metamorphic='{
    "whenDefined": ["ui5-li", "ui5-list"]
    "xslt": "./ui5-list.xslt"
}'>
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
  <template be-a-beacon></template>
</ul>
```

When combined with xslt file:

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

The presence of the template at the bottom is needed to let be-metamorphic know it can proceed with the transformation.

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
  <template be-metamorphic>
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

