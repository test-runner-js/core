## Modules

<dl>
<dt><a href="#module_test-runner-core">test-runner-core</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#Stats">Stats</a></dt>
<dd><p>Stats object.</p>
</dd>
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
        * [.stats](#module_test-runner-core--TestRunnerCore+stats) : [<code>Stats</code>](#Stats)
        * [.start()](#module_test-runner-core--TestRunnerCore+start)
        * ["test-start" (test)](#module_test-runner-core--TestRunnerCore+event_test-start)
        * ["test-pass" (test, result)](#module_test-runner-core--TestRunnerCore+event_test-pass)
        * ["test-fail" (test, err)](#module_test-runner-core--TestRunnerCore+event_test-fail)
        * ["test-skip" (test)](#module_test-runner-core--TestRunnerCore+event_test-skip)
        * ["test-ignore" (test)](#module_test-runner-core--TestRunnerCore+event_test-ignore)
        * ["fail"](#module_test-runner-core--TestRunnerCore+event_fail)
        * ["in-progress" (testCount)](#module_test-runner-core--TestRunnerCore+event_in-progress)
        * ["start" (testCount)](#module_test-runner-core--TestRunnerCore+event_start)
        * ["pass"](#module_test-runner-core--TestRunnerCore+event_pass)
        * ["end"](#module_test-runner-core--TestRunnerCore+event_end)

<a name="exp_module_test-runner-core--TestRunnerCore"></a>

### TestRunnerCore ⏏
**Kind**: Exported class  
<a name="new_module_test-runner-core--TestRunnerCore_new"></a>

#### new TestRunnerCore(tom, [options])

| Param | Type | Description |
| --- | --- | --- |
| tom | <code>TestObjectModel</code> |  |
| [options] | <code>object</code> | Config object. |
| [options.view] | <code>function</code> | View instance. |
| [options.debug] | <code>boolean</code> | Log all errors. |

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

#### testRunnerCore.stats : [<code>Stats</code>](#Stats)
Runner stats

**Kind**: instance property of [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  
<a name="module_test-runner-core--TestRunnerCore+start"></a>

#### testRunnerCore.start()
Start the runner.

**Kind**: instance method of [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  
<a name="module_test-runner-core--TestRunnerCore+event_test-start"></a>

#### "test-start" (test)
Test start.

**Kind**: event emitted by [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  

| Param | Type | Description |
| --- | --- | --- |
| test | <code>TestObjectModel</code> | The test node. |

<a name="module_test-runner-core--TestRunnerCore+event_test-pass"></a>

#### "test-pass" (test, result)
Test pass.

**Kind**: event emitted by [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  

| Param | Type | Description |
| --- | --- | --- |
| test | <code>TestObjectModel</code> | The test node. |
| result | <code>\*</code> | The value returned by the test. |

<a name="module_test-runner-core--TestRunnerCore+event_test-fail"></a>

#### "test-fail" (test, err)
Test fail.

**Kind**: event emitted by [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  

| Param | Type | Description |
| --- | --- | --- |
| test | <code>TestObjectModel</code> | The test node. |
| err | <code>Error</code> | The exception thrown by the test. |

<a name="module_test-runner-core--TestRunnerCore+event_test-skip"></a>

#### "test-skip" (test)
Test skip.

**Kind**: event emitted by [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  

| Param | Type | Description |
| --- | --- | --- |
| test | <code>TestObjectModel</code> | The test node. |

<a name="module_test-runner-core--TestRunnerCore+event_test-ignore"></a>

#### "test-ignore" (test)
Test ignore.

**Kind**: event emitted by [<code>TestRunnerCore</code>](#exp_module_test-runner-core--TestRunnerCore)  

| Param | Type | Description |
| --- | --- | --- |
| test | <code>TestObjectModel</code> | The test node. |

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
<a name="Stats"></a>

## Stats
Stats object.

**Kind**: global class  

* [Stats](#Stats)
    * [.total](#Stats+total)
    * [.start](#Stats+start)
    * [.end](#Stats+end)

<a name="Stats+total"></a>

### stats.total
Total tests run.

**Kind**: instance property of [<code>Stats</code>](#Stats)  
<a name="Stats+start"></a>

### stats.start
Runner start time.

**Kind**: instance property of [<code>Stats</code>](#Stats)  
<a name="Stats+end"></a>

### stats.end
Runner end time.

**Kind**: instance property of [<code>Stats</code>](#Stats)  
