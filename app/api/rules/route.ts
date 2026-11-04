import { preflight, staticJson } from "@/lib/agent-api";
import { PUBLIC_URL } from "@/lib/api";
import { AGE_GROUPS, BANDS, DISCLAIMER, RULES, RULES_AS_OF, SETTINGS, SOURCES } from "@/lib/cap";

export function GET() {
  return staticJson({ ...RULES, ageGroups: AGE_GROUPS, bandIds: BANDS, settings: SETTINGS, rulesAsOf: RULES_AS_OF, sources: SOURCES, disclaimer: DISCLAIMER, docs: `${PUBLIC_URL}/openapi.json`, checker: `${PUBLIC_URL}/api/check` });
}
export const OPTIONS = preflight;
