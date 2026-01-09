#!/bin/bash
export PATH="$HOME/.local/bin:$PATH"
export ANTHROPIC_API_KEY="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"
cd /mnt/c/Users/Lukas/Desktop/code/new_etf_aa/ETFAAA/agents
/usr/bin/npx tsx src/index.ts --source=korean-etf
