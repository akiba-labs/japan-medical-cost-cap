import { openapiDoc, preflight, staticJson } from "@/lib/agent-api";
import { API_INFO, ENDPOINTS, PUBLIC_URL } from "@/lib/api";

export function GET() {
  const base = openapiDoc(API_INFO, PUBLIC_URL, Object.values(ENDPOINTS)) as {
    paths: Record<string, unknown>;
    [k: string]: unknown;
  };
  base.paths["/api/rules"] = {
    get: {
      operationId: "japanHighCostMedicalRules",
      summary: "Japan 高額療養費 rules: cap formula and full cap tables for all three schedules (to 2026-07, 2026-08…2027-07, 2027-08+), 14 income bands with income ranges, 多数回 rate, Aug–Jul annual caps, 70+ outpatient caps, claim deadline, sources",
      description: "Returns the rules the checker applies, with the legal periods, sources and disclaimer. No inputs.",
      responses: {
        "200": {
          description: "Rules JSON with rulesAsOf and sources.",
          content: { "application/json": { schema: { type: "object", additionalProperties: true } } },
        },
      },
    },
  };
  return staticJson(base);
}
export const OPTIONS = preflight;
