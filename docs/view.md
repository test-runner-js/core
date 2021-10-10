<a name="CustomView"></a>

## CustomView
Custom view API.

**Kind**: global class  

* [CustomView](#CustomView)
    * _instance_
        * [.runner](#CustomView+runner)
        * [.init()](#CustomView+init) ⇒ <code>Promise</code>
        * [.start(count)](#CustomView+start)
        * [.testStart(test)](#CustomView+testStart)
        * [.testPass(test)](#CustomView+testPass)
        * [.testFail(test)](#CustomView+testFail)
        * [.testSkip(test)](#CustomView+testSkip)
        * [.testIgnore(test)](#CustomView+testIgnore)
        * [.testTodo(test)](#CustomView+testTodo)
        * [.end()](#CustomView+end)
    * _static_
        * [.optionDefinitions()](#CustomView.optionDefinitions) ⇒ <code>Array.&lt;OptionDefinition&gt;</code>

<a name="CustomView+runner"></a>

### customView.runner
TODO: Remove. Currently used by live-view.

**Kind**: instance property of [<code>CustomView</code>](#CustomView)  
<a name="CustomView+init"></a>

### customView.init() ⇒ <code>Promise</code>
An asynchronous method invoked by the runner just before the test run begins.

**Kind**: instance method of [<code>CustomView</code>](#CustomView)  
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

### customView.testPass(test)
Test passed.

**Kind**: instance method of [<code>CustomView</code>](#CustomView)  

| Param | Type |
| --- | --- |
| test | <code>Tom</code> | 

<a name="CustomView+testFail"></a>

### customView.testFail(test)
Test failed.

**Kind**: instance method of [<code>CustomView</code>](#CustomView)  

| Param | Type |
| --- | --- |
| test | <code>Tom</code> | 

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

<a name="CustomView+testTodo"></a>

### customView.testTodo(test)
Test todo.

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
