export default ViewBase => class ConsoleView extends ViewBase {
  start (count) {
    this.log(`Starting: ${count} tests`)
  }
  testPass (test, result) {
    this.log('✓', test.name, result || 'ok')
  }
  testSkip (test) {
    this.log('-', test.name)
  }
  testFail (test, err) {
    this.log('⨯', test.name)
    this.log(err)
  }
  end () {
    this.log(`End`)
  }
}
