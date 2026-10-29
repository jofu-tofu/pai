import {test,expect,afterAll} from 'bun:test';
import {cpSync,mkdtempSync,readFileSync,writeFileSync,readdirSync,rmSync,existsSync} from 'node:fs';
import {join,resolve,dirname,basename,relative} from 'node:path';
import {tmpdir} from 'node:os';
const repo=resolve(import.meta.dir,'..');
const scratch=mkdtempSync(join(tmpdir(),'standalone-skills-'));
afterAll(()=>rmSync(scratch,{recursive:true,force:true}));
const walk=(d:string):string[]=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()&&!['node_modules','.git','.next'].includes(e.name)?walk(join(d,e.name)):e.isFile()?[join(d,e.name)]:[]);
const files=walk(join(repo,'skills'));
const roots=files.filter(p=>basename(p)==='SKILL.md').map(dirname).sort((a,b)=>b.length-a.length);
const env={...process.env,PAI_DIR:undefined,LIFEOS_USER_DIR:undefined,CLAUDE_CONFIG_DIR:undefined,SKILLS_DIR:undefined};
async function run(args:string[],extra:Record<string,string>={}){
 const p=Bun.spawn([process.execPath,...args],{cwd:scratch,env:{...env,...extra},stdout:'pipe',stderr:'pipe',stdin:'ignore'});
 const [out,err,code]=await Promise.all([new Response(p.stdout).text(),new Response(p.stderr).text(),p.exited]);return {out,err,code};
}
test('each skill carries its own contract and has no escaping or missing relative source imports',()=>{
 const errors:string[]=[];
 for(const root of roots)expect(existsSync(join(root,'PORTABILITY.md'))).toBe(true);
 for(const file of files.filter(p=>/\.(ts|tsx)$/.test(p))){
  const owner=roots.find(d=>file.startsWith(d+'/')||file.startsWith(d+'\\'))!;
  const imports=new Bun.Transpiler({loader:file.endsWith('tsx')?'tsx':'ts'}).scan(readFileSync(file,'utf8')).imports;
  for(const imp of imports.filter(i=>i.path.startsWith('.'))){const dst=resolve(dirname(file),imp.path);
   if(!dst.startsWith(owner+'/')&&!dst.startsWith(owner+'\\'))errors.push(relative(repo,file)+': escaping import '+imp.path);
   if(!['','.ts','.tsx','.js','/index.ts','/index.js'].some(ext=>existsSync(dst+ext)))errors.push(relative(repo,file)+': missing '+imp.path);
  }
 }
 expect(errors).toEqual([]);
});
test('no active skill source requires a global runtime or machine-specific home',()=>{
 const bad=files.filter(p=>/\.(md|ts|tsx|yaml|json|hbs)$/.test(p)).filter(p=>/LIFEOS|\$PAI_DIR|~\/\.claude|C:\\Users\\fujos|\/home\/joshua-fu/.test(readFileSync(p,'utf8')));
 expect(bad.map(p=>relative(repo,p))).toEqual([]);
});
test('Fabric checks run from a copied folder outside the repository',async()=>{
 const dst=join(scratch,'Fabric');cpSync(join(repo,'skills/Utilities/Fabric'),dst,{recursive:true,filter:(src)=>!src.split(/[\\\/]/).some(part=>["node_modules",".next"].includes(part))});
 const r=await run([join(dst,'Tools/CheckPatterns.ts')]);expect(r.code).toBe(0);expect(r.out).toContain('Patterns: 275');
});
test('BeCreative diversity works without global setup',async()=>{
 const dst=join(scratch,'BeCreative');cpSync(join(repo,'skills/Thinking/BeCreative'),dst,{recursive:true,filter:(src)=>!src.split(/[\\\/]/).some(part=>["node_modules",".next"].includes(part))});
 const input=join(scratch,'ideas.json');writeFileSync(input,JSON.stringify(['red apple pie','blue ocean wave','fast sorting algorithm']));
 const r=await run([join(dst,'Tools/Diversity.ts'),'index',input]);expect(r.code).toBe(0);expect(JSON.parse(r.out).diversityIndex).toBe(1);
});
test('Telos standalone writes retain backups, log changes and reject traversal',async()=>{
 const dst=join(scratch,'Telos');cpSync(join(repo,'skills/Telos'),dst,{recursive:true,filter:(src)=>!src.split(/[\\\/]/).some(part=>["node_modules",".next"].includes(part))});
 const notes=join(scratch,'notes');const tool=join(dst,'Tools/UpdateTelos.ts');
 const a=await run([tool,'GOALS.md','- First goal','First'],{TELOS_DIR:notes});expect(a.code).toBe(0);
 const [b,c]=await Promise.all([run([tool,'GOALS.md','- Second goal','Second'],{TELOS_DIR:notes}),run([tool,'GOALS.md','- Third goal','Third'],{TELOS_DIR:notes})]);
 expect(b.code).toBe(0);expect(c.code).toBe(0);
 const text=readFileSync(join(notes,'GOALS.md'),'utf8');expect(text).toContain('First goal');expect(text).toContain('Second goal');expect(text).toContain('Third goal');
 expect(readdirSync(join(notes,'Backups')).length).toBeGreaterThanOrEqual(3);expect(readFileSync(join(notes,'updates.md'),'utf8')).toContain('Third');
 const bad=await run([tool,'../escape.md','bad','bad'],{TELOS_DIR:notes});expect(bad.code).not.toBe(0);expect(existsSync(join(scratch,'escape.md'))).toBe(false);
});
test('Evals reports missing evaluator instead of discovering a global account',async()=>{
 const file=join(repo,'skills/Utilities/Evals/Tools/Inference.ts');
 const {inference}=await import(file);const old=process.env.EVAL_COMMAND;delete process.env.EVAL_COMMAND;
 try{const result=await inference({systemPrompt:'test',userPrompt:'test'});expect(result.success).toBe(false);expect(result.error).toContain('EVAL_COMMAND');}finally{if(old)process.env.EVAL_COMMAND=old;}
});
test('PortDuel reports supplied verdicts honestly and rejects duplicates',async()=>{
 const dst=join(scratch,'verdicts.json');writeFileSync(dst,JSON.stringify([{id:'a',winner:'port'},{id:'b',winner:'port'},{id:'c',winner:'upstream'}]));
 const tool=join(repo,'skills/Utilities/Fabric/Tools/PortDuel.ts');const r=await run([tool,dst]);expect(r.code).toBe(0);expect(JSON.parse(r.out).provenance).toContain('supplied verdicts');
 writeFileSync(dst,JSON.stringify([{id:'a',winner:'port'},{id:'a',winner:'port'},{id:'c',winner:'port'}]));expect((await run([tool,dst])).code).not.toBe(0);
});

test('dashboard guard retains machine-owned regions without any shared runtime', async()=>{
 const {changedAutomatedRegions}=await import(join(repo,'skills/Telos/DashboardTemplate/lib/write-guard.ts'));
 const before='<!-- AUTOMATED:BEGIN current -->\nold\n<!-- AUTOMATED:END current -->';
 expect(changedAutomatedRegions(before,before)).toEqual([]);
 expect(changedAutomatedRegions(before,before.replace('old','new'))).toEqual(['current']);
});

test('all skill entrypoints have valid discoverable frontmatter',()=>{
 for(const root of roots){
  const text=readFileSync(join(root,'SKILL.md'),'utf8');
  const match=text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  expect(match).not.toBeNull();
  const data=Bun.YAML.parse(match![1]) as {name:string;description:string};
  expect(typeof data.name).toBe('string');expect(typeof data.description).toBe('string');expect(data.description.length).toBeGreaterThan(10);
 }
});
