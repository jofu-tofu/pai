import {expect} from 'chai'
import sinon from 'sinon'

import {debug, isDebugEnabled, setDebugEnabled} from '../../src/lib/debug.js'

describe('debug', () => {
  let stderrStub: sinon.SinonStub

  beforeEach(() => {
    // Reset debug state before each test
    setDebugEnabled(false)
    stderrStub = sinon.stub(process.stderr, 'write')
  })

  afterEach(() => {
    stderrStub.restore()
    setDebugEnabled(false)
  })

  describe('isDebugEnabled', () => {
    it('returns false by default', () => {
      expect(isDebugEnabled()).to.be.false
    })

    it('returns true after setDebugEnabled(true)', () => {
      setDebugEnabled(true)
      expect(isDebugEnabled()).to.be.true
    })

    it('returns false after setDebugEnabled(false)', () => {
      setDebugEnabled(true)
      setDebugEnabled(false)
      expect(isDebugEnabled()).to.be.false
    })
  })

  describe('setDebugEnabled', () => {
    it('enables debug mode when passed true', () => {
      setDebugEnabled(true)
      expect(isDebugEnabled()).to.be.true
    })

    it('disables debug mode when passed false', () => {
      setDebugEnabled(true)
      setDebugEnabled(false)
      expect(isDebugEnabled()).to.be.false
    })
  })

  describe('debug', () => {
    it('does not output when debug is disabled', () => {
      setDebugEnabled(false)
      debug('test message')
      expect(stderrStub.called).to.be.false
    })

    it('outputs to stderr when debug is enabled', () => {
      setDebugEnabled(true)
      debug('test message')
      expect(stderrStub.called).to.be.true
    })

    it('prefixes message with [debug]', () => {
      setDebugEnabled(true)
      debug('test message')
      const output = stderrStub.firstCall.args[0]
      expect(output).to.include('[debug]')
      expect(output).to.include('test message')
    })

    it('includes newline in output', () => {
      setDebugEnabled(true)
      debug('test message')
      const output = stderrStub.firstCall.args[0]
      expect(output).to.include('\n')
    })

    it('handles empty messages', () => {
      setDebugEnabled(true)
      debug('')
      expect(stderrStub.called).to.be.true
      const output = stderrStub.firstCall.args[0]
      expect(output).to.include('[debug]')
    })

    it('handles messages with special characters', () => {
      setDebugEnabled(true)
      debug(String.raw`path: C:\Users\test\.pai`)
      const output = stderrStub.firstCall.args[0]
      expect(output).to.include(String.raw`C:\Users\test\.pai`)
    })
  })
})
