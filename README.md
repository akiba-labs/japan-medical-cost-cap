# Japan High-Cost Medical Expense Check (高額療養費)

Free calculator for Japan's high-cost medical expense benefit: your monthly cap (自己負担限度額), what you really pay, the refund, the 4th-month 多数回 rate, the new Aug–Jul yearly cap (年間上限) from August 2026, the same bill under the August 2027 12-band schedule, and the 2-year claim deadline. Under 70 and 70+, employee insurance and NHI. English + Japanese.

Live: https://japan-medical-cost-cap.vercel.app

- API: `GET /api/check?month=2026-11&totalCost=1000000&standardMonthlyRemuneration=300000` (keyless, CORS open, POST JSON too), yearly tracker `months=2026-08:300000,...`, `/api/rules`, `/openapi.json`, `/llms.txt`, `/.well-known/ai-plugin.json`
- MCP: `japan_high_cost_medical_check` on https://free-agent-tools.vercel.app/mcp

Sources: MHLW 高額療養費 review (001726232.pdf), 協会けんぽ, Setagaya / Machida / Fukuoka city NHI pages. Rules as of 2026-11-04.

**Disclaimer:** educational estimate, not medical, financial or legal advice; not affiliated with MHLW, 協会けんぽ, any health insurance society, city office or hospital. Your insurer decides the actual benefit.
