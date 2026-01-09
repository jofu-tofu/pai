import {expect} from 'chai'

import {
  ConfigNotFoundError,
  EnvironmentError,
  getPaiHome,
  isWorkspace,
  type PaiConfig,
  PaiError,
  resolvePath,
} from '../../src/lib/index.js'

describe('lib/index barrel exports', () => {
  it('exports getPaiHome from config', () => {
    expect(getPaiHome).to.be.a('function')
  })

  it('exports PaiConfig interface', () => {
    const config: PaiConfig = {paiHome: '/test'}
    expect(config.paiHome).to.equal('/test')
  })

  it('exports error classes', () => {
    expect(PaiError).to.be.a('function')
    expect(ConfigNotFoundError).to.be.a('function')
    expect(EnvironmentError).to.be.a('function')
  })

  it('exports path utilities', () => {
    expect(resolvePath).to.be.a('function')
    expect(isWorkspace).to.be.a('function')
  })
})
