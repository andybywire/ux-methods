// Mini-studio fixture matching the real studio's pattern: cross-file
// imports plus a named `schemaTypes` export.

import discipline from './discipline.ts'
import method from './method.ts'

export const schemaTypes = [discipline, method]
