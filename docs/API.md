<a name="module_test-runner-core"></a>

## test-runner-core

* [test-runner-core](#module_test-runner-core)
    * [TestRunner](#exp_module_test-runner-core--TestRunner) ⏏
        * [new TestRunner([options])](#new_module_test-runner-core--TestRunner_new)
        * [.state](#module_test-runner-core--TestRunner+state) : <code>string</code>
        * [.tom](#module_test-runner-core--TestRunner+tom) : <code>TestObjectModel</code>
        * [.ended](#module_test-runner-core--TestRunner+ended) : <code>boolean</code>
        * [.view](#module_test-runner-core--TestRunner+view) : <code>function</code>
        * [.start()](#module_test-runner-core--TestRunner+start) ⇒ <code>Promise</code>
        * ["in-progress" (testCount)](#module_test-runner-core--TestRunner+event_in-progress)
        * ["start" (testCount)](#module_test-runner-core--TestRunner+event_start)
        * ["fail"](#module_test-runner-core--TestRunner+event_fail)
        * ["pass"](#module_test-runner-core--TestRunner+event_pass)
        * ["end"](#module_test-runner-core--TestRunner+event_end)

<a name="exp_module_test-runner-core--TestRunner"></a>

### TestRunner ⏏
**Kind**: Exported class  
**Emits**: <code>event:start</code>, <code>event:end</code>  
<a name="new_module_test-runner-core--TestRunner_new"></a>

#### new TestRunner([options])

| Param | Type |
| --- | --- |
| [options] | <code>object</code> | 
| [options.view] | <code>function</code> | 
| [options.tom] | <code>object</code> | 

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

#### testRunner.view : <code>function</code>
View

**Kind**: instance property of [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  
<a name="module_test-runner-core--TestRunner+start"></a>

#### testRunner.start() ⇒ <code>Promise</code>
Start the runner

**Kind**: instance method of [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  
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

<a name="module_test-runner-core--TestRunner+event_fail"></a>

#### "fail"
Test suite failed

**Kind**: event emitted by [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  
<a name="module_test-runner-core--TestRunner+event_pass"></a>

#### "pass"
Test suite passed

**Kind**: event emitted by [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  
<a name="module_test-runner-core--TestRunner+event_end"></a>

#### "end"
Test suite ended

**Kind**: event emitted by [<code>TestRunner</code>](#exp_module_test-runner-core--TestRunner)  
