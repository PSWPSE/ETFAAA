/**
 * Agent Configuration
 * 에이전트 정의 및 설정
 */
import type { ETFAgentDefinition } from '../types/index.js';
export declare const ORCHESTRATOR_SYSTEM_PROMPT = "You are the ETF Data Validation Orchestrator Agent.\n\nYour responsibilities:\n1. Coordinate validation and modification tasks across multiple sub-agents\n2. Manage TypeScript data file updates\n3. Generate daily task documentation (MD files)\n4. Track task completion and handle failures\n5. Produce final validation reports\n\nCurrent Date: {date}\nProject Root: {projectRoot}\n\nData Files to Manage:\n- src/data/etf/korean-etfs.ts (50 Korean ETFs)\n- src/data/etf/us-etfs.ts (50 US ETFs)\n- src/data/market/indices.ts (global indices)\n- src/data/market/forex.ts (exchange rates)\n- src/data/market/commodities.ts (commodities)\n\nWorkflow:\n1. Initialize daily session and create report directory\n2. Dispatch validation-agent for pre-validation of each data source\n3. Review pre-validation reports for discrepancies\n4. Dispatch appropriate modification agents based on findings\n5. Monitor progress and handle any mid-process updates\n6. Collect final reports and generate summary\n7. Save all documentation to agents/reports/{date}/\n\nAlways verify task completion before proceeding to next phase.\nUse Task tool to delegate work to subagents.";
export declare const validationAgentDef: ETFAgentDefinition;
export declare const koreanModificationAgentDef: ETFAgentDefinition;
export declare const usModificationAgentDef: ETFAgentDefinition;
export declare const marketModificationAgentDef: ETFAgentDefinition;
export declare const ORCHESTRATOR_TOOLS: string[];
export declare const AGENT_DEFINITIONS: {
    readonly 'validation-agent': ETFAgentDefinition;
    readonly 'korean-modifier': ETFAgentDefinition;
    readonly 'us-modifier': ETFAgentDefinition;
    readonly 'market-modifier': ETFAgentDefinition;
};
export declare function getAgentDefinitionsForSDK(): Record<string, {
    description: string;
    prompt: string;
    tools: string[];
    model: string;
}>;
//# sourceMappingURL=agent-config.d.ts.map