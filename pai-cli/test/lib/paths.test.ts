import {mkdirSync, mkdtempSync, rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

import {expect} from 'chai'

import {isWorkspace, resolvePath} from '../../src/lib/paths.js'

describe('paths', () => {
  describe('resolvePath', () => {
    it('joins path segments correctly', () => {
      const result = resolvePath('a', 'b', 'c')
      // Use includes to handle platform differences (/ vs \)
      expect(result).to.include('a')
      expect(result).to.include('b')
      expect(result).to.include('c')
    })

    it('returns single segment unchanged', () => {
      const result = resolvePath('single')
      expect(result).to.equal('single')
    })

    it('handles empty segments', () => {
      const result = resolvePath()
      expect(result).to.equal('.')
    })
  })

  describe('isWorkspace', () => {
    it('returns false for non-workspace directory', () => {
      // Use a directory that definitely doesn't have .pai
      const result = isWorkspace('/nonexistent/path/that/does/not/exist')
      expect(result).to.be.false
    })

    it('returns true for directory containing .pai marker', () => {
      // Create temp directory with .pai marker
      const tempDir = mkdtempSync(join(tmpdir(), 'pai-test-'))
      const paiMarker = join(tempDir, '.pai')
      mkdirSync(paiMarker)

      try {
        const result = isWorkspace(tempDir)
        expect(result).to.be.true
      } finally {
        // Cleanup
        rmSync(tempDir, {recursive: true})
      }
    })

    it('returns boolean value', () => {
      const result = isWorkspace('.')
      expect(result).to.be.a('boolean')
    })
  })
})
