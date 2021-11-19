# be-metamorphic


```html
<style be-evanescent='["ui5-list", "ui5-li"]'>
  ul{
    list-style: none;
    padding: 0;
  }
  li{
    display: inline-block;
    margin-right: 10px;
  }
</style>
<template>
    <xsl:template match="ul" >
        <ui5-list style="height: 300px" growing="Scroll">
            <xsl:apply-templates select="li" />
        </ul5-list>
    </xsl:template>
    <xsl:template match="li">
       <ui5-li icon="nutrition-activity" description="{span[slot=@description]/node()}" additional-text="{span[slot=additional-text]/node()}]}"></ui5-li>
    </xsl:template>
<template>
<ul id="infiniteScrollEx"  be-metamorphic='["ui5-list", "ui5-li"]'>
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




