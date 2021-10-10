<a name="module_test-runner-core"></a>

## test-runner-core

* [test-runner-core](#module_test-runner-core)
    * [TestRunner](#exp_module_test-runner-core--TestRunner) ⏏
        * [new TestRunner(tom, [options])](#new_module_test-runner-core--TestRunner_new)
        * [.state](#module_test-runner-core--TestRunner+state) : <code>string</code>
        * [.tom](#module_test-runner-core--TestRunner+tom) : <code>TestObjectModel</code>
        * [.ended](#module_test-runner-core--TestRunner+ended) : <code>boolean</code>
        * [.view](#module_test-runner-core--TestRunner+view) : <code>View</code>
        * [.stats](#module_test-runner-core--TestRunner+stats) : <code>object</code>
        * [.start()](#module_test-runner-core--TestRunner+start)
        * ["test-start" (test)](#module_test-runner-core--TestRunner+event_test-start)
        * ["test-pass" (test, result)](#module_test-runner-core--TestRunner+event_test-pass)
        * ["test-fail" (test, err)](#module_test-runner-core--TestRunner+event_test-fail)
        * ["test-skip" (test)](#module_test-runner-core--TestRunner+event_test-skip)
        * ["test-ignore" (test)](#module_test-runner-core--TestRunner+event_test-ignore)
        * ["test-todo" (test)](#module_test-runner-core--TestRunner+event_test-todo)
        * ["in-progress" (testCount)](#module_test-runner-core--TestRunner+event_in-progress)
        * ["start" (testCount)](#module_test-runner-core--TestRunner+event_start)
        * ["pass"](#module_test-runner-core--TestRunner+event_pass)
        * ["end"](#module_test-runner-core--TestRunner+event_end)

<a name="exp_module_test-runner-core--TestRunner"></a>

### TestRunner ⏏
A runner associates a TOM with a View. A runner organises TOM tests into a Work queue and executes them. The runner encapulates the opinion of how a TOM should be executed and displayed. Must be isomorphic.

**Kind**: Exported class  
<a name="new_module_test-runner-core--TestRunner_new"></a>

#### new TestRunner(tom, [options])

| Param | Type | Description |
| --- | --- | --- |
| tom | <code>TestObjectModel</code> |  |
| [options] | <code>object</code> | Config object. |
| [options.view] | <code>function</code> | View instance. |

<a name="module_test-runner-core--TestRunner+state"></a>

#### testRunner.state : <code>string</code>
State machine: pending -> in-progress -> pass or fail

**Kind**: instance property of [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  
<a name="module_test-runner-core--TestRunner+tom"></a>

#### testRunner.tom : <code>TestObjectModel</code>
Test Object Model

**Kind**: instance property of [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  
<a name="module_test-runner-core--TestRunner+ended"></a>

#### testRunner.ended : <code>boolean</code>
Ended flag

**Kind**: instance property of [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  
<a name="module_test-runner-core--TestRunner+view"></a>

#### testRunner.view : <code>View</code>
View

**Kind**: instance property of [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  
<a name="module_test-runner-core--TestRunner+stats"></a>

#### testRunner.stats : <code>object</code>
Runner stats

**Kind**: instance namespace of [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  
**Properties**

| Name | Type |
| --- | --- |
| fail | <code>number</code> | 
| pass | <code>number</code> | 
| skip | <code>number</code> | 
| start | <code>number</code> | 
| end | <code>number</code> | 

<a name="module_test-runner-core--TestRunner+start"></a>

#### testRunner.start()
Start the runner.

**Kind**: instance method of [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  
<a name="module_test-runner-core--TestRunner+event_test-start"></a>

#### "test-start" (test)
Test start.

**Kind**: event emitted by [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  

| Param | Type | Description |
| --- | --- | --- |
| test | <code>TestObjectModel</code> | The test node. |

<a name="module_test-runner-core--TestRunner+event_test-pass"></a>

#### "test-pass" (test, result)
Test pass.

**Kind**: event emitted by [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  

| Param | Type | Description |
| --- | --- | --- |
| test | <code>TestObjectModel</code> | The test node. |
| result | <code>\*</code> | The value returned by the test. |

<a name="module_test-runner-core--TestRunner+event_test-fail"></a>

#### "test-fail" (test, err)
Test fail.

**Kind**: event emitted by [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  

| Param | Type | Description |
| --- | --- | --- |
| test | <code>TestObjectModel</code> | The test node. |
| err | <code>Error</code> | The exception thrown by the test. |

<a name="module_test-runner-core--TestRunner+event_test-skip"></a>

#### "test-skip" (test)
Test skip.

**Kind**: event emitted by [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  

| Param | Type | Description |
| --- | --- | --- |
| test | <code>TestObjectModel</code> | The test node. |

<a name="module_test-runner-core--TestRunner+event_test-ignore"></a>

#### "test-ignore" (test)
Test ignore.

**Kind**: event emitted by [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  

| Param | Type | Description |
| --- | --- | --- |
| test | <code>TestObjectModel</code> | The test node. |

<a name="module_test-runner-core--TestRunner+event_test-todo"></a>

#### "test-todo" (test)
Test todo.

**Kind**: event emitted by [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  

| Param | Type | Description |
| --- | --- | --- |
| test | <code>TestObjectModel</code> | The test node. |

<a name="module_test-runner-core--TestRunner+event_in-progress"></a>

#### "in-progress" (testCount)
in-progress

**Kind**: event emitted by [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  

| Param | Type | Description |
| --- | --- | --- |
| testCount | <code>number</code> | the numbers of tests |

<a name="module_test-runner-core--TestRunner+event_start"></a>

#### "start" (testCount)
Start

**Kind**: event emitted by [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  

| Param | Type | Description |
| --- | --- | --- |
| testCount | <code>number</code> | the numbers of tests |

<a name="module_test-runner-core--TestRunner+event_pass"></a>

#### "pass"
Test suite passed

**Kind**: event emitted by [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  
<a name="module_test-runner-core--TestRunner+event_end"></a>

#### "end"
Test suite ended

**Kind**: event emitted by [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  
