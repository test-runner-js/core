## Modules

<dl>
<dt><a href="#module_test-runner-core">test-runner-core</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#Queue">Queue</a></dt>
<dd></dd>
</dl>

<a name="module_test-runner-core"></a>

## test-runner-core

* [test-runner-core](#module_test-runner-core)
    * [TestRunnerCore](#exp_module_test-runner-core--TestRunnerCore) ⏏
        * [new TestRunnerCore(tom, [options])](#new_module_test-runner-core--TestRunnerCore_new)
        * [.state](#module_test-runner-core--TestRunnerCore+state) : <code>string</code>
        * [.tom](#module_test-runner-core--TestRunnerCore+tom) : <code>TestObjectModel</code>
        * [.ended](#module_test-runner-core--TestRunnerCore+ended) : <code>boolean</code>
        * [.view](#module_test-runner-core--TestRunnerCore+view) : <code>View</code>
        * [.stats](#module_test-runner-core--TestRunnerCore+stats)
        * [.start()](#module_test-runner-core--TestRunnerCore+start) ⇒ <code>Promise</code>
        * ["fail"](#module_test-runner-core--TestRunnerCore+event_fail)
        * ["in-progress" (testCount)](#module_test-runner-core--TestRunnerCore+event_in-progress)
        * ["start" (testCount)](#module_test-runner-core--TestRunnerCore+event_start)
        * ["pass"](#module_test-runner-core--TestRunnerCore+event_pass)
        * ["end"](#module_test-runner-core--TestRunnerCore+event_end)

<a name="exp_module_test-runner-core--TestRunnerCore"></a>

### TestRunnerCore ⏏
**Kind**: Exported class  
**Emits**: <code>event:start</code>, <code>event:end</code>  
<a name="new_module_test-runner-core--TestRunnerCore_new"></a>

#### new TestRunnerCore(tom, [options])

| Param | Type |
| --- | --- |
| tom | <code>TestObjectModel</code> | 
| [options] | <code>object</code> | 
| [options.view] | <code>function</code> | 
| [options.debug] | <code>boolean</code> | 

<a name="module_test-runner-core--TestRunnerCore+state"></a>

#### testRunnerCore.state : <code>string</code>
State machine: pending -> in-progress -> pass or fail

**Kind**: instance property of [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  
<a name="module_test-runner-core--TestRunnerCore+tom"></a>

#### testRunnerCore.tom : <code>TestObjectModel</code>
Test Object Model

**Kind**: instance property of [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  
<a name="module_test-runner-core--TestRunnerCore+ended"></a>

#### testRunnerCore.ended : <code>boolean</code>
Ended flag

**Kind**: instance property of [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  
<a name="module_test-runner-core--TestRunnerCore+view"></a>

#### testRunnerCore.view : <code>View</code>
View

**Kind**: instance property of [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  
<a name="module_test-runner-core--TestRunnerCore+stats"></a>

#### testRunnerCore.stats
Runner stats

**Kind**: instance property of [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  
<a name="module_test-runner-core--TestRunnerCore+start"></a>

#### testRunnerCore.start() ⇒ <code>Promise</code>
Start the runner

**Kind**: instance method of [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  
**Fulfil**: <code>Array&lt;Array&gt;</code> - Fulfils with an array of arrays containing results for each batch of concurrently run tests.  
<a name="module_test-runner-core--TestRunnerCore+event_fail"></a>

#### "fail"
Test suite failed

**Kind**: event emitted by [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  
<a name="module_test-runner-core--TestRunnerCore+event_in-progress"></a>

#### "in-progress" (testCount)
in-progress

**Kind**: event emitted by [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  

| Param | Type | Description |
| --- | --- | --- |
| testCount | <code>number</code> | the numbers of tests |

<a name="module_test-runner-core--TestRunnerCore+event_start"></a>

#### "start" (testCount)
Start

**Kind**: event emitted by [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  

| Param | Type | Description |
| --- | --- | --- |
| testCount | <code>number</code> | the numbers of tests |

<a name="module_test-runner-core--TestRunnerCore+event_pass"></a>

#### "pass"
Test suite passed

**Kind**: event emitted by [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  
<a name="module_test-runner-core--TestRunnerCore+event_end"></a>

#### "end"
Test suite ended

**Kind**: event emitted by [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  
<a name="Queue"></a>

## Queue
**Kind**: global class  
<a name="new_Queue_new"></a>

### new Queue(jobs, maxConcurrency)

| Param | Type | Description |
| --- | --- | --- |
| jobs | <code>Array.&lt;function()&gt;</code> | An array of functions, each of which must return a Promise. |
| maxConcurrency | <code>number</code> |  |

