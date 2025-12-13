// @ts-nocheck
import { default as __fd_glob_16 } from "../content/docs/meta.json?collection=docs"
import * as __fd_glob_15 from "../content/docs/trading_indicators_strategies.md?collection=docs"
import * as __fd_glob_14 from "../content/docs/technical_indicators_guide.md?collection=docs"
import * as __fd_glob_13 from "../content/docs/stocks-pe.md?collection=docs"
import * as __fd_glob_12 from "../content/docs/investment-dictionary.md?collection=docs"
import * as __fd_glob_11 from "../content/docs/idnicators.md?collection=docs"
import * as __fd_glob_10 from "../content/docs/XGBoost Params.md?collection=docs"
import * as __fd_glob_9 from "../content/docs/TURSO_SETUP.md?collection=docs"
import * as __fd_glob_8 from "../content/docs/STOCKS_API.md?collection=docs"
import * as __fd_glob_7 from "../content/docs/README.md?collection=docs"
import * as __fd_glob_6 from "../content/docs/Prophet Params.md?collection=docs"
import * as __fd_glob_5 from "../content/docs/GROQ_LANGCHAIN_INTEGRATION.md?collection=docs"
import * as __fd_glob_4 from "../content/docs/GROQ_DEBATE_SETUP.md?collection=docs"
import * as __fd_glob_3 from "../content/docs/GROQ_AGENT_API_GUIDE.md?collection=docs"
import * as __fd_glob_2 from "../content/docs/Feature Engineering.md?collection=docs"
import * as __fd_glob_1 from "../content/docs/DASHBOARD_API_README.md?collection=docs"
import * as __fd_glob_0 from "../content/docs/API_DATA_SUMMARY.md?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_16, }, {"API_DATA_SUMMARY.md": __fd_glob_0, "DASHBOARD_API_README.md": __fd_glob_1, "Feature Engineering.md": __fd_glob_2, "GROQ_AGENT_API_GUIDE.md": __fd_glob_3, "GROQ_DEBATE_SETUP.md": __fd_glob_4, "GROQ_LANGCHAIN_INTEGRATION.md": __fd_glob_5, "Prophet Params.md": __fd_glob_6, "README.md": __fd_glob_7, "STOCKS_API.md": __fd_glob_8, "TURSO_SETUP.md": __fd_glob_9, "XGBoost Params.md": __fd_glob_10, "idnicators.md": __fd_glob_11, "investment-dictionary.md": __fd_glob_12, "stocks-pe.md": __fd_glob_13, "technical_indicators_guide.md": __fd_glob_14, "trading_indicators_strategies.md": __fd_glob_15, });