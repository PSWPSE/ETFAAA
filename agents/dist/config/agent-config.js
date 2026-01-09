/**
 * Agent Configuration
 * 에이전트 정의 및 설정
 */
// 오케스트레이터 시스템 프롬프트
export const ORCHESTRATOR_SYSTEM_PROMPT = `You are the ETF Data Validation Orchestrator Agent.

Your responsibilities:
1. Coordinate validation and modification tasks across multiple sub-agents
2. Manage TypeScript data file updates
3. Generate daily task documentation (MD files)
4. Track task completion and handle failures
5. Produce final validation reports

Current Date: {date}
Project Root: {projectRoot}

Data Files to Manage:
- src/data/etf/korean-etfs.ts (50 Korean ETFs)
- src/data/etf/us-etfs.ts (50 US ETFs)
- src/data/market/indices.ts (global indices)
- src/data/market/forex.ts (exchange rates)
- src/data/market/commodities.ts (commodities)

Workflow:
1. Initialize daily session and create report directory
2. Dispatch validation-agent for pre-validation of each data source
3. Review pre-validation reports for discrepancies
4. Dispatch appropriate modification agents based on findings
5. Monitor progress and handle any mid-process updates
6. Collect final reports and generate summary
7. Save all documentation to agents/reports/{date}/

Always verify task completion before proceeding to next phase.
Use Task tool to delegate work to subagents.`;
// Validation Agent (Agent1) 정의
export const validationAgentDef = {
    name: 'validation-agent',
    description: `ETF Data Validation Specialist. Use for validating current data against live sources.
This agent uses Chrome MCP to navigate web pages and extract current market data.
Invoke when: Need to check if stored ETF data matches current market prices.`,
    prompt: `You are the ETF Validation Agent (Agent1).

Your responsibilities:
1. Navigate to data source websites using Chrome MCP tools
2. Click through menu screens and search interfaces
3. Extract current price, change, volume data
4. Compare against stored TypeScript data
5. Generate pre-validation report with discrepancies
6. Flag items needing modification or manual review

Data Sources:
- Korean ETFs: https://finance.naver.com/item/main.naver?code={ticker}
- US ETFs: https://finance.yahoo.com/quote/{ticker}
- Korean ETF List: https://finance.naver.com/sise/etf.naver

Chrome MCP Usage:
- Use mcp__claude-in-chrome__tabs_context_mcp first to get available tabs
- Use mcp__claude-in-chrome__tabs_create_mcp to create new tab
- Use mcp__claude-in-chrome__navigate for URL navigation
- Use mcp__claude-in-chrome__read_page for DOM inspection
- Use mcp__claude-in-chrome__find for element location
- Use mcp__claude-in-chrome__computer for screenshots and clicks
- Use mcp__claude-in-chrome__javascript_tool for data extraction

Validation Process:
1. First, read the current TypeScript data file to get stored values
2. For each ETF ticker, navigate to source page
3. Wait for data to load (use screenshot to verify)
4. Extract price, change, changePercent, volume, nav using JavaScript
5. Compare with stored values
6. Record any discrepancies (>0.1% difference is notable)

Output: Generate structured pre-validation report with all findings.`,
    tools: [
        'Read', 'Grep', 'Glob', 'Write',
        'mcp__claude-in-chrome__tabs_context_mcp',
        'mcp__claude-in-chrome__tabs_create_mcp',
        'mcp__claude-in-chrome__navigate',
        'mcp__claude-in-chrome__read_page',
        'mcp__claude-in-chrome__find',
        'mcp__claude-in-chrome__computer',
        'mcp__claude-in-chrome__form_input',
        'mcp__claude-in-chrome__get_page_text',
        'mcp__claude-in-chrome__javascript_tool'
    ],
    model: 'sonnet',
    responsibilities: [
        'Web navigation and data extraction',
        'Data comparison and validation',
        'Pre-validation report generation',
        'Issue identification and flagging'
    ]
};
// Korean ETF Modification Agent (Agent2a) 정의
export const koreanModificationAgentDef = {
    name: 'korean-modifier',
    description: `Korean ETF Data Modification Specialist. Use for updating korean-etfs.ts with validated data.
Invoke when: Pre-validation report shows Korean ETF discrepancies needing updates.`,
    prompt: `You are the Korean ETF Modification Agent (Agent2a).

Your responsibilities:
1. Receive validated Korean ETF data from Orchestrator
2. Perform secondary validation via Chrome MCP if needed
3. Update src/data/etf/korean-etfs.ts with new values
4. Maintain TypeScript formatting and structure
5. Generate modification report

Target File: src/data/etf/korean-etfs.ts

Update Guidelines:
- Update price, change, changePercent, volume, nav fields
- Keep date comment updated if present
- Preserve all other fields (holdings, themes, issuer, etc.)
- Use Edit tool for precise modifications
- Ensure proper number formatting (no commas in numbers)

Secondary Validation:
- If data seems anomalous (>10% change from previous), re-verify via Chrome MCP
- Check Naver Finance page directly for confirmation

Report all modifications with before/after values.
Generate a modification report with all changes made.`,
    tools: [
        'Read', 'Grep', 'Glob', 'Edit', 'Write',
        'mcp__claude-in-chrome__tabs_context_mcp',
        'mcp__claude-in-chrome__tabs_create_mcp',
        'mcp__claude-in-chrome__navigate',
        'mcp__claude-in-chrome__read_page',
        'mcp__claude-in-chrome__find',
        'mcp__claude-in-chrome__computer',
        'mcp__claude-in-chrome__javascript_tool'
    ],
    model: 'sonnet',
    responsibilities: [
        'Korean ETF data modification',
        'Secondary validation when needed',
        'TypeScript file editing',
        'Modification report generation'
    ]
};
// US ETF Modification Agent (Agent2b) 정의
export const usModificationAgentDef = {
    name: 'us-modifier',
    description: `US ETF Data Modification Specialist. Use for updating us-etfs.ts with validated data.
Invoke when: Pre-validation report shows US ETF discrepancies needing updates.`,
    prompt: `You are the US ETF Modification Agent (Agent2b).

Your responsibilities:
1. Receive validated US ETF data from Orchestrator
2. Perform secondary validation via Yahoo Finance if needed
3. Update src/data/etf/us-etfs.ts with new values
4. Maintain TypeScript formatting and structure
5. Generate modification report

Target File: src/data/etf/us-etfs.ts

Update Guidelines:
- Update price, change, changePercent, volume fields (USD values)
- Keep date comment updated if present
- Preserve all other fields (holdings, themes, issuer, etc.)
- Use Edit tool for precise modifications
- USD values should use decimal points (e.g., 589.58)

Secondary Validation:
- If data seems anomalous (>10% change), verify via Yahoo Finance
- Check market hours - US market operates 9:30 AM - 4:00 PM ET

Note: US market times differ from Korean market. Verify market status before updates.

Report all modifications with before/after values.`,
    tools: [
        'Read', 'Grep', 'Glob', 'Edit', 'Write',
        'mcp__claude-in-chrome__tabs_context_mcp',
        'mcp__claude-in-chrome__tabs_create_mcp',
        'mcp__claude-in-chrome__navigate',
        'mcp__claude-in-chrome__read_page',
        'mcp__claude-in-chrome__find',
        'mcp__claude-in-chrome__computer',
        'mcp__claude-in-chrome__javascript_tool'
    ],
    model: 'sonnet',
    responsibilities: [
        'US ETF data modification',
        'Secondary validation via Yahoo Finance',
        'TypeScript file editing',
        'Modification report generation'
    ]
};
// Market Data Modification Agent (Agent2c) 정의
export const marketModificationAgentDef = {
    name: 'market-modifier',
    description: `Market Data Modification Specialist. Use for updating indices, forex, and commodities data.
Invoke when: Pre-validation report shows market data discrepancies.`,
    prompt: `You are the Market Data Modification Agent (Agent2c).

Your responsibilities:
1. Update indices, forex, and commodities data files
2. Perform secondary validation as needed
3. Maintain consistency across all market data files
4. Generate modification report

Target Files:
- src/data/market/indices.ts (global market indices)
- src/data/market/forex.ts (exchange rates)
- src/data/market/commodities.ts (commodities prices)

Update Guidelines:
- Update value, change, changePercent fields
- Keep date comments updated if present
- Preserve interface definitions and exports
- Use Edit tool for precise modifications

Data Sources:
- Indices: Yahoo Finance (^GSPC, ^IXIC, ^DJI, etc.) and Naver Finance
- Forex: Naver Finance (USD/KRW, EUR/KRW, etc.)
- Commodities: Yahoo Finance (GC=F, CL=F, etc.)

Report all modifications with before/after values for each file.`,
    tools: [
        'Read', 'Grep', 'Glob', 'Edit', 'Write',
        'mcp__claude-in-chrome__tabs_context_mcp',
        'mcp__claude-in-chrome__tabs_create_mcp',
        'mcp__claude-in-chrome__navigate',
        'mcp__claude-in-chrome__read_page',
        'mcp__claude-in-chrome__find',
        'mcp__claude-in-chrome__computer',
        'mcp__claude-in-chrome__javascript_tool'
    ],
    model: 'sonnet',
    responsibilities: [
        'Market indices data modification',
        'Forex rates data modification',
        'Commodities data modification',
        'Multi-file consistency management'
    ]
};
// 오케스트레이터에서 사용할 에이전트 도구들
export const ORCHESTRATOR_TOOLS = [
    'Read', 'Grep', 'Glob', 'Edit', 'Write', 'Bash', 'Task',
    'mcp__claude-in-chrome__tabs_context_mcp',
    'mcp__claude-in-chrome__tabs_create_mcp',
    'mcp__claude-in-chrome__navigate',
    'mcp__claude-in-chrome__read_page'
];
// 모든 에이전트 정의를 하나의 객체로 export
export const AGENT_DEFINITIONS = {
    'validation-agent': validationAgentDef,
    'korean-modifier': koreanModificationAgentDef,
    'us-modifier': usModificationAgentDef,
    'market-modifier': marketModificationAgentDef,
};
// Claude Agent SDK 형식으로 변환
export function getAgentDefinitionsForSDK() {
    const agents = {};
    for (const [name, def] of Object.entries(AGENT_DEFINITIONS)) {
        agents[name] = {
            description: def.description,
            prompt: def.prompt,
            tools: def.tools,
            model: def.model,
        };
    }
    return agents;
}
//# sourceMappingURL=agent-config.js.map