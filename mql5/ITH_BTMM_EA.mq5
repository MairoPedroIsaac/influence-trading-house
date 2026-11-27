//+------------------------------------------------------------------+
//| ITH_BTMM_EA.mq5                                                  |
//| Influence Trading House - BTMM Expert Advisor, version 0.2       |
//| v0.2 adds: trend filter (H4 EMA 200), buy/sell switches,         |
//| daily loss limit and max total loss limit.                       |
//| Same rules as the ITH_BTMM_MW indicator v0.4:                    |
//| - H4 and H1 last shape point the same way (M = down, W = up)     |
//| - a fresh M15 shape in that direction (within 4 bars)            |
//| - SL beyond the M top / W bottom + 0.2 ATR, TP = 2R              |
//| - lots sized to 0.25% of balance                                 |
//| One trade per shape, one open trade per symbol.                  |
//| SAFETY: by default it only trades inside the Strategy Tester.    |
//| Live trading needs InpAllowLive = true on purpose.               |
//+------------------------------------------------------------------+
#property copyright "Influence Trading House"
#property version   "0.20"
#property description "BTMM M/W EA v0.2: trend filter and loss limits. Backtest first."

#include <Trade/Trade.mqh>

//--- inputs
input group "Shape detection (same as the indicator)"
input int    InpSwingBars      = 3;     // Bars each side to confirm a swing high/low
input int    InpAtrPeriod      = 14;    // ATR period
input double InpTolAtr         = 1.0;   // Two lows (or highs) must be within this many ATR
input double InpMinHeightAtr   = 1.5;   // Neckline must be at least this many ATR away
input int    InpMajorBars      = 50;    // Low/high must be the extreme of the last N bars
input int    InpMaxBarsToBreak = 30;    // Neckline must break within this many bars
input int    InpHistoryBars    = 1500;  // Bars read on each timeframe

input group "Timeframes"
input ENUM_TIMEFRAMES InpTfBig     = PERIOD_H4;   // Direction (big)
input ENUM_TIMEFRAMES InpTfMid     = PERIOD_H1;   // Direction (middle)
input ENUM_TIMEFRAMES InpTfEntry   = PERIOD_M15;  // Entry timeframe
input int             InpFreshBars = 4;           // Entry shape must be this recent (entry TF bars)

input group "Trade plan"
input double InpSlBufferAtr = 0.2;    // Stop loss distance beyond the M top / W bottom (in ATR)
input double InpRR          = 2.0;    // Take profit = this many times the risk
input double InpRiskPct     = 0.25;   // Risk per trade, % of balance

input group "Trend filter (new in v0.2)"
input bool            InpUseTrend  = true;       // Only trade with the bigger trend
input ENUM_TIMEFRAMES InpTrendTf   = PERIOD_H4;  // Trend timeframe
input int             InpTrendEma  = 200;        // Buy only above this EMA, sell only below
input bool            InpAllowBuys  = true;      // Allow buy trades
input bool            InpAllowSells = true;      // Allow sell trades

input group "Loss limits (new in v0.2)"
input double InpMaxDailyLossPct = 3.0;   // Stop new trades for the day after this loss, % of day start balance. 0 = off
input double InpMaxTotalLossPct = 8.0;   // Stop trading for good after this loss, % of start balance. 0 = off

input group "Safety"
input bool   InpAllowLive      = false;  // Allow real orders outside the Strategy Tester
input int    InpMaxSpreadPts   = 0;      // Skip if spread is above this (points). 0 = off
input long   InpMagic          = 260001; // ID for this EA's trades
input string InpComment        = "BTMM";  // Order comment (ITH reads it as the strategy)

//--- state
CTrade   trade;
int      emaHandle        = INVALID_HANDLE;
double   startBalance     = 0.0;   // balance when the EA started
datetime dayStart         = 0;     // start of the current trading day
double   dayStartBalance  = 0.0;   // balance at the start of the day
datetime lastEntryBar   = 0;   // last entry-TF bar we checked
datetime lastTradedShape = 0;  // break time of the last shape we traded

struct Pivot
{
   int    idx;
   double price;
   int    type;   // +1 swing high, -1 swing low
};

struct Shape
{
   int      type;        // +1 = W (buy), -1 = M (sell)
   int      ia, ib, ic, ibrk;
   double   pa, pb, pc, pbrk;
   datetime ta, tb, tc, tbrk;
   double   hbrk, lbrk, atr;
};

//+------------------------------------------------------------------+
int OnInit()
{
   trade.SetExpertMagicNumber(InpMagic);
   trade.SetTypeFillingBySymbol(_Symbol);
   trade.SetDeviationInPoints(20);

   if(InpUseTrend)
   {
      emaHandle = iMA(_Symbol, InpTrendTf, InpTrendEma, 0, MODE_EMA, PRICE_CLOSE);
      if(emaHandle == INVALID_HANDLE)
      {
         Print("ITH BTMM EA: could not create the trend EMA");
         return(INIT_FAILED);
      }
   }
   startBalance = AccountInfoDouble(ACCOUNT_BALANCE);

   if(!MQLInfoInteger(MQL_TESTER) && !InpAllowLive)
      Print("ITH BTMM EA: live trading is OFF (InpAllowLive = false). It will only show status.");
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   if(emaHandle != INVALID_HANDLE)
      IndicatorRelease(emaHandle);
   Comment("");
}

//+------------------------------------------------------------------+
//| Work once per new entry-timeframe candle (closed candles only)    |
//+------------------------------------------------------------------+
void OnTick()
{
   datetime barTime = iTime(_Symbol, InpTfEntry, 0);
   if(barTime == 0 || barTime == lastEntryBar)
      return;

   //--- remember the balance at the start of each day (for the daily loss limit)
   datetime today = iTime(_Symbol, PERIOD_D1, 0);
   if(today != 0 && today != dayStart)
   {
      dayStart        = today;
      dayStartBalance = AccountInfoDouble(ACCOUNT_BALANCE);
   }

   int dB, dM, dE;
   datetime tB, tM, tE;
   bool fB, fM, fE;
   Shape sB, sM, sE;
   bool okB = GetTfState(InpTfBig,   dB, tB, fB, sB);
   bool okM = GetTfState(InpTfMid,   dM, tM, fM, sM);
   bool okE = GetTfState(InpTfEntry, dE, tE, fE, sE);
   if(!okB || !okM || !okE)
      return;                      // history still loading, try next tick
   lastEntryBar = barTime;

   string status;
   if(dB == 0 || dB != dM)
      status = "WAIT: " + TfName(InpTfBig) + " and " + TfName(InpTfMid) + " disagree";
   else if(!(dE == dB && fE))
      status = (dB > 0) ? "BIAS BUY: wait for " + TfName(InpTfEntry) + " W"
                        : "BIAS SELL: wait for " + TfName(InpTfEntry) + " M";
   else
   {
      string block = BlockReason(sE.type);
      status = (block != "") ? block : TryTrade(sE, tE);
   }

   Comment("ITH BTMM EA v0.2  ", _Symbol, "\n", status);
}

//+------------------------------------------------------------------+
//| v0.2 checks before a trade: side switches, trend, loss limits    |
//| Returns "" when the trade is allowed.                             |
//+------------------------------------------------------------------+
string BlockReason(const int type)
{
   string side = (type > 0) ? "BUY" : "SELL";
   if(type > 0 && !InpAllowBuys)  return("ENTRY BUY: skipped, buys are switched off");
   if(type < 0 && !InpAllowSells) return("ENTRY SELL: skipped, sells are switched off");

   //--- loss limits
   double equity  = AccountInfoDouble(ACCOUNT_EQUITY);
   if(InpMaxTotalLossPct > 0.0 && equity <= startBalance * (1.0 - InpMaxTotalLossPct / 100.0))
      return("STOPPED: max total loss reached, no more trades");
   if(InpMaxDailyLossPct > 0.0 && equity <= dayStartBalance * (1.0 - InpMaxDailyLossPct / 100.0))
      return("PAUSED: daily loss limit reached, back tomorrow");

   //--- trend filter
   if(InpUseTrend)
   {
      double ema[];
      if(CopyBuffer(emaHandle, 0, 1, 1, ema) != 1)
         return("ENTRY " + side + ": waiting for trend data");
      double closeTrend = iClose(_Symbol, InpTrendTf, 1);
      if(type > 0 && closeTrend <= ema[0])
         return("ENTRY BUY: skipped, price is below the " + TfName(InpTrendTf) + " EMA" + IntegerToString(InpTrendEma));
      if(type < 0 && closeTrend >= ema[0])
         return("ENTRY SELL: skipped, price is above the " + TfName(InpTrendTf) + " EMA" + IntegerToString(InpTrendEma));
   }
   return("");
}

//+------------------------------------------------------------------+
string TryTrade(const Shape &s, const datetime shapeTime)
{
   string side = (s.type > 0) ? "BUY" : "SELL";

   if(shapeTime == lastTradedShape)
      return("ENTRY " + side + ": already traded this shape");
   if(HasOpenTrade())
      return("ENTRY " + side + ": skipped, a trade is already open");
   if(!MQLInfoInteger(MQL_TESTER) && !InpAllowLive)
      return("ENTRY " + side + ": signal only (live trading is off)");

   if(InpMaxSpreadPts > 0 && SymbolInfoInteger(_Symbol, SYMBOL_SPREAD) > InpMaxSpreadPts)
      return("ENTRY " + side + ": skipped, spread too high");

   double sl, tp, lots;
   if(!MakePlan(s, sl, tp, lots))
   {
      lastTradedShape = shapeTime;
      return("SETUP FAILED: price passed the stop");
   }
   if(!StopsAreValid(s.type, sl, tp))
      return("ENTRY " + side + ": stop too close for this broker, skipped");

   lastTradedShape = shapeTime;   // one attempt per shape, even if it fails
   bool ok = (s.type > 0) ? trade.Buy(lots, _Symbol, 0.0, sl, tp, InpComment)
                          : trade.Sell(lots, _Symbol, 0.0, sl, tp, InpComment);
   if(!ok)
   {
      PrintFormat("ITH BTMM EA: %s failed, code %d (%s)", side, trade.ResultRetcode(), trade.ResultRetcodeDescription());
      return("ENTRY " + side + ": order failed, see Experts tab");
   }
   PrintFormat("ITH BTMM EA: %s %s %.2f lots, SL %s, TP %s", side, _Symbol, lots,
               DoubleToString(sl, _Digits), DoubleToString(tp, _Digits));
   return("ENTRY " + side + ": trade placed");
}

//+------------------------------------------------------------------+
bool HasOpenTrade()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      if(PositionGetString(POSITION_SYMBOL) == _Symbol &&
         PositionGetInteger(POSITION_MAGIC) == InpMagic)
         return(true);
   }
   return(false);
}

//+------------------------------------------------------------------+
//| Broker minimum distance between price and SL / TP                 |
//+------------------------------------------------------------------+
bool StopsAreValid(const int type, const double sl, const double tp)
{
   double minDist = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL) * _Point;
   double price   = (type > 0) ? SymbolInfoDouble(_Symbol, SYMBOL_ASK)
                               : SymbolInfoDouble(_Symbol, SYMBOL_BID);
   return(MathAbs(price - sl) > minDist && MathAbs(tp - price) > minDist);
}

//+------------------------------------------------------------------+
//| Trade plan (same as the indicator)                                |
//| Sell: SL above the M top. Buy: SL below the W bottom.             |
//| TP = entry +/- risk x RR. Lots sized to InpRiskPct of balance.    |
//| Returns false if price has already passed the stop.               |
//+------------------------------------------------------------------+
bool MakePlan(const Shape &s, double &sl, double &tp, double &lots)
{
   double buf = s.atr * InpSlBufferAtr;
   double entry;
   if(s.type > 0)
   {
      entry = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
      sl    = MathMin(s.pa, s.pc) - buf;
      if(entry <= sl) return(false);
      tp    = entry + (entry - sl) * InpRR;
   }
   else
   {
      entry = SymbolInfoDouble(_Symbol, SYMBOL_BID);
      sl    = MathMax(s.pa, s.pc) + buf;
      if(entry >= sl) return(false);
      tp    = entry - (sl - entry) * InpRR;
   }
   sl = NormalizeDouble(sl, _Digits);
   tp = NormalizeDouble(tp, _Digits);

   double dist     = MathAbs(entry - sl);
   double tickSize = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   double tickVal  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double risk     = AccountInfoDouble(ACCOUNT_BALANCE) * InpRiskPct / 100.0;
   lots = 0.0;
   if(dist <= 0.0 || tickSize <= 0.0 || tickVal <= 0.0)
      return(false);
   lots = risk / (dist / tickSize * tickVal);
   double step = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   double vmin = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double vmax = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   if(step > 0.0) lots = MathFloor(lots / step) * step;
   lots = NormalizeDouble(MathMax(vmin, MathMin(vmax, lots)), 2);
   return(true);
}

//+------------------------------------------------------------------+
//| Shape detection: copied from ITH_BTMM_MW v0.4 so both match       |
//+------------------------------------------------------------------+
int Detect(const MqlRates &r[], const int total, Shape &sh[])
{
   ArrayResize(sh, 0);
   int P = InpAtrPeriod;
   if(total < InpMajorBars + InpSwingBars * 2 + P + 5)
      return(0);

   //--- ATR (simple average of true range)
   double tr[], atr[];
   ArrayResize(tr, total);
   ArrayResize(atr, total);
   tr[0] = r[0].high - r[0].low;
   for(int i = 1; i < total; i++)
      tr[i] = MathMax(r[i].high, r[i - 1].close) - MathMin(r[i].low, r[i - 1].close);
   double sum = 0.0;
   for(int i = 0; i < total; i++)
   {
      sum += tr[i];
      if(i >= P) sum -= tr[i - P];
      atr[i] = (i >= P - 1) ? sum / P : 0.0;
   }

   int lastClosed = total - 2;

   //--- swing points
   Pivot piv[];
   int n = 0;
   for(int i = InpSwingBars; i <= lastClosed - InpSwingBars; i++)
   {
      bool isH = true, isL = true;
      for(int j = 1; j <= InpSwingBars; j++)
      {
         if(r[i - j].high > r[i].high || r[i + j].high >= r[i].high) isH = false;
         if(r[i - j].low  < r[i].low  || r[i + j].low  <= r[i].low)  isL = false;
         if(!isH && !isL) break;
      }
      if(isH) AddPivot(piv, n, i, r[i].high, 1);
      if(isL) AddPivot(piv, n, i, r[i].low, -1);
   }

   //--- shapes
   int ns = 0;
   for(int k = 0; k + 2 < n; k++)
   {
      Pivot a = piv[k];
      Pivot b = piv[k + 1];
      Pivot c = piv[k + 2];

      double av = atr[c.idx];
      if(av <= 0.0) continue;
      if(MathAbs(a.price - c.price) > InpTolAtr * av) continue;

      int from = c.idx + InpSwingBars;   // second low/high is only known here
      int to   = MathMin(c.idx + InpMaxBarsToBreak, lastClosed);

      if(a.type == -1)   // W (PFL), buy
      {
         double bottom = MathMin(a.price, c.price);
         if(b.price - MathMax(a.price, c.price) < InpMinHeightAtr * av) continue;
         if(!IsLowest(r, bottom, a.idx - InpMajorBars, c.idx))          continue;

         for(int i = c.idx + 1; i <= to; i++)
         {
            if(r[i].close < bottom) break;
            if(i >= from && r[i].close > b.price)
            {
               AddShape(sh, ns, 1, a, b, c, i, r, atr[i]);
               break;
            }
         }
      }
      else               // M (PFH), sell
      {
         double top = MathMax(a.price, c.price);
         if(MathMin(a.price, c.price) - b.price < InpMinHeightAtr * av) continue;
         if(!IsHighest(r, top, a.idx - InpMajorBars, c.idx))            continue;

         for(int i = c.idx + 1; i <= to; i++)
         {
            if(r[i].close > top) break;
            if(i >= from && r[i].close < b.price)
            {
               AddShape(sh, ns, -1, a, b, c, i, r, atr[i]);
               break;
            }
         }
      }
   }
   return(ns);
}

//+------------------------------------------------------------------+
void AddShape(Shape &sh[], int &ns, const int type, const Pivot &a, const Pivot &b,
              const Pivot &c, const int brk, const MqlRates &r[], const double atr)
{
   ArrayResize(sh, ns + 1, 50);
   sh[ns].type = type;
   sh[ns].ia = a.idx;  sh[ns].pa = a.price;  sh[ns].ta = r[a.idx].time;
   sh[ns].ib = b.idx;  sh[ns].pb = b.price;  sh[ns].tb = r[b.idx].time;
   sh[ns].ic = c.idx;  sh[ns].pc = c.price;  sh[ns].tc = r[c.idx].time;
   sh[ns].ibrk = brk;  sh[ns].pbrk = r[brk].close;  sh[ns].tbrk = r[brk].time;
   sh[ns].hbrk = r[brk].high;
   sh[ns].lbrk = r[brk].low;
   sh[ns].atr  = atr;
   ns++;
}

//+------------------------------------------------------------------+
bool IsLowest(const MqlRates &r[], const double v, int from, const int to)
{
   if(from < 0) from = 0;
   for(int i = from; i <= to; i++)
      if(r[i].low < v) return(false);
   return(true);
}

bool IsHighest(const MqlRates &r[], const double v, int from, const int to)
{
   if(from < 0) from = 0;
   for(int i = from; i <= to; i++)
      if(r[i].high > v) return(false);
   return(true);
}

//+------------------------------------------------------------------+
void AddPivot(Pivot &p[], int &n, const int idx, const double price, const int type)
{
   if(n > 0 && p[n - 1].type == type)
   {
      if((type == 1 && price > p[n - 1].price) || (type == -1 && price < p[n - 1].price))
      {
         p[n - 1].idx   = idx;
         p[n - 1].price = price;
      }
      return;
   }
   ArrayResize(p, n + 1, 100);
   p[n].idx   = idx;
   p[n].price = price;
   p[n].type  = type;
   n++;
}

//+------------------------------------------------------------------+
//| Last confirmed shape on a timeframe                               |
//+------------------------------------------------------------------+
bool GetTfState(const ENUM_TIMEFRAMES tf, int &dir, datetime &tbrk, bool &fresh, Shape &last)
{
   dir = 0; tbrk = 0; fresh = false;
   MqlRates r[];
   int got = CopyRates(_Symbol, tf, 0, InpHistoryBars, r);
   if(got < 200)
      return(false);   // history still loading

   Shape sh[];
   int ns = Detect(r, got, sh);
   if(ns > 0)
   {
      last  = sh[ns - 1];
      dir   = sh[ns - 1].type;
      tbrk  = sh[ns - 1].tbrk;
      fresh = ((got - 2) - sh[ns - 1].ibrk) < InpFreshBars;
   }
   return(true);
}

string TfName(const ENUM_TIMEFRAMES tf)
{
   ENUM_TIMEFRAMES t = (tf == PERIOD_CURRENT) ? (ENUM_TIMEFRAMES)_Period : tf;
   return(StringSubstr(EnumToString(t), 7));   // "PERIOD_H4" -> "H4"
}
