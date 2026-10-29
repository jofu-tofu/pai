import {NextResponse} from 'next/server';
// Chat is deliberately delegated to the current host. This standalone template
// has no implicit account, provider, shell command, or credential discovery.
export async function POST() {
 return NextResponse.json({error:'Use your host assistant to discuss the TELOS files. This standalone dashboard only reads and edits local notes.'},{status:501});
}
