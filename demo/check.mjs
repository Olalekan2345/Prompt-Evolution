import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MemWal } from "@mysten-incubation/memwal";

const creds = JSON.parse(
  fs.readFileSync(path.join(os.homedir(), ".memwal", "credentials.json"), "utf8"),
);

const namespaces = [
  "prompt-evolution::decision::prompt-choice",
  "prompt-evolution::decision::fiction-path",
  "prompt-evolution::decision::repo-separation",
  "prompt-evolution::decision::pinned-namespace",
  "prompt-evolution::rule::namespace-hygiene",
  "prompt-evolution::decision::account-identity",
  "prompt-evolution::decision::write-path",
  "prompt-evolution::meta",
];

console.log("account:", creds.accountId);
console.log("RECALL-BEFORE-WRITE CHECK — read only\n");

let total = 0;
for (const ns of namespaces) {
  const mw = MemWal.create({
    key: creds.delegatePrivateKey,
    accountId: creds.accountId,
    serverUrl: creds.relayerUrl,
    namespace: ns,
  });
  try {
    const r = await mw.recall({ query: "canon record", topK: 20, maxDistance: 0.99 });
    const n = r.results?.length ?? 0;
    total += n;
    console.log(`${String(n).padStart(2)}  ${ns}`);
    for (const m of r.results ?? []) {
      console.log(`      ${m.blob_id}  ${String(m.text ?? "").slice(0, 62)}`);
    }
  } catch (e) {
    console.log(` ?  ${ns}  — ${e.message}`);
  }
}
console.log(`\nTOTAL RECORDS FOUND: ${total}`);
