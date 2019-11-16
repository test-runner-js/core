<a name="CustomView"></a>

## CustomView
Custom view API.

**Kind**: global class  

* [CustomView](#CustomView)
    * _instance_
        * [.start(count)](#CustomView+start)
        * [.testStart(test)](#CustomView+testStart)
        * [.testPass(test, result)](#CustomView+testPass)
        * [.testFail(test, err)](#CustomView+testFail)
        * [.testSkip(test)](#CustomView+testSkip)
        * [.testIgnore(test)](#CustomView+testIgnore)
        * [.end()](#CustomView+end)
    * _static_
        * [.optionDefinitions()](#CustomView.optionDefinitions) ⇒ <code>Array.&lt;OptionDefinition&gt;</code>

<a name="CustomView+start"></a>

### customView.start(count)
Runner start.

**Kind**: instance method of [<code>CustomView</code>](#CustomView)  

| Param | Type |
| --- | --- |
| count | <code>number</code> | 

<a name="CustomView+testStart"></a>

### customView.testStart(test)
Test start

**Kind**: instance method of [<code>CustomView</code>](#CustomView)  

| Param | Type |
| --- | --- |
| test | <code>Tom</code> | 

<a name="CustomView+testPass"></a>

### customView.testPass(test, result)
Test passed.

**Kind**: instance method of [<code>CustomView</code>](#CustomView)  

| Param | Type |
| --- | --- |
| test | <code>Tom</code> | 
| result | <code>\*</code> | 

<a name="CustomView+testFail"></a>

### customView.testFail(test, err)
Test passed.

**Kind**: instance method of [<code>CustomView</code>](#CustomView)  

| Param | Type |
| --- | --- |
| test | <code>Tom</code> | 
| err | <code>\*</code> | 

<a name="CustomView+testSkip"></a>

### customView.testSkip(test)
Test skipped.

**Kind**: instance method of [<code>CustomView</code>](#CustomView)  

| Param | Type |
| --- | --- |
| test | <code>Tom</code> | 

<a name="CustomView+testIgnore"></a>

### customView.testIgnore(test)
Test ignored.

**Kind**: instance method of [<code>CustomView</code>](#CustomView)  

| Param | Type |
| --- | --- |
| test | <code>Tom</code> | 

<a name="CustomView+end"></a>

### customView.end()
**Kind**: instance method of [<code>CustomView</code>](#CustomView)  
**Params**: <code>object</code> stats  
**Params**: <code>object</code> stats.fail  
**Params**: <code>object</code> stats.pass  
**Params**: <code>object</code> stats.skip  
**Params**: <code>object</code> stats.start  
**Params**: <code>object</code> stats.end  
<a name="CustomView.optionDefinitions"></a>

### CustomView.optionDefinitions() ⇒ <code>Array.&lt;OptionDefinition&gt;</code>
Option definitions.

**Kind**: static method of [<code>CustomView</code>](#CustomView)  
