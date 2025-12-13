// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"API_DATA_SUMMARY.md": () => import("../content/docs/API_DATA_SUMMARY.md?collection=docs"), "DASHBOARD_API_README.md": () => import("../content/docs/DASHBOARD_API_README.md?collection=docs"), "Feature Engineering.md": () => import("../content/docs/Feature Engineering.md?collection=docs"), "GROQ_AGENT_API_GUIDE.md": () => import("../content/docs/GROQ_AGENT_API_GUIDE.md?collection=docs"), "GROQ_DEBATE_SETUP.md": () => import("../content/docs/GROQ_DEBATE_SETUP.md?collection=docs"), "GROQ_LANGCHAIN_INTEGRATION.md": () => import("../content/docs/GROQ_LANGCHAIN_INTEGRATION.md?collection=docs"), "Prophet Params.md": () => import("../content/docs/Prophet Params.md?collection=docs"), "README.md": () => import("../content/docs/README.md?collection=docs"), "STOCKS_API.md": () => import("../content/docs/STOCKS_API.md?collection=docs"), "TURSO_SETUP.md": () => import("../content/docs/TURSO_SETUP.md?collection=docs"), "XGBoost Params.md": () => import("../content/docs/XGBoost Params.md?collection=docs"), "idnicators.md": () => import("../content/docs/idnicators.md?collection=docs"), "investment-dictionary.md": () => import("../content/docs/investment-dictionary.md?collection=docs"), "stocks-pe.md": () => import("../content/docs/stocks-pe.md?collection=docs"), "technical_indicators_guide.md": () => import("../content/docs/technical_indicators_guide.md?collection=docs"), "trading_indicators_strategies.md": () => import("../content/docs/trading_indicators_strategies.md?collection=docs"), }),
};
export default browserCollections;