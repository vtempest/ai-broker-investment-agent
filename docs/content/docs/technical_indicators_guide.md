---
title: Technical Indicators Guide
---

# Technical Indicators Reference Guide

## Moving Averages

**SMA (Simple Moving Average)**
- **What**: Averages the last N price points equally to smooth price data.
- **Why it matters**: Identifies trend direction and reduces noise from price fluctuations.

**EMA (Exponential Moving Average)**
- **What**: Weighted average that gives more importance to recent prices.
- **Why it matters**: Responds faster to price changes than SMA, better for short-term trading.

**WMA (Weighted Moving Average)**
- **What**: Average where recent prices get increasing weights.
- **Why it matters**: Balances responsiveness with smoothing, useful for medium-term trends.

**DEMA (Double Exponential Moving Average)**
- **What**: Combination of two EMAs that reduces lag further.
- **Why it matters**: Tracks price action faster with less delay for quick decisions.

**TEMA (Triple Exponential Moving Average)**
- **What**: Three layers of exponential smoothing for even faster response.
- **Why it matters**: Minimizes lag significantly while maintaining smoothness for aggressive trading.

**TRIMA (Triangular Moving Average)**
- **What**: Average of an average, giving center bars more weight.
- **Why it matters**: Creates a very smooth trend line while emphasizing middle price periods.

**KAMA (Kaufman Adaptive Moving Average)**
- **What**: Adaptive average that speeds up in trending markets and slows in choppy ones.
- **Why it matters**: Automatically adjusts sensitivity based on market conditions.

**MAMA (MESA Adaptive Moving Average)**
- **What**: Uses Hilbert transform to adapt to dominant cycle periods in price data.
- **Why it matters**: Responds dynamically to market rhythm and phase shifts.

**T3 (Triple Exponential Moving Average)**
- **What**: Complex smoothing using multiple exponential layers for ultra-smooth trends.
- **Why it matters**: Removes volatility while maintaining accuracy for long-term trend following.

**VWAP (Volume Weighted Average Price)**
- **What**: Average price weighted by trading volume for that intraday period.
- **Why it matters**: Shows true average cost traders paid, critical for institutional trading strategies.

---

## Momentum Oscillators

**MACD (Moving Average Convergence/Divergence)**
- **What**: Difference between two EMAs shown with a signal line to identify momentum shifts.
- **Why it matters**: Signals trend changes and momentum strength; one of the most widely used indicators.

**MACDEXT (MACD Extended)**
- **What**: MACD variant where you control which type of moving average is used.
- **Why it matters**: Allows customization for specific market conditions and trading styles.

**RSI (Relative Strength Index)**
- **What**: Oscillator measuring speed and magnitude of price changes on a 0-100 scale.
- **Why it matters**: Identifies overbought/oversold conditions; values above 70 or below 30 signal reversals.

**STOCH (Stochastic Oscillator)**
- **What**: Compares closing price to price range over a period, with smoothing applied.
- **Why it matters**: Identifies momentum reversals and overbought/oversold levels with dual lines.

**STOCHF (Stochastic Fast)**
- **What**: Raw stochastic without smoothing for faster responsiveness.
- **Why it matters**: Reacts quicker to price changes; useful for short-term traders.

**STOCHRSI (Stochastic RSI)**
- **What**: Applies stochastic formula to RSI values instead of prices.
- **Why it matters**: Amplifies RSI signals and identifies extremes more clearly.

**MOM (Momentum)**
- **What**: Simple difference between current price and price N periods ago.
- **Why it matters**: Measures how fast price is changing; positive/negative momentum indicates direction.

**ROC (Rate of Change)**
- **What**: Percentage change in price over a specified period.
- **Why it matters**: Normalized momentum measure that shows acceleration or deceleration intensity.

**ROCR (Rate of Change Ratio)**
- **What**: Ratio form of rate of change rather than percentage.
- **Why it matters**: Alternative calculation method useful for different analytical approaches.

**APO (Absolute Price Oscillator)**
- **What**: Difference between two EMAs shown without a signal line.
- **Why it matters**: Simpler MACD alternative for identifying momentum divergence.

**PPO (Percentage Price Oscillator)**
- **What**: APO expressed as a percentage of the 12-period EMA.
- **Why it matters**: Normalized momentum measure comparable across different price levels.

**TRIX (Triple Exponential Moving Average Oscillator)**
- **What**: 1-day rate of change of a triple-smoothed EMA.
- **Why it matters**: Extremely smooth momentum indicator that filters out small price moves.

---

## Trend & Directional Indicators

**ADX (Average Directional Movement Index)**
- **What**: Measures trend strength on a 0-50 scale regardless of direction.
- **Why it matters**: Values above 25 indicate strong trends; below 20 suggest ranging markets.

**ADXR (Average Directional Movement Index Rating)**
- **What**: Smoothed version of ADX using an average of current and past ADX values.
- **Why it matters**: Less reactive than ADX; better for identifying sustained trend strength.

**PLUS_DI (Plus Directional Indicator)**
- **What**: Measures uptrend strength by comparing higher highs to lower lows.
- **Why it matters**: Shows when bulls are in control; rising PLUS_DI signals strengthening uptrend.

**MINUS_DI (Minus Directional Indicator)**
- **What**: Measures downtrend strength by comparing lower lows to higher highs.
- **Why it matters**: Shows when bears are in control; rising MINUS_DI signals strengthening downtrend.

**PLUS_DM (Plus Directional Movement)**
- **What**: Raw upward price movement filtered for true direction.
- **Why it matters**: Component of directional analysis; shows magnitude of upward moves.

**MINUS_DM (Minus Directional Movement)**
- **What**: Raw downward price movement filtered for true direction.
- **Why it matters**: Component of directional analysis; shows magnitude of downward moves.

**DX (Directional Movement Index)**
- **What**: Ratio of directional movement showing which direction is stronger.
- **Why it matters**: Foundation for ADX; compares bull strength to bear strength.

**AROON (Aroon)**
- **What**: Two lines measuring how many periods since highest high and lowest low.
- **Why it matters**: Identifies trend strength and potential reversals when lines cross.

**AROONOSC (Aroon Oscillator)**
- **What**: Difference between Aroon Up and Aroon Down lines.
- **Why it matters**: Single oscillator showing trend direction; positive favors uptrends, negative favors downtrends.

---

## Volatility Indicators

**ATR (Average True Range)**
- **What**: Average of true range (largest of: high-low, high-close, low-close) over N periods.
- **Why it matters**: Measures volatility independent of direction; used for stop losses and position sizing.

**NATR (Normalized Average True Range)**
- **What**: ATR expressed as percentage of current price.
- **Why it matters**: Allows volatility comparison across different price levels and securities.

**BBANDS (Bollinger Bands)**
- **What**: SMA with upper/lower bands set N standard deviations away.
- **Why it matters**: Identifies overbought/oversold when price touches bands; shows volatility contractions.

**SAR (Parabolic SAR)**
- **What**: Trailing stop level that rises/falls with price trend acceleration.
- **Why it matters**: Provides entry/exit signals and trailing stop levels; flips when trend reverses.

**TRANGE (True Range)**
- **What**: Largest of: high-low, high-previous close, low-previous close.
- **Why it matters**: Raw volatility measure accounting for price gaps between sessions.

---

## Volume Indicators

**OBV (On Balance Volume)**
- **What**: Cumulative volume added when price rises, subtracted when price falls.
- **Why it matters**: Identifies volume strength behind price moves; divergences predict reversals.

**MFI (Money Flow Index)**
- **What**: RSI-like oscillator using price and volume instead of just price.
- **Why it matters**: Shows strength of buying/selling pressure; values above 80/below 20 signal extremes.

**AD (Chaikin A/D Line)**
- **What**: Cumulative line combining price range with volume each period.
- **Why it matters**: Measures money flow in/out of security; shows if volume confirms price trends.

**ADOSC (Chaikin A/D Oscillator)**
- **What**: Difference between fast and slow EMAs of the A/D line.
- **Why it matters**: Identifies momentum shifts in money flow; divergences signal potential reversals.

---

## Oscillators & Other Indicators

**CCI (Commodity Channel Index)**
- **What**: Measures deviation of price from its simple moving average.
- **Why it matters**: Identifies cyclical trends; values above ±100 signal strong moves.

**CMO (Chande Momentum Oscillator)**
- **What**: Measures difference between up and down price movements.
- **Why it matters**: Identifies momentum strength with a 0-100 scale; values near extremes signal reversals.

**WILLR (Williams' %R)**
- **What**: Stochastic-like indicator showing closing price position within recent high-low range.
- **Why it matters**: Values near -100 show oversold; near 0 show overbought; simple entry/exit signals.

**ULTOSC (Ultimate Oscillator)**
- **What**: Combines multiple timeframes of buying/selling pressure into one oscillator.
- **Why it matters**: Multi-timeframe analysis in single indicator; reduces false signals.

**BOP (Balance of Power)**
- **What**: Ratio of buying to selling pressure shown as (Close - Open) / (High - Low).
- **Why it matters**: Quick gauge of bull/bear dominance; simple momentum assessment.

**MIDPOINT**
- **What**: Simple average of highest high and lowest low over a period.
- **Why it matters**: Shows center price range; useful for identifying support/resistance levels.

**MIDPRICE**
- **What**: Average of highest close and lowest close (alternative to MIDPOINT).
- **Why it matters**: Variant measure of central price tendency using close-to-close instead.

---

## Hilbert Transform Indicators

**HT_TRENDLINE (Hilbert Transform Instantaneous Trendline)**
- **What**: Uses Hilbert transform mathematics to create a trendline without lag.
- **Why it matters**: Follows price closely while removing noise; advanced mathematical smoothing.

**HT_SINE (Hilbert Transform Sine Wave)**
- **What**: Generates sine wave component showing dominant cycle phase.
- **Why it matters**: Identifies dominant market cycles for timing entries/exits.

**HT_DCPERIOD (Hilbert Transform Dominant Cycle Period)**
- **What**: Calculates the dominant cycle length in current price data.
- **Why it matters**: Shows market periodicity; helps choose indicator periods and timeframes.

**HT_DCPHASE (Hilbert Transform Dominant Cycle Phase)**
- **What**: Shows phase position within the dominant cycle.
- **Why it matters**: Timing indicator for cycle-based trading; identifies where in cycle we are.

**HT_PHASOR (Hilbert Transform Phasor)**
- **What**: Breaks price into in-phase and quadrature components showing cycle mechanics.
- **Why it matters**: Advanced analysis showing multiple cycle components simultaneously.

**HT_TRENDMODE (Hilbert Transform Trend vs Cycle)**
- **What**: Binary indicator showing whether price is in trending or cycling mode.
- **Why it matters**: Tells you if current market is trending (good for trend-following) or ranging (good for oscillators).