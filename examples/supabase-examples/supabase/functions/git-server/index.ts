import { Buffer } from "buffer";
window.Buffer = Buffer;

import "./isomofic-git-proxy.ts"
import "pg"

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { handler } from "./server.ts"
Deno.serve(handler)
