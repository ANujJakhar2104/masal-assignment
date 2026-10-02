// Seeds sample leads by posting them through the running app's API, so every analysis
// and score comes from the real model rather than from fixtures.
//
//   npm run seed                                  # against http://localhost:3000
//   npm run seed -- https://your-app.vercel.app   # against a deployment

import { SAMPLE_LEADS } from "../src/lib/samples.ts";

const baseUrl = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

for (const lead of SAMPLE_LEADS) {
  const response = await fetch(`${baseUrl}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  const body = await response.json().catch(() => ({}));
  console.log(response.ok ? `added   ${lead.name} (${body.id})` : `failed  ${lead.name}: ${body.error}`);
}
