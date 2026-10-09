/**
 * Guards the Vercel function's module graph (M5). @vercel/node compiles each file to ESM without
 * bundling, and Node's ESM loader on the nodejs22.x runtime requires:
 * - an explicit file extension on every relative import ('./calc.js', resolving to calc.ts), and
 * - an import attribute on JSON imports (`with { type: 'json' }`).
 * Without them `vercel build` still succeeds, but the function fails at load time with
 * ERR_MODULE_NOT_FOUND / ERR_IMPORT_ATTRIBUTE_MISSING – every POST /api/lead would return 500.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')

/** Static imports/exports with a module specifier, including side-effect imports and `import type`. */
const SPECIFIER_RE = /(?:^|\n)\s*(?:import|export)\s(?:[^'";]*?\sfrom\s*)?(['"])([^'"]+)\1([^;\n]*)/g

export interface ImportProblem {
  file: string
  specifier: string
  problem: string
}

/** Problems in one file's source (exported for the self-test below). */
export function checkSource(file: string, source: string): { problems: ImportProblem[]; relativeTargets: string[] } {
  const problems: ImportProblem[] = []
  const relativeTargets: string[] = []
  for (const m of source.matchAll(SPECIFIER_RE)) {
    const specifier = m[2]
    const rest = m[3]
    if (!specifier.startsWith('.')) continue // packages (e.g. 'resend') resolve via node_modules
    if (specifier.endsWith('.json')) {
      if (!/^\s*with\s*\{\s*type\s*:\s*['"]json['"]\s*\}/.test(rest)) {
        problems.push({ file, specifier, problem: "JSON import without `with { type: 'json' }`" })
      }
      continue
    }
    if (!specifier.endsWith('.js')) {
      problems.push({ file, specifier, problem: 'relative import without an explicit .js extension' })
      continue
    }
    relativeTargets.push(specifier)
  }
  return { problems, relativeTargets }
}

/** Walks the graph from api/lead.ts; '.js' specifiers resolve to the .ts source next to them. */
function walk(entry: string) {
  const seen = new Set<string>()
  const problems: ImportProblem[] = []
  const queue = [entry]
  while (queue.length) {
    const file = queue.pop()!
    if (seen.has(file)) continue
    seen.add(file)
    const rel = relative(root, file).replace(/\\/g, '/')
    const result = checkSource(rel, readFileSync(file, 'utf8'))
    problems.push(...result.problems)
    for (const spec of result.relativeTargets) {
      const target = join(dirname(file), spec.replace(/\.js$/, '.ts'))
      if (!existsSync(target)) problems.push({ file: rel, specifier: spec, problem: 'does not resolve to a .ts file' })
      else queue.push(target)
    }
  }
  return { files: [...seen].map((f) => relative(root, f).replace(/\\/g, '/')).sort(), problems }
}

describe('Vercel function module graph (api/lead.ts)', () => {
  const graph = walk(join(root, 'api/lead.ts'))

  it('reaches the whole server + shared domain code', () => {
    expect(graph.files).toEqual(
      expect.arrayContaining([
        'api/lead.ts',
        'server/lead/endpoint.ts',
        'server/lead/handler.ts',
        'server/email/resendProvider.ts',
        'src/domain/etfData.ts',
        'src/email/leadEmail.ts',
        'src/lead/validation.ts',
      ]),
    )
    expect(graph.files.length).toBeGreaterThanOrEqual(15)
  })

  it('every relative import has an explicit .js extension and every JSON import has the attribute', () => {
    expect(graph.problems).toEqual([])
  })
})

describe('import checker (self-test)', () => {
  it('flags the patterns that break the Node ESM loader', () => {
    const src = [
      "import { a } from './calc'",
      "import type { B } from '../config'",
      "export { c } from './format'",
      "import './side-effect'",
      "import data from '../../research/etf-data.json'",
    ].join('\n')
    expect(checkSource('x.ts', src).problems.map((p) => p.specifier)).toEqual([
      './calc',
      '../config',
      './format',
      './side-effect',
      '../../research/etf-data.json',
    ])
  })

  it('accepts the fixed forms and package imports', () => {
    const src = [
      "import { a } from './calc.js'",
      "import type { B } from '../config.js'",
      "import data from '../../research/etf-data.json' with { type: 'json' }",
      "import { Resend } from 'resend'",
    ].join('\n')
    const r = checkSource('x.ts', src)
    expect(r.problems).toEqual([])
    expect(r.relativeTargets).toEqual(['./calc.js', '../config.js'])
  })
})
