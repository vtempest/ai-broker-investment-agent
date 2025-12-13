---
title: Trading Indicators Strategies
---

# 📊 Complete Technical Indicators & Trading Strategies Guide
## IndicatorTS (cinar/indicatorts) Reference Manual

---

## 📍 Table of Contents

1. [🎯 Trend Indicators](#trend-indicators)
2. [⚡ Momentum Indicators](#momentum-indicators)
3. [📈 Volatility Indicators](#volatility-indicators)
4. [💰 Volume Indicators](#volume-indicators)
5. [🔄 Oscillators & Special Indicators](#oscillators--special-indicators)
6. [📋 Strategy Framework](#strategy-framework)
7. [🤖 Built-in Trading Strategies](#built-in-trading-strategies)
8. [📊 Signal Quick Reference](#signal-quick-reference)

---

## 🎯 Trend Indicators

Trend indicators identify **direction and persistence** of price movement. [file:21]

### 📍 Moving Averages (MA)

#### 🟢 SMA - Simple Moving Average
- **What**: Arithmetic average of last N price points equally weighted
- **Why it matters**: Identifies trend direction, reduces noise
- **Good signal**: Price above rising SMA (uptrend), SMA above price (downtrend)
- **Bad signal**: Price oscillating around SMA without clear direction
- **Formula**: `SMA = Sum(Closing, period) / period`
- **Use case**: Long-term trend confirmation, support/resistance levels

#### 🟡 EMA - Exponential Moving Average
- **What**: Weighted average giving more weight to recent prices
- **Why it matters**: Responds faster to price changes than SMA
- **Good signal**: Price above rising EMA, faster reaction in strong trends
- **Bad signal**: Whipsaws in choppy markets, lag in reversals
- **Formula**: `EMA = (Close × α) + (Previous EMA × (1 - α))`, where α = 2/(period+1)
- **Use case**: Short-term trading, trend confirmation, scalping

#### 🟣 DEMA - Double Exponential Moving Average
- **What**: Combination of two EMAs reducing lag further
- **Why it matters**: Tracks price action faster with less delay for quick decisions
- **Good signal**: Earlier crossovers than SMA/EMA, better trend following
- **Bad signal**: False signals in ranging markets
- **Formula**: `DEMA = (2 × EMA) - EMA(EMA)`
- **Use case**: Active trading, quick reversals, scalping with lower lag

#### 🔵 TEMA - Triple Exponential Moving Average
- **What**: Three layers of exponential smoothing for even faster response
- **Why it matters**: Minimizes lag significantly while maintaining smoothness
- **Good signal**: First to identify trend changes, aggressive trend followers
- **Bad signal**: Prone to whipsaws in choppy conditions
- **Formula**: `TEMA = (3 × EMA1) - (3 × EMA2) + EMA3`
- **Use case**: Aggressive day trading, scalping, fast-moving markets

#### ⚪ TRIMA - Triangular Moving Average
- **What**: Average of an average, giving center bars more weight
- **Why it matters**: Creates very smooth trend line, emphasizes middle prices
- **Good signal**: Smoothest trends with lag, good for breakouts
- **Bad signal**: Late entries and exits due to extreme smoothing
- **Use case**: Longer-term trends, institutional patterns

#### 🟠 RMA - Rolling Moving Average
- **What**: Hybrid of SMA and recursive weighted average
- **Why it matters**: Balances responsiveness with smoothing
- **Good signal**: Smooth trends without excessive lag
- **Bad signal**: Still lags in sharp reversals
- **Use case**: Scalping, intraday trading, medium-term positioning

#### 🟢 VWMA - Volume Weighted Moving Average
- **What**: Average price weighted by trading volume
- **Why it matters**: Institutions often pay attention to VWAP/VWMA as fair price
- **Good signal**: Price above VWMA with rising volume = strong uptrend
- **Bad signal**: Price far above VWMA with declining volume = overextension
- **Formula**: `VWMA = Sum(Price × Volume, period) / Sum(Volume, period)`
- **Use case**: Institutional trading, breakout validation, stop placement

---

### 📊 MACD Family (Momentum Convergence)

#### 🟦 MACD - Moving Average Convergence Divergence
- **What**: Difference between 12-EMA and 26-EMA with 9-EMA signal line
- **Why it matters**: **Most widely used** momentum indicator, shows convergence/divergence
- **Good signal**: MACD > Signal (bullish), crosses above zero (strong buy), positive divergence
- **Bad signal**: MACD < Signal (bearish), crosses below zero (sell), negative divergence
- **Formula**: `MACD = EMA(12) - EMA(26)` | `Signal = EMA(9, MACD)` | `Histogram = MACD - Signal`
- **Use case**: Trend confirmation, momentum strength, entry/exit timing

#### 🟦 APO - Absolute Price Oscillator
- **What**: MACD without signal line (just the difference between two EMAs)
- **Why it matters**: Simpler MACD alternative, better for divergence analysis
- **Good signal**: APO > 0 (uptrend), positive divergence, rising peaks
- **Bad signal**: APO < 0 (downtrend), negative divergence, lower lows
- **Formula**: `APO = Fast EMA(14) - Slow EMA(30)`
- **Use case**: Divergence trading, momentum pure plays

#### 🟪 PPO - Percentage Price Oscillator
- **What**: APO expressed as percentage of 12-period EMA
- **Why it matters**: Normalized momentum, comparable across different price levels
- **Good signal**: PPO > 0% with rising signal, percentage magnitude increases
- **Bad signal**: PPO < 0% with declining signal, shrinking magnitude
- **Use case**: Multi-symbol comparisons, normalized momentum analysis

#### 🔶 TRIX - Triple Exponential Moving Average Oscillator
- **What**: 1-day rate of change of a triple-smoothed EMA
- **Why it matters**: Extremely smooth momentum, filters out small price moves
- **Good signal**: TRIX > 0 (momentum up), crosses above zero from below
- **Bad signal**: TRIX < 0 (momentum down), prolonged negative without reversal
- **Formula**: `TRIX = (EMA3 - Previous EMA3) / Previous EMA3 × 10000`
- **Use case**: Noise filtering, smooth trend identification, lag tolerance

---

### 🎪 Aroon & Directional Movement

#### 🎯 Aroon (Up/Down)
- **What**: Two lines measuring periods since highest high and lowest low
- **Why it matters**: Identifies trend strength and potential reversals
- **Good signal**: Aroon Up near 100, Aroon Down near 0 (strong uptrend), lines crossing
- **Bad signal**: Both near 50 (no clear direction), convergence suggests reversal
- **Formula**: 
  - `Aroon Up = ((Period - Periods Since High) / Period) × 100`
  - `Aroon Down = ((Period - Periods Since Low) / Period) × 100`
- **Use case**: Trend strength assessment, crossover trading, reversal timing

#### 📊 Aroon Oscillator
- **What**: Difference between Aroon Up and Aroon Down
- **Why it matters**: Single oscillator showing trend direction
- **Good signal**: Positive = uptrend favor, negative = downtrend favor
- **Bad signal**: Near zero = ranging/indecision
- **Formula**: `Aroon Oscillator = Aroon Up - Aroon Down`

#### 🔷 ADX - Average Directional Index
- **What**: Measures trend strength 0–50 scale regardless of direction
- **Why it matters**: Values > 25 = strong trends, < 20 = ranging markets
- **Good signal**: ADX rising above 25 with +DI > -DI (strong uptrend)
- **Bad signal**: ADX < 20 (weak/range), conflicting DI signals
- **Formula**: `ADX = SMA(14, DX)` | `DX = (|+DI - -DI| / |+DI + -DI|) × 100`
- **Use case**: Trend qualification, strategy selection (trend vs range)

#### 🔶 +DI / -DI (Plus/Minus Directional Indicator)
- **What**: Measures uptrend/downtrend strength respectively
- **Why it matters**: Shows when bulls (+DI) or bears (-DI) control price
- **Good signal**: +DI > -DI (bulls strong), +DI rising (improving uptrend)
- **Bad signal**: -DI > +DI (bears strong), lines converging (weakness)
- **Use case**: Directional confirmation, entry/exit with ADX filter

#### ⚫ Vortex Indicator
- **What**: Two oscillators capturing positive and negative trend movement
- **Why it matters**: Identifies trend direction and strength via price swings
- **Good signal**: +VI > -VI (uptrend), +VI crossing above -VI
- **Bad signal**: -VI > +VI (downtrend), VI lines near equal (indecision)
- **Formula**: 
  - `+VI = SUM(|High - Low(prior)|, 14) / TR14`
  - `-VI = SUM(|Low - High(prior)|, 14) / TR14`
- **Use case**: Swing trading, trend confirmation, momentum trades

---

### 🎪 Additional Trend Indicators

#### 🟡 BOP - Balance of Power
- **What**: Ratio of buying to selling pressure
- **Why it matters**: Quick gauge of bull/bear dominance
- **Good signal**: BOP > 0.5 (strong buy pressure), rising trend
- **Bad signal**: BOP < -0.5 (strong sell pressure), declining trend
- **Formula**: `BOP = (Close - Open) / (High - Low)`
- **Use case**: Quick momentum gauge, scalping signals

#### 🟢 Qstick
- **What**: Simple moving average of (Close - Open)
- **Why it matters**: Measures average body size, trend momentum
- **Good signal**: Qstick > 0 with rising (bullish bars), positive divergence
- **Bad signal**: Qstick < 0 with declining (bearish bars), negative divergence
- **Formula**: `Qstick = SMA(Close - Open, period)`

#### 🔵 CCI - Commodity Channel Index
- **What**: Measures deviation of price from its simple moving average
- **Why it matters**: Identifies cyclical trends, overbought/oversold extremes
- **Good signal**: CCI > +100 (strong up-momentum), crossing above 100
- **Bad signal**: CCI < -100 (strong down-momentum), prolonged extremes
- **Formula**: `CCI = (Typical Price - SMA) / (0.015 × Mean Deviation)`
- **Use case**: Cycle trading, mean reversion, momentum extremes

#### 🟣 KDJ - Random Index (Stochastic variant)
- **What**: Three-line indicator (K, D, J) comparing close to high-low range
- **Why it matters**: Identifies momentum reversals and overbought/oversold
- **Good signal**: K crosses above D with both < 20 (oversold bounce), J divergence
- **Bad signal**: K/D stuck above 80 without follow-through (exhaustion), false breakouts
- **Formula**: `RSV = ((C - MIN) / (MAX - MIN)) × 100` | `K = SMA(RSV, 3)` | `D = SMA(K, 3)` | `J = 3K - 2D`
- **Use case**: Short-term timing, mean reversion, overbought/oversold fades

#### 🎯 Parabolic SAR (PSAR)
- **What**: Trailing stop level that rises/falls with price trend acceleration
- **Why it matters**: Provides entry/exit signals and mechanical trailing stops
- **Good signal**: SAR flips from above to below price (uptrend start), dots rising
- **Bad signal**: SAR flips from below to above (downtrend start/exit), whipsaws in ranges
- **Formula**: `SAR[i] = SAR[i-1] + AF × (EP - SAR[i-1])`
- **Use case**: Trend trading, stop-loss placement, trend reversals

#### ⚪ Mass Index (MI)
- **What**: Range expansion identification using high-low volatility
- **Why it matters**: Identifies trend reversals when range contracts then expands
- **Good signal**: MI crosses below 27 (potential reversal), bullish signal if followed by expansion
- **Bad signal**: MI stays high (strong trend continues), breakout false signals

#### 🔷 Typical Price
- **What**: Average of high, low, and close: (H+L+C)/3
- **Why it matters**: Better price representative for moving averages
- **Good signal**: Used with moving averages above it (uptrend)
- **Bad signal**: Price below typical price MA (downtrend)
- **Use case**: Price filtering, equilibrium levels

#### 📊 Since Change
- **What**: Number of periods since last value change
- **Why it matters**: Identifies stalled indicators or prolonged levels
- **Good signal**: Low "since change" = dynamic indicator, trend confirmation
- **Bad signal**: High "since change" = indicator stuck, reversal warning

#### 📈 Moving Extremes (MMAX, MMIN, MSUM)
- **What**: Maximum/minimum/sum values within rolling period
- **Why it matters**: Identifies recent highs/lows for breakout and range trading
- **Good signal**: Price breaks MMAX (bullish), MMIN rising (support holding)
- **Bad signal**: Price breaks MMIN (bearish), MMAX falling (resistance breaking)
- **Use case**: Breakout trading, volatility analysis, range identification

---

## ⚡ Momentum Indicators

Momentum indicators focus on **speed of price changes** and overbought/oversold zones.

### 🟥 RSI - Relative Strength Index

- **What**: Oscillator measuring speed/magnitude of price changes (0–100 scale)
- **Why it matters**: **Most widely used** overbought/oversold indicator
- **Good signal**: RSI 40–60 in strong trend (healthy momentum), bounces from 30, exits at 70
- **Bad signal**: Prolonged > 70 (overbought against your position), divergence at 70, < 30 with strength
- **Threshold values**:
  - RSI > 70 = Overbought (potential reversal)
  - RSI < 30 = Oversold (potential bounce)
  - RSI 40–60 = Healthy momentum in trend
- **Formula**: `RSI = 100 - (100 / (1 + RS))` | `RS = Avg Gain / Avg Loss over 14 periods`
- **Use case**: Mean reversion, overbought/oversold fades, divergence trading, trend confirmation

### 🟧 Stochastic Oscillator (STOCH)

- **What**: Compares closing price to recent high-low range with smoothing
- **Why it matters**: Identifies momentum reversals and overbought/oversold with dual lines
- **Good signal**: %K crosses above %D from below 20 (oversold bounce), slow stoch > fast
- **Bad signal**: %K stuck above 80 without follow-through (exhaustion), divergence at extremes
- **Threshold values**:
  - %K > 80 = Overbought
  - %K < 20 = Oversold
  - Golden cross: K > D = bullish
  - Death cross: K < D = bearish
- **Formula**: `RSV = ((C - LOW14) / (HIGH14 - LOW14)) × 100` | `%K = SMA(RSV, 3)` | `%D = SMA(%K, 3)`
- **Use case**: Mean reversion, momentum confirmation, divergence signals

### 🟦 Williams %R (WILLR)

- **What**: Stochastic-like indicator on 0 to -100 scale
- **Why it matters**: Values near -100 show oversold, near 0 show overbought
- **Good signal**: %R near -100 (oversold, bounce setup), crosses up from oversold
- **Bad signal**: %R stuck near 0 without reversal (strong trend), doesn't reach oversold
- **Threshold values**:
  - %R > -20 = Overbought
  - %R < -80 = Oversold
  - %R between -20 and -80 = Neutral
- **Formula**: `WILLR = (HIGHEST - CLOSE) / (HIGHEST - LOWEST) × -100`
- **Use case**: Overbought/oversold trading, quick entry signals, mean reversion

### 🟩 MFI - Money Flow Index

- **What**: RSI-like oscillator using price AND volume (0–100)
- **Why it matters**: Shows strength of buying/selling pressure combined
- **Good signal**: MFI 50–80 in uptrend with rising (strong bull flow)
- **Bad signal**: MFI > 80 with price divergence (distribution), < 20 with strength (accumulation)
- **Threshold values**:
  - MFI > 80 = Overbought
  - MFI < 20 = Oversold
  - MFI rising = Buying pressure increasing
  - MFI falling = Selling pressure increasing
- **Formula**: `MFI = 100 - (100 / (1 + Money Ratio))` | `Money Ratio = Positive MF / Negative MF`
- **Use case**: Volume confirmation, divergence trading, institutional flow detection

### 📊 ROC - Rate of Change

- **What**: Percentage change in price over N periods
- **Why it matters**: Normalized momentum measure showing acceleration/deceleration
- **Good signal**: ROC > 0 and rising (accelerating uptrend), positive divergence
- **Bad signal**: ROC < 0 and falling (accelerating downtrend), negative divergence
- **Formula**: `ROC = ((Close - Close[N periods ago]) / Close[N periods ago]) × 100`
- **Use case**: Momentum strength, divergence detection, trend exhaustion

### ⚫ Momentum (MOM)

- **What**: Simple difference between current and past price
- **Why it matters**: Raw momentum without normalization
- **Good signal**: MOM > 0 (upside), increasing (accelerating)
- **Bad signal**: MOM < 0 (downside), decreasing (decelerating)
- **Formula**: `MOM = Close - Close[N periods ago]`

### 🔶 CMO - Chande Momentum Oscillator

- **What**: Measures difference between up and down price movements (0–100)
- **Why it matters**: Identifies momentum strength with extremes
- **Good signal**: CMO > 50 with rising (strong up-momentum)
- **Bad signal**: CMO < -50 with falling (strong down-momentum)
- **Formula**: `CMO = ((Up Sum - Down Sum) / (Up Sum + Down Sum)) × 100`

### 🟡 CFO - Chande Forecast Oscillator

- **What**: Percentage difference between close and linear regression forecast
- **Why it matters**: Identifies when price deviates from trend (mean reversion setup)
- **Good signal**: CFO extreme then crosses back (mean reversion), price vs forecast divergence
- **Bad signal**: CFO flat (no momentum), stays extreme without reversal (trend strength)

### 🌊 Ichimoku Cloud

- **What**: Multi-line system encoding trend, support/resistance, and momentum
- **Why it matters**: Complete trading system in one indicator
- **Good signal**: Price > cloud with bullish line ordering (strong uptrend), cloud support hold
- **Bad signal**: Price < cloud with bearish ordering (downtrend), price inside cloud (indecision)
- **Formula**:
  - `Tenkan = (9-high + 9-low) / 2`
  - `Kijun = (26-high + 26-low) / 2`
  - `Senkou A = (Tenkan + Kijun) / 2`
  - `Senkou B = (52-high + 52-low) / 2`
- **Use case**: Trend system, support/resistance, lagging span confirmation

### 🎯 Awesome Oscillator (AO)

- **What**: Difference between 5-SMA and 34-SMA of median price (H+L)/2
- **Why it matters**: Captures short-term momentum vs longer trend
- **Good signal**: AO > 0 with green bars increasing (upside momentum)
- **Bad signal**: AO < 0 with red bars decreasing (downside momentum)
- **Use case**: Momentum divergence, continuation signals

---

## 📈 Volatility Indicators

Volatility indicators address **"how much the price is moving"** and risk/stop placement.

### 📊 ATR - Average True Range

- **What**: Average of true range (largest of: H-L, |H-C prev|, |L-C prev|) over N periods
- **Why it matters**: Measures volatility independent of direction, key for stop placement
- **Good signal**: ATR rising with breakout (increasing risk, trend strength)
- **Bad signal**: ATR spike after extended move (blow-off top), then collapse (reversal warning)
- **Threshold**: 
  - Low ATR (< historical avg) = tighter stops, range potential
  - High ATR (> historical avg) = wider stops, trend potential
- **Formula**: `ATR = SMA(True Range, 14)` | `TR = MAX(H-L, |H-C prev|, |L-C prev|)`
- **Use case**: Stop-loss sizing, position sizing, volatility-adjusted entries

### 🟢 Bollinger Bands (BB)

- **What**: SMA with upper/lower bands set N standard deviations away
- **Why it matters**: **One of top 3 most reliable** indicators; identifies overbought/oversold
- **Good signal**: Price break band with volume + trend (continuation), touch with bounce (mean reversion)
- **Bad signal**: Repeated band touches without progress (range-bound), low volume tags (fakeout)
- **Threshold**:
  - Upper band tag with volume = Overbought if against you, continuation if with trend
  - Lower band tag with volume = Oversold if against you, support if with trend
  - Band squeeze (low BandWidth) = volatility contraction, breakout coming
- **Formula**: `Upper Band = SMA + (2 × STDEV)` | `Lower Band = SMA - (2 × STDEV)` | `Middle = SMA(20)`
- **Use case**: Breakout trading, mean reversion, volatility extremes, support/resistance

### 🔷 Keltner Channel (KC)

- **What**: EMA with bands based on ATR (more volatile than BB)
- **Why it matters**: ATR-based bands adjust for actual volatility
- **Good signal**: Price breaks KC with ATR rising (genuine breakout)
- **Bad signal**: KC bands widen (increasing volatility), breaks false
- **Formula**: `Upper = EMA + (2 × ATR)` | `Lower = EMA - (2 × ATR)`
- **Use case**: Volatility-adjusted breakouts, trend trading

### 📉 MSTD - Moving Standard Deviation

- **What**: Standard deviation of prices over N periods
- **Why it matters**: Raw volatility metric for custom band construction
- **Good signal**: MSTD increasing (volatility rising), supports trend strength
- **Bad signal**: MSTD at extremes without movement (dead market), excessive spikes
- **Use case**: Volatility quantification, custom indicator construction

### 🎪 Donchian Channel (DC)

- **What**: Highest high and lowest low over N periods (no smoothing)
- **Why it matters**: Pure price-based channels, good for breakouts
- **Good signal**: Price breaks above DC high with volume (bullish breakout)
- **Bad signal**: Price breaks DC low (bearish), false breakouts without follow-through
- **Use case**: Breakout trading, support/resistance, turtle strategy base

### 🟠 Acceleration Bands (AB)

- **What**: Dynamic bands based on high-low range acceleration
- **Why it matters**: Tighter bands during calm, wider during volatile
- **Good signal**: Price breaks bands with increasing acceleration (strong move)
- **Bad signal**: Bands converge (calm), breakout false if volume drops
- **Use case**: Volatility confirmation, breakout validation

### 🔶 Chandelier Exit (CE)

- **What**: Volatility-adjusted trailing stop using ATR
- **Why it matters**: Mechanical exit based on price action and volatility
- **Good signal**: Price respects Chandelier (orderly trend), stops protect gains
- **Bad signal**: Whipsawed by CE in choppy markets (volatility too high)
- **Formula**: `CE Long = HIGH[N] - ATR × Multiple` | `CE Short = LOW[N] + ATR × Multiple`
- **Use case**: Trailing stops, trend protection, exit timing

### ⚪ Projection Oscillator (PO)

- **What**: Linear regression-based oscillator of price projections
- **Why it matters**: Advanced volatility measure for prediction
- **Good signal**: PO at extremes then reverting (mean reversion), divergence signals
- **Bad signal**: PO flat (no volatility or trending), extremes without reversal
- **Use case**: Projection-based trading, advanced volatility analysis

### 🟡 NATR - Normalized Average True Range

- **What**: ATR expressed as percentage of current price
- **Why it matters**: Compares volatility across different price levels/symbols
- **Good signal**: NATR at historical highs (maximum volatility environment)
- **Bad signal**: NATR at historic lows (subdued volatility, range potential)
- **Formula**: `NATR = (ATR / Close) × 100`
- **Use case**: Cross-symbol volatility comparison, relative risk assessment

### 🔷 Ulcer Index (UI)

- **What**: Measures depth and duration of drawdowns
- **Why it matters**: Risk metric capturing pain of prolonged declines
- **Good signal**: UI low (shallow drawdowns, healthy trend)
- **Bad signal**: UI rising sharply (deep drawdown building), sustained high UI (downtrend)
- **Use case**: Risk management, drawdown tracking, strategy stress testing

---

## 💰 Volume Indicators

Volume indicators measure **whether volume supports the price move**.

### 📊 OBV - On-Balance Volume

- **What**: Cumulative volume added on up days, subtracted on down days
- **Why it matters**: Identifies volume strength behind moves, divergences predict reversals
- **Good signal**: OBV rising with price (bullish confirmation), new highs
- **Bad signal**: Price makes new high but OBV doesn't (divergence = weak), OBV declining
- **Formula**: 
  - If Close > Previous Close: OBV = Previous OBV + Volume
  - If Close < Previous Close: OBV = Previous OBV - Volume
  - If Close = Previous Close: OBV = Previous OBV
- **Use case**: Volume confirmation, accumulation/distribution, divergence trading

### 💵 CMF - Chaikin Money Flow

- **What**: Combines price position in range with volume
- **Why it matters**: Shows if volume follows bulls or bears
- **Good signal**: CMF > 0 and rising (buying pressure), confirms uptrend
- **Bad signal**: CMF < 0 and falling (selling pressure), price divergence at CMF extremes
- **Threshold**:
  - CMF > 0.1 = Moderate buying pressure
  - CMF < -0.1 = Moderate selling pressure
  - CMF between ±0.1 = Neutral flow
- **Formula**: `CMF = SUM((CLR × Volume), N) / SUM(Volume, N)` | `CLR = ((C-L) - (H-C)) / (H-L)`

### 📈 AD - Accumulation/Distribution (Chaikin AD Line)

- **What**: Cumulative line combining price range with volume
- **Why it matters**: Measures money flow in/out, shows if volume confirms trends
- **Good signal**: AD rising with price (bullish), AD at new highs (distribution complete)
- **Bad signal**: AD declining while price rising (divergence = weak), AD new lows (dumping)
- **Formula**: `AD = Previous AD + (CLR × Volume)` | `CLR = ((C-L) - (H-C)) / (H-L)`

### 🔄 ADOSC - Chaikin A/D Oscillator

- **What**: Difference between fast and slow EMAs of AD line
- **Why it matters**: Identifies momentum shifts in money flow
- **Good signal**: ADOSC crosses above zero (buying momentum), positive divergence
- **Bad signal**: ADOSC crosses below zero (selling momentum), negative divergence
- **Formula**: `ADOSC = EMA(3, AD) - EMA(10, AD)`

### 🎯 MFI - Money Flow Index

*Note: Listed under Momentum but is volume-aware*

- **What**: RSI-like but using price range and volume
- **Why it matters**: Combines momentum with volume for stronger signals
- **Good signal**: MFI 50–80 in uptrend (strong buying)
- **Bad signal**: MFI > 80 with divergence (distribution), < 20 with strength (accumulation)
- **Use case**: Volume-weighted momentum, divergence trading

### 🟢 VWAP - Volume Weighted Average Price

- **What**: Average price weighted by intraday volume
- **Why it matters**: Institutional fair price, key reference level
- **Good signal**: Price above VWAP with rising volume (bullish), price bouncing off VWAP
- **Bad signal**: Price far above VWAP with declining volume (overextension), breaks below VWAP support
- **Formula**: `VWAP = SUM(Price × Volume) / SUM(Volume)` (intraday)
- **Use case**: Institutional entry/exit levels, intraday support/resistance

### 💪 Force Index (FI)

- **What**: Raw price movement × volume
- **Why it matters**: Raw volume-adjusted momentum
- **Good signal**: FI > 0 and rising (strong volume behind upside)
- **Bad signal**: FI < 0 and falling (strong volume behind downside)
- **Formula**: `FI = (Close - Previous Close) × Volume`

### 📍 Ease of Movement (EMV)

- **What**: Distance moved relative to range and volume
- **Why it matters**: Shows ease of price movement (low volume = harder to move)
- **Good signal**: EMV positive and rising (price moving up with ease)
- **Bad signal**: EMV negative or flat (difficulty moving in either direction)
- **Formula**: `EMV = (Distance Moved / (High - Low)) / (Volume / Scale)`

### 🔷 NVI - Negative Volume Index

- **What**: Cumulative index only advancing on down-volume days
- **Why it matters**: Shows "smart money" moves on declining volume
- **Good signal**: NVI rising (smart money buying accumulation)
- **Bad signal**: NVI declining (smart money distributing)
- **Use case**: Long-term accumulation/distribution, smart money tracking

### 📊 VPT - Volume Price Trend

- **What**: Volume adjusted by percentage price change
- **Why it matters**: Combines volume and momentum in single line
- **Good signal**: VPT rising (volume supporting uptrend)
- **Bad signal**: VPT declining despite rising price (weak volume)
- **Formula**: `VPT = Previous VPT + (Volume × ROC)` | `ROC = (C - C prev) / C prev`

---

## 🔄 Oscillators & Special Indicators

### 🟠 Hilbert Transform Indicators (Advanced)

#### 🔶 HTTRENDLINE - Hilbert Transform Instantaneous Trendline
- **What**: Mathematical lag-free trendline using Hilbert transform
- **Why it matters**: Follows price closely while removing noise
- **Good signal**: Price above line (uptrend), crosses above from below
- **Bad signal**: Price below line (downtrend), whipsaws in choppy markets
- **Use case**: Advanced technical traders, lag-free analysis

#### 🌊 HTSINE - Hilbert Transform Sine Wave
- **What**: Generates sine wave showing dominant cycle phase
- **Why it matters**: Identifies market cycles for timing entries/exits
- **Good signal**: Sine at trough (bottom of cycle, bounce), rising phase (uptrend probable)
- **Bad signal**: Sine at peak (top of cycle, pullback), declining phase (downtrend probable)
- **Use case**: Cycle-based trading, bottom/top picking

#### 📊 HTDCPERIOD - Hilbert Transform Dominant Cycle Period
- **What**: Calculates dominant cycle length in current price data
- **Why it matters**: Shows market periodicity, helps choose indicator periods
- **Good signal**: Clear dominant period (cyclic market), use it for MA periods
- **Bad signal**: Shifting periods (choppy, ranging market)
- **Use case**: Parameter optimization, cycle strength assessment

#### 🔄 HTDCPHASE - Hilbert Transform Dominant Cycle Phase
- **What**: Position within dominant cycle
- **Why it matters**: Timing indicator for cycle-based entries/exits
- **Good signal**: Phase at lows (bounce setup), rising phase (uptrend continuation)
- **Bad signal**: Phase at highs (pullback risk), phase unreliable in non-cyclic markets
- **Use case**: Precise entry/exit timing, cycle-based systems

#### 🎯 HTTRENDMODE - Hilbert Transform Trend vs Cycle
- **What**: Binary indicator (trending vs cycling mode)
- **Why it matters**: Tells you which strategy to use (trend-following vs oscillator)
- **Good signal**: TRENDING mode = use trend-following strategies, Bollinger Bands, MACD
- **Bad signal**: CYCLING mode = avoid trend-following, use mean-reversion oscillators
- **Use case**: Strategy mode selection, adaptive trading systems

### 📍 Additional Oscillators

#### 🟣 ROCR - Rate of Change Ratio
- **What**: Ratio form of ROC rather than percentage
- **Why it matters**: Alternative calculation method for ROC analysis
- **Good signal**: ROCR > 1 (price up), rising (acceleration)
- **Bad signal**: ROCR < 1 (price down), falling (deceleration)
- **Use case**: Ratio-based momentum, mathematical alternatives

#### 📊 MIDPOINT / MIDPRICE
- **What**: Average of recent highs and lows (or close prices)
- **Why it matters**: Shows center price range for equilibrium levels
- **Good signal**: Price above midpoint (bullish bias), below midpoint (bearish bias)
- **Bad signal**: Price oscillating around midpoint (balanced, no edge)
- **Use case**: Center line identification, mean-reversion levels

---

## 📋 Strategy Framework

The indicatorts library provides building blocks for building systematic trading strategies.

### 🏗️ Core Components

#### 📊 Asset
The Asset interface represents price/volume data:
```
interface Asset {
  dates: Date[]           // Trading dates
  openings: number[]      // Opening prices
  closings: number[]      // Closing prices
  highs: number[]         // Period highs
  lows: number[]          // Period lows
  volumes: number[]       // Trading volumes
}
```

#### 🎯 Action
Trading signals:
```
enum Action {
  SELL = -1              // Exit/short signal
  HOLD = 0               // No action
  BUY = 1                // Entry/long signal
}
```

#### 🔄 Strategy Function
Converts indicators into actions:
```
type StrategyFunction = (asset: Asset) => Action[]
```

Takes price/volume data, applies indicators, returns buy/sell signals for each period.

#### 📈 Backtesting Metrics
- **Return**: Total % gain/loss
- **Win Rate**: % of profitable trades
- **Profit Factor**: Gross profit / Gross loss
- **Sharpe Ratio**: Risk-adjusted return (higher = better)
- **Max Drawdown**: Largest peak-to-trough decline
- **Avg Trade**: Average P&L per trade
- **Consecutive Losses**: Largest losing streak

---

## 🤖 Built-in Trading Strategies

### 🎯 Trend-Following Strategies (10 strategies)

#### 📊 1. MACD Strategy
- **Indicator**: MACD (12/26/9 EMA)
- **Entry Rules**: 
  - 🟢 **BUY**: MACD crosses above Signal line OR above zero line
  - 🔴 **SELL**: MACD crosses below Signal line OR below zero line
- **Market conditions**: Best in strong trending markets
- **Win rate typical**: 40–50% (longer winners)
- **Use case**: Trend confirmation, momentum entry
- **Risk level**: Medium

#### 📈 2. Parabolic SAR Strategy
- **Indicator**: PSAR (dots above/below price)
- **Entry Rules**:
  - 🟢 **BUY**: SAR flips from above price to below (uptrend initiation)
  - 🔴 **SELL**: SAR flips from below price to above (downtrend initiation)
- **Market conditions**: Excellent in trending, whipsaws in ranges
- **Win rate typical**: 50–60%
- **Use case**: Trend following with mechanical stops
- **Risk level**: Low (built-in trailing stop)

#### 🎪 3. APO Strategy
- **Indicator**: Absolute Price Oscillator (14/30 EMA)
- **Entry Rules**:
  - 🟢 **BUY**: APO crosses above zero
  - 🔴 **SELL**: APO crosses below zero
- **Market conditions**: Trend-following, simpler than MACD
- **Win rate typical**: 45–55%
- **Use case**: Momentum crossover without signal line lag
- **Risk level**: Medium

#### 🔷 4. Aroon Strategy
- **Indicator**: Aroon Up/Down oscillator
- **Entry Rules**:
  - 🟢 **BUY**: Aroon Up crosses above Aroon Down, Aroon Up > 70
  - 🔴 **SELL**: Aroon Down crosses above Aroon Up, Aroon Down > 70
- **Market conditions**: Trend strength identification
- **Win rate typical**: 50–60%
- **Use case**: Trend reversal timing, strength confirmation
- **Risk level**: Medium

#### ⚫ 5. Vortex Strategy
- **Indicator**: +VI / -VI (14 period)
- **Entry Rules**:
  - 🟢 **BUY**: +VI crosses above -VI, +VI > 1.0
  - 🔴 **SELL**: -VI crosses above +VI, -VI > 1.0
- **Market conditions**: Swing trading, trend confirmation
- **Win rate typical**: 50–65%
- **Use case**: Trend direction clarity
- **Risk level**: Low-Medium

#### 🎯 6. BOP Strategy - Balance of Power
- **Indicator**: BOP ((C-O)/(H-L))
- **Entry Rules**:
  - 🟢 **BUY**: BOP crosses above 0 or reaches +0.5
  - 🔴 **SELL**: BOP crosses below 0 or reaches -0.5
- **Market conditions**: Short-term momentum
- **Win rate typical**: 45–55%
- **Use case**: Quick momentum gauge
- **Risk level**: Medium-High

#### 🟡 7. CFO Strategy - Chande Forecast Oscillator
- **Indicator**: CFO (linear regression deviation)
- **Entry Rules**:
  - 🟢 **BUY**: CFO crosses above 0 (price above forecast)
  - 🔴 **SELL**: CFO crosses below 0 (price below forecast)
- **Market conditions**: Mean reversion tendency
- **Win rate typical**: 50–60%
- **Use case**: Forecast-based reversal trading
- **Risk level**: Medium

#### 🔶 8. Typical Price Strategy
- **Indicator**: Typical Price ((H+L+C)/3) + Moving Average
- **Entry Rules**:
  - 🟢 **BUY**: Price crosses above Typical Price MA
  - 🔴 **SELL**: Price crosses below Typical Price MA
- **Market conditions**: Smoothed price trading
- **Win rate typical**: 50–55%
- **Use case**: Smooth trend following
- **Risk level**: Medium

#### 🌊 9. VWMA Strategy - Volume Weighted MA
- **Indicator**: VWMA (volume-weighted moving average)
- **Entry Rules**:
  - 🟢 **BUY**: Price crosses above VWMA with volume confirmation
  - 🔴 **SELL**: Price crosses below VWMA on declining volume
- **Market conditions**: Institutional trading flow
- **Win rate typical**: 50–60%
- **Use case**: Volume-confirmed trends
- **Risk level**: Medium

#### 📊 10. KDJ Strategy - Random Index
- **Indicator**: KDJ (K/D lines)
- **Entry Rules**:
  - 🟢 **BUY**: K crosses above D from oversold (< 20), K < 20
  - 🔴 **SELL**: K crosses below D from overbought (> 80), K > 80
- **Market conditions**: Mean reversion + momentum confirmation
- **Win rate typical**: 55–65%
- **Use case**: Oversold/overbought with confirmation
- **Risk level**: Medium

---

### ⚡ Momentum Strategies (5 strategies)

#### 🔴 1. RSI-2 Strategy
- **Indicator**: RSI (2 period) - extreme short-term momentum
- **Entry Rules**:
  - 🟢 **BUY**: RSI2 < 5 (extreme oversold) bounces above 5
  - 🔴 **SELL**: RSI2 > 95 (extreme overbought) falls below 95
- **Market conditions**: Mean reversion, intraday/daily bounces
- **Win rate typical**: **80%+** (highest win rate indicator)
- **Use case**: Quick bounce trading, scalping, tight stops
- **Risk level**: Low (mean reversion has high % winners but small size)

#### 🟠 2. Stochastic Oscillator Strategy
- **Indicator**: %K/%D (14/3/3)
- **Entry Rules**:
  - 🟢 **BUY**: %K crosses above %D from oversold (< 20)
  - 🔴 **SELL**: %K crosses below %D from overbought (> 80)
- **Market conditions**: Range-bound, mean reversion
- **Win rate typical**: 60–70%
- **Use case**: Momentum bounce trading
- **Risk level**: Medium

#### 🟡 3. Williams %R Strategy
- **Indicator**: %R (-100 to 0)
- **Entry Rules**:
  - 🟢 **BUY**: %R crosses above -80 (oversold)
  - 🔴 **SELL**: %R crosses below -20 (overbought)
- **Market conditions**: Oscillator trading, mean reversion
- **Win rate typical**: 60–65%
- **Use case**: Simple overbought/oversold trading
- **Risk level**: Medium

#### 🔷 4. Awesome Oscillator Strategy
- **Indicator**: AO (5-SMA vs 34-SMA of median price)
- **Entry Rules**:
  - 🟢 **BUY**: AO crosses above zero, bars turn green and rising
  - 🔴 **SELL**: AO crosses below zero, bars turn red and falling
- **Market conditions**: Intraday momentum, swing trading
- **Win rate typical**: 55–65%
- **Use case**: Momentum divergence, bar color patterns
- **Risk level**: Medium

#### 🌊 5. Ichimoku Cloud Strategy
- **Indicator**: Multi-line cloud system (Tenkan/Kijun/Cloud)
- **Entry Rules**:
  - 🟢 **BUY**: Price breaks above cloud + Tenkan > Kijun
  - 🔴 **SELL**: Price breaks below cloud + Tenkan < Kijun
- **Market conditions**: Complete system for all conditions
- **Win rate typical**: 50–60% (but risk-reward often 1:2+)
- **Use case**: Complete trading system, multi-timeframe
- **Risk level**: Low-Medium (cloud = dynamic S/R)

---

### 📊 Volatility Strategies (3 strategies)

#### 🟢 1. Bollinger Bands Strategy
- **Indicator**: BB (20-SMA ± 2 σ)
- **Entry Rules**:
  - 🟢 **BUY**: Price closes above upper band on volume OR bounces off lower band
  - 🔴 **SELL**: Price closes below lower band on volume OR bounces off upper band
- **Market conditions**: Breakouts AND mean reversion (context-dependent)
- **Win rate typical**: **77.8%** (one of most reliable)
- **Use case**: Volatility extremes, band breakouts, squeeze/expansion
- **Risk level**: Medium

#### 🔷 2. Acceleration Bands Strategy
- **Indicator**: Acceleration Bands (dynamic volatility bands)
- **Entry Rules**:
  - 🟢 **BUY**: Price breaks above upper band with volume
  - 🔴 **SELL**: Price breaks below lower band with volume
- **Market conditions**: Volatility acceleration, breakout confirmation
- **Win rate typical**: 55–65%
- **Use case**: Volatility-confirmed breakouts
- **Risk level**: Medium

#### 🟠 3. Projection Oscillator Strategy
- **Indicator**: PO (projection-based oscillator)
- **Entry Rules**:
  - 🟢 **BUY**: PO crosses above zero or bounces from low
  - 🔴 **SELL**: PO crosses below zero or bounces from high
- **Market conditions**: Advanced volatility analysis
- **Win rate typical**: 50–60%
- **Use case**: Projection-based mean reversion
- **Risk level**: Medium-High

---

### 💰 Volume Strategies (6 strategies)

#### 📊 1. CMF Strategy - Chaikin Money Flow
- **Indicator**: CMF (14 period money flow index)
- **Entry Rules**:
  - 🟢 **BUY**: CMF crosses above 0 (buying pressure > 50%)
  - 🔴 **SELL**: CMF crosses below 0 (selling pressure > 50%)
- **Market conditions**: Volume-based confirmation
- **Win rate typical**: 55–65%
- **Use case**: Volume trend confirmation, divergence trading
- **Risk level**: Medium

#### 💪 2. Force Index Strategy
- **Indicator**: FI (raw volume × price change)
- **Entry Rules**:
  - 🟢 **BUY**: FI crosses above 0 (volume supporting up)
  - 🔴 **SELL**: FI crosses below 0 (volume supporting down)
- **Market conditions**: Raw volume momentum
- **Win rate typical**: 55–65%
- **Use case**: Volume-driven momentum trading
- **Risk level**: Medium

#### 🎯 3. Money Flow Index Strategy
- **Indicator**: MFI (20 period, RSI using money flow)
- **Entry Rules**:
  - 🟢 **BUY**: MFI < 20 and crosses back above 20
  - 🔴 **SELL**: MFI > 80 and crosses back below 80
- **Market conditions**: Overbought/oversold with volume
- **Win rate typical**: 60–70%
- **Use case**: Volume-weighted momentum extremes
- **Risk level**: Medium

#### 🌊 4. Ease of Movement Strategy
- **Indicator**: EMV (price movement / range / volume)
- **Entry Rules**:
  - 🟢 **BUY**: EMV crosses above 0 (ease of upside movement)
  - 🔴 **SELL**: EMV crosses below 0 (ease of downside movement)
- **Market conditions**: Relative ease of movement
- **Win rate typical**: 50–60%
- **Use case**: Movement difficulty assessment
- **Risk level**: Medium

#### 🔷 5. Negative Volume Index Strategy
- **Indicator**: NVI (accumulation on down-volume)
- **Entry Rules**:
  - 🟢 **BUY**: NVI rising above its moving average (smart money buying)
  - 🔴 **SELL**: NVI falling below MA (smart money selling)
- **Market conditions**: Long-term accumulation/distribution
- **Win rate typical**: 50–60%
- **Use case**: Smart money detection, long-term trends
- **Risk level**: Low (position trading)

#### 📈 6. VWAP Strategy - Volume Weighted Average Price
- **Indicator**: VWAP (institutional fair price)
- **Entry Rules**:
  - 🟢 **BUY**: Price bounces above VWAP with volume
  - 🔴 **SELL**: Price breaks below VWAP on volume
- **Market conditions**: Intraday mean reversion, institutional trading
- **Win rate typical**: 55–65%
- **Use case**: Intraday support/resistance, institutional levels
- **Risk level**: Medium

---

## 📊 Signal Quick Reference

### ✅ Good Signal Examples by Category

| **Category** | **Indicator** | **Good Signal** | **Expected Setup** |
|---|---|---|---|
| **Trend** | MACD | MACD > Signal + Histogram > 0 | Bullish momentum acceleration |
| **Trend** | EMA | Price > EMA50 > EMA200 | Strong uptrend alignment |
| **Trend** | PSAR | SAR flips below price | Uptrend initiation |
| **Momentum** | RSI | RSI 40–60 in trend | Healthy momentum, not overbought |
| **Momentum** | Stoch | %K bounces from < 20 | Oversold bounce setup |
| **Momentum** | RSI-2 | RSI2 < 5 bouncing | Extreme oversold mean reversion |
| **Volatility** | BB | Price breaks upper band | Volatility expansion breakout |
| **Volatility** | ATR | ATR rising with breakout | Legitimate volatility increase |
| **Volume** | OBV | OBV new high with price | Volume confirms uptrend |
| **Volume** | CMF | CMF > 0.1 | Buying pressure > 50% |
| **Advanced** | Ichimoku | Price > Cloud, Tenkan > Kijun | Complete bullish alignment |

### ❌ Bad Signal Examples by Category

| **Category** | **Indicator** | **Bad Signal** | **Warning** |
|---|---|---|---|
| **Trend** | MACD | MACD > Signal but declining | Momentum fading |
| **Trend** | Price vs MA | Price far above rising MA | Overextension, mean reversion risk |
| **Momentum** | RSI | RSI stuck > 70 vs your position | Overbought against trade |
| **Momentum** | Divergence | RSI higher high, price lower high | Bearish divergence, reversal risk |
| **Volatility** | Squeeze | BB bands compress then spike | Volatile reversal probable |
| **Volume** | Divergence | Price new high, OBV flat | Weak uptrend, distribution likely |

---

## 🎓 Strategy Selection by Market Regime

### 📈 Strong Trending Market
**Use Trend Strategies**: MACD, Parabolic SAR, Aroon, Vortex
- Focus on breakouts and continuation
- Use ATR for volatility-adjusted stops
- Ignore mean-reversion signals
- **Expect**: 40–50% win rate, large winners (risk/reward 1:2+)

### 📊 Range-Bound/Ranging Market
**Use Momentum Strategies**: RSI-2, Stochastic, Williams %R
- Focus on overbought/oversold fades
- Use Bollinger Bands for support/resistance
- Profit from bounces, not breakouts
- **Expect**: 70%+ win rate, small winners (risk/reward 1:0.5–1:1)

### 🌊 Volatile/Choppy Market
**Use Volume Strategies**: CMF, MFI, Force Index, VWAP
- Focus on volume confirmation
- Avoid large positions
- Use tighter stops
- **Expect**: 55–65% win rate, medium risk/reward

### 🔄 Reversal/Transition Market
**Use Oscillator + Divergence**: CCI extremes, CMO divergence, Ichimoku cloud
- Watch for indicators at extremes
- Confirm with volume
- Use multi-timeframe confirmation
- **Expect**: 50–60% win rate but high risk/reward 1:2–1:3

---

## 💡 Implementation Tips

1. **Combine Indicators**: Don't rely on single indicator
   - Trend (MACD) + Momentum (RSI) + Volume (OBV)
   - Example: "MACD > 0 AND RSI 40–70 AND OBV rising"

2. **Use Stops**: Position size = Account Risk / (Stop Loss Distance)
   - ATR-based: Stop = Entry ± (2 × ATR)
   - Support/Resistance-based: Stop = Recent swing low + buffer
   - Bollinger Bands: Stop = Outside band + ATR buffer

3. **Risk/Reward**: Exit targets should exceed stop loss
   - Trend strategies: 1:2 or 1:3 (larger winners)
   - Mean reversion: 1:0.5 to 1:1 (small winners, high frequency)

4. **Timeframe Alignment**: Confirm across multiple timeframes
   - Daily trend + 4H momentum + 1H entry
   - Weekly ADX > 25 (strong trend) filters out choppy daily

5. **Backtest**: Always backtest before live trading
   - Use `Strategy Stats` and `Compute Strategy Stats`
   - Track: Win Rate, Profit Factor, Sharpe Ratio, Max Drawdown

---

## 📖 Quick Reference: Indicator Formulas

### Moving Averages
```
SMA(N) = SUM(Close, N) / N
EMA(N) = (Close × α) + (Previous EMA × (1-α)), α = 2/(N+1)
DEMA = (2 × EMA) - EMA(EMA)
TEMA = (3 × EMA1) - (3 × EMA2) + EMA3
VWMA(N) = SUM(Close × Volume, N) / SUM(Volume, N)
```

### Momentum
```
RSI(14) = 100 - (100 / (1 + RS)), RS = Avg Gain / Avg Loss
MACD = EMA(12) - EMA(26), Signal = EMA(9, MACD)
APO = EMA(14) - EMA(30)
Stochastic %K = ((C - LOW14) / (HIGH14 - LOW14)) × 100
%D = SMA(%K, 3)
```

### Volatility
```
ATR(14) = SMA(True Range, 14)
TR = MAX(H-L, |H-C_prev|, |L-C_prev|)
BB Upper = SMA(20) + (2 × STDEV)
BB Lower = SMA(20) - (2 × STDEV)
Keltner = EMA ± (2 × ATR)
```

### Volume
```
OBV = Previous OBV ± Volume (+ if close > prev, - if close < prev)
CMF = SUM((CLR × Volume), 14) / SUM(Volume, 14)
AD = Previous AD + (CLR × Volume)
CLR = ((C-L) - (H-C)) / (H-L)
MFI = 100 - (100 / (1 + Money Ratio))
```

---

## ⚠️ Disclaimer

The information provided is strictly for **informational and educational purposes** and is **NOT financial advice**. Trading and investing carry substantial risk of loss. Always:

- ✅ Test strategies on historical data
- ✅ Use proper position sizing
- ✅ Implement stop-losses
- ✅ Never risk more than 1–2% per trade
- ✅ Consult a financial advisor before live trading

**Copyright © 2024 IndicatorTS (cinar/indicatorts) - MIT License**

---

*Last Updated: December 7, 2024*
*Complete Reference: https://github.com/cinar/indicatorts*