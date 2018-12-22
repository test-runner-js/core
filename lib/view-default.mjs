export default ViewBase => class ConsoleView extends ViewBase {
  start (count) {
    console.log(`Starting: ${count} tests`)
  }
  testPass (test, result) {
    console.log('✓', test.name, result || 'ok')
  }
  testSkip (test) {
    console.log('-', test.name)
  }
  testFail (test, err) {
    console.log('⨯', test.name)
    console.log(err)
  }
  end () {
    console.log(`End`)
  }
}
