import {execSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {platform} from 'node:os'

import {expect} from 'chai'
import {describe, it} from 'mocha'

describe('Init Command Structure - Integration Tests', () => {
  const bin = platform() === 'win32' ? String.raw`.\bin\dev.cmd` : './bin/dev.js'

  describe('AC1: Show Available Init Subcommands', () => {
    it('validates pai init --help shows pattern explanation and establishes extensible pattern (FR14)', () => {
      const output = execSync(`${bin} init --help`, {
        encoding: 'utf8',
        stdio: 'pipe',
      })

      // AC1: Shows pattern explanation
      expect(output).to.include('Initialize tools and integrations')
      expect(output).to.include('init bmad')

      // FR14: Extensible pattern is clear - shows command structure
      expect(output).to.include('USAGE')
      expect(output).to.include('EXAMPLES')
    })
  })

  describe('AC2: Display Options Without Subcommand', () => {
    it('validates pai init shows available options', () => {
      const output = execSync(`${bin} init`, {
        encoding: 'utf8',
        stdio: 'pipe',
      })

      expect(output).to.include('Available init commands')
      expect(output).to.include('pai init bmad')
    })

    it('validates output suggests pai init bmad as primary option', () => {
      const output = execSync(`${bin} init`, {
        encoding: 'utf8',
        stdio: 'pipe',
      })

      expect(output).to.include('bmad')
      expect(output).to.include('BMAD')
    })

    it('validates exit code 0 when run without subcommand', () => {
      // Should not error - just show options
      try {
        execSync(`${bin} init`, {stdio: 'pipe'})
        expect(true).to.be.true
      } catch {
        expect.fail('pai init should not error when showing options')
      }
    })
  })

  describe('FR14: Extensible Init Pattern', () => {
    it('validates code comments document extensibility pattern', () => {
      const commandFile = readFileSync('src/commands/init/index.ts', 'utf8')

      // Verify extensibility documentation exists in code comments
      expect(commandFile).to.include('EXTENSIBILITY PATTERN')
      expect(commandFile).to.include('To add a new init target')
      expect(commandFile).to.include('Create src/commands/init/')
    })

    it('validates help output shows subcommand structure for easy extension', () => {
      const output = execSync(`${bin} init`, {
        encoding: 'utf8',
        stdio: 'pipe',
      })

      // Validates clear listing of available init commands
      expect(output).to.include('Available init commands')
      expect(output).to.include('pai init bmad')
      // Output structure makes it clear where new commands would be listed
      expect(output).to.include('Initialize BMAD project management system')
    })
  })
})
