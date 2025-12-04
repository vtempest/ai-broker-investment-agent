from typing import Dict, Any, Union
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_groq import ChatGroq
from . import config

class ModelFactory:
    @staticmethod
    def create_model(model_config: Union[Dict[str, Any], str]) -> Union[ChatOpenAI, ChatAnthropic, ChatGroq]:
        """
        Create LLM model based on provider configuration.

        Args:
            model_config: Either a dict with provider/model/temperature or a string model name (legacy)

        Returns:
            Configured LLM instance

        Supported Providers:
            - openai: GPT-4, GPT-4o, GPT-3.5-turbo, etc.
            - anthropic: Claude 3 Opus, Sonnet, Haiku
            - groq: Llama 3.1, Llama 3.2, Mixtral, Gemma (ultra-fast inference)
        """
        # Handle legacy string model names
        if isinstance(model_config, str):
            return ChatOpenAI(
                model=model_config,
                temperature=0.7
            )

        # Handle new dict-based configuration
        provider = model_config.get('provider')
        model_name = model_config.get('model')
        temperature = model_config.get('temperature', 0.7)

        if not model_name:
            raise ValueError("Model name is required in configuration")

        if provider == 'anthropic':
            return ChatAnthropic(
                model_name=model_name,
                temperature=temperature,
                timeout=None,
                stop=None
            )
        elif provider == 'openai':
            return ChatOpenAI(
                model=model_name,
                temperature=temperature
            )
        elif provider == 'groq':
            # Groq provides ultra-fast inference for open-source models
            # Supported models: llama-3.1-405b, llama-3.1-70b, llama-3.1-8b, mixtral-8x7b, gemma-7b
            return ChatGroq(
                model_name=model_name,
                temperature=temperature,
                # Groq is known for extremely fast inference speeds (up to 750 tokens/sec)
                # Perfect for real-time trading decisions
            )
        else:
            raise ValueError(
                f"Unsupported provider: {provider}. "
                f"Supported providers: openai, anthropic, groq"
            )
    
    @staticmethod
    def get_portfolio_manager_model():
        """Get configured portfolio manager model."""
        return ModelFactory.create_model(config.model_portfolio_manager)
    
    @staticmethod
    def get_nlp_features_model():
        """Get configured NLP features model."""
        return ModelFactory.create_model(config.model_nlp_features)
    
    @staticmethod
    def get_assess_significance_model():
        """Get configured assess significance model."""
        return ModelFactory.create_model(config.model_assess_significance)
    
    @staticmethod
    def get_enhanced_summary_model():
        """Get configured enhanced summary model."""
        return ModelFactory.create_model(config.model_enhanced_summary) 