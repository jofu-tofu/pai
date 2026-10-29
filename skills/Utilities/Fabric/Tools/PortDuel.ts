#!/usr/bin/env bun
import {readFileSync} from 'node:fs';
if (process.argv.includes('--help') || process.argv.length < 3) {
 console.log('Usage: bun Tools/PortDuel.ts verdicts.json\nInput: [{id,winner:"port"|"upstream"|"tie"}]. Generate matched outputs and judge both orders before recording verdicts.');
 process.exit(process.argv.includes('--help')?0:2);
}
const rows=JSON.parse(readFileSync(process.argv[2],'utf8'));
if(!Array.isArray(rows)||rows.length<3||rows.some(r=>!r.id||!['port','upstream','tie'].includes(r.winner))||new Set(rows.map(r=>r.id)).size!==rows.length)throw Error('Need at least three distinct valid verdicts');
const wins=rows.filter(r=>r.winner==='port').length,losses=rows.filter(r=>r.winner==='upstream').length;
console.log(JSON.stringify({cases:rows.length,wins,losses,ties:rows.length-wins-losses,pass:wins>rows.length/2,provenance:'supplied verdicts; this tool does not generate or independently validate judgments'}));
process.exit(wins>rows.length/2?0:1);
