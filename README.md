# be-metamorphic

be-metamorphic lets us party like it's 1999, and take advantage of the [increasingly popular](https://www.chromestatus.com/metrics/feature/timeline/popularity/79) XSLT, to turn a caterpillar of native HTML markup into a butterfly of web components-filled goodness.

<a href="https://nodei.co/npm/be-netaniroguc/"><img src="https://nodei.co/npm/be-metamorphic.png"></a>

[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-metamorphic?style=for-the-badge)](https://bundlephobia.com/result?p=be-metamorphic)

<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-metamorphic?compression=gzip">

## Problem Statements

1.  Progressively enhance a web page by converting swaths of native HTML, or tag names that are meaningful to the business, into web components, once component dependencies are downloaded.
2.  ~~Generate table of contents from large document.~~  This will be handled by be-restated.

```html
<div be-metamorphic='{
    "whenDefined": ["ui5-li", "ui5-list"],
    "xslt": "./ui5-list.xslt"
}'>
  <ul>
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
  <template be-a-beacon></template>
</div>
```

When combined with xslt file:

```xslt
<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
    <xsl:for-each select="div/ul">
        <ui5-list style="height: 300px" growing="Scroll">
            <xsl:for-each select="li">
                <ui5-li 
                    icon="nutrition-activity" 
                    description="{span[@slot='description']}" 
                    additional-text="{span[@slot='additional-text']}"
                    additional-text-state="{span[@slot='additional-text-state']}"
                >
                    <xsl:value-of select="node()"/>
                </ui5-li>
            </xsl:for-each>
        </ui5-list>
    </xsl:for-each>
</xsl:template>

</xsl:stylesheet>
```

generates:

```html
<div is-metamorphic>
  <ui5-list style="height: 300px" growing="Scroll">
    <ui5-li icon="nutrition-activity" description="Occurs between red and yellow" additional-text="Expires" additional-text-state="Warning">
        Pineapple
        </ui5-li>
    <ui5-li icon="nutrition-activity" description="The yellow lengthy fruit" additional-text="Re-stock" additional-text-state="Error">
        Banana
    </ui5-li>
  </ui5-list>
  <template be-a-beacon>
</div>
```

The presence of the template (be-a-beacon) at the bottom is needed to let be-metamorphic know it can proceed with the transformation.

## Shared template

```html
<div be-metamorphic>
  <ul>
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
    <template be-a-beacon>
  </ul>
</div>

<be-hive>
  <be-metamorphic proxy-prop-defaults='{
    "whenDefined": ["ui5-li", "ui5-list"],
    "xslt": "./ui5-list.xslt"
  }'></be-metamorphic>
</be-hive>
```

This shares the same settings for all the elements adorned with be-metamorphic in the ShadowDOM realm.

