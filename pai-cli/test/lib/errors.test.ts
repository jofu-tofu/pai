import {expect} from 'chai'

import {ConfigNotFoundError, EnvironmentError, PaiError} from '../../src/lib/errors.js'
import {EXIT_CODES} from '../../src/types/exit-codes.js'

describe('errors', () => {
  describe('PaiError', () => {
    it('has correct name', () => {
      const error = new PaiError('test message')
      expect(error.name).to.equal('PaiError')
    })

    it('stores message correctly', () => {
      const error = new PaiError('test message')
      expect(error.message).to.equal('test message')
    })

    it('defaults to GENERAL_ERROR exit code', () => {
      const error = new PaiError('test message')
      expect(error.exitCode).to.equal(EXIT_CODES.GENERAL_ERROR)
    })

    it('accepts custom exit code', () => {
      const error = new PaiError('test message', EXIT_CODES.INVALID_USAGE)
      expect(error.exitCode).to.equal(EXIT_CODES.INVALID_USAGE)
    })

    it('extends Error', () => {
      const error = new PaiError('test message')
      expect(error).to.be.instanceOf(Error)
    })
  })

  describe('ConfigNotFoundError', () => {
    it('has correct name', () => {
      const error = new ConfigNotFoundError('config not found')
      expect(error.name).to.equal('ConfigNotFoundError')
    })

    it('has ENVIRONMENT_ERROR exit code', () => {
      const error = new ConfigNotFoundError('config not found')
      expect(error.exitCode).to.equal(EXIT_CODES.ENVIRONMENT_ERROR)
    })

    it('extends PaiError', () => {
      const error = new ConfigNotFoundError('config not found')
      expect(error).to.be.instanceOf(PaiError)
    })
  })

  describe('EnvironmentError', () => {
    it('has correct name', () => {
      const error = new EnvironmentError('environment issue')
      expect(error.name).to.equal('EnvironmentError')
    })

    it('has ENVIRONMENT_ERROR exit code', () => {
      const error = new EnvironmentError('environment issue')
      expect(error.exitCode).to.equal(EXIT_CODES.ENVIRONMENT_ERROR)
    })

    it('extends PaiError', () => {
      const error = new EnvironmentError('environment issue')
      expect(error).to.be.instanceOf(PaiError)
    })
  })
})
