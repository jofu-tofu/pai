import { spawn } from 'node:child_process';
export type InferenceLevel = 'fast' | 'standard' | 'smart';
export async function inference(input: {systemPrompt: string; userPrompt: string; level?: InferenceLevel; timeout?: number}) {
 const command = process.env.EVAL_COMMAND;
 if (!command) return {success:false,output:'',error:'Set EVAL_COMMAND to an executable accepting JSON on stdin and returning plain text on stdout.'};
 const args = JSON.parse(process.env.EVAL_ARGS || '[]');
 if (!Array.isArray(args) || args.some(a=>typeof a!=='string')) throw Error('EVAL_ARGS must be a JSON string array');
 return await new Promise<{success:boolean;output:string;error?:string}>(resolve=>{
  const child=spawn(command,args,{shell:false,stdio:['pipe','pipe','pipe'],windowsHide:true});
  let out='',err='',finished=false;
  const finish=(r:any)=>{if(!finished){finished=true;clearTimeout(timer);resolve(r)}};
  const timer=setTimeout(()=>{child.kill();finish({success:false,output:'',error:'Evaluator timeout'})},input.timeout||30000);
  child.stdout.on('data',b=>out+=b);child.stderr.on('data',b=>err+=b);
  child.on('error',e=>finish({success:false,output:'',error:e.message}));
  child.stdin.on('error',()=>{});
  child.on('close',code=>finish({success:code===0&&!!out.trim(),output:out.trim(),error:code===0?undefined:err||'Evaluator failed'}));
  child.stdin.end(JSON.stringify(input));
 });
}
