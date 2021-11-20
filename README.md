# be-metamorphic [TODO]

be-metamorphic let's us party like it's 1999, and take advantage of the [increasingly popular](https://www.chromestatus.com/metrics/feature/timeline/popularity/79) XSLT to turn a caterpillar of native HTML markup into a butterfly of web components filled goodness.



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

## Delayed Satisfaction

Oftentimes we don't want to transform the original native html into the more robust markup until the needed downloads have finished. 

```html
<ul be-metamorphic='{
  "xslt": "./ui5-list.xsl",
  "whenDefined": ["ui5-list", "ui5-li"]
}'
>
</ul>
```

## Use of import maps

```html
<html>
<head>
<script type=importmap>
  "imports":{
    "my-package/": "https://example.com/my-package/"
  }
</script>
</head>
<body>
  <ul be-metamorphic=my-package/ui5-list.xslt>
```




