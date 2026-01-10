import {expect} from 'chai'

import {getPaiHome, type PaiConfig} from '../../src/lib/config.js'

describe('config', () => {
  describe('getPaiHome', () => {
    it('returns a string path', () => {
      const result = getPaiHome()
      expect(result).to.be.a('string')
    })

    it('returns path containing .pai', () => {
      const result = getPaiHome()
      expect(result).to.include('.pai')
    })

    it('respects PAI_HOME environment variable when set', () => {
      const originalPaiHome = process.env['PAI_HOME']
      try {
        process.env['PAI_HOME'] = '/custom/pai/home'
        const result = getPaiHome()
        expect(result).to.equal('/custom/pai/home')
      } finally {
        if (originalPaiHome === undefined) {
          delete process.env['PAI_HOME']
        } else {
          process.env['PAI_HOME'] = originalPaiHome
        }
      }
    })
  })

  describe('PaiConfig', () => {
    it('interface is importable and has expected shape', () => {
      // Type-level test - if this compiles, the interface is correctly exported
      const config: PaiConfig = {
        paiHome: '/test/path',
      }
      expect(config.paiHome).to.equal('/test/path')
    })
  })
})
