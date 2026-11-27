//+------------------------------------------------------------------+
//| ITH_InfluenceX_EA.mq5                                            |
//| Influence Trading House - InfluenceX Expert Advisor, v0.4        |
//| Idea (Pedro): catch reversals at major zones, ride the new trend.|
//| 1. Map support and resistance zones on the Daily chart.          |
//| 2. Price comes up into resistance (or down into support).        |
//| 3. An M (double top) forms at resistance, or a W (double         |
//|    bottom) at support. Entry when price breaks the neckline.     |
//| 4. Optional: MACD divergence between the two tops / bottoms.     |
//| 5. Optional: EMA 9/21/55 confirmation (off by default).          |
//| 6. SL beyond the M top / W bottom, TP 2R. Risk 0.25% per trade.  |
//| v0.4: big trend rule from the ITH S&R book. Buy W at support     |
//|    only in a Daily uptrend (EMA 9 > 21 > 55), sell M at          |
//|    resistance only in a Daily downtrend (EMA 55 > 21 > 9).       |
//| SAFETY: trades only in the Strategy Tester unless InpAllowLive.   |
//+------------------------------------------------------------------+
#property copyright "Influence Trading House"
#property version   "0.40"
#property description "InfluenceX EA v0.4: M/W reversals at daily zones, with the Daily trend. Backtest first."

#include <Trade/Trade.mqh>

input group "Zones (support and resistance)"
input ENUM_TIMEFRAMES InpZoneTf          = PERIOD_D1; // Timeframe for zones
input int             InpZoneBars        = 300;       // Bars used to find zones
input int             InpZoneSwing       = 3;         // Bars each side to confirm a turning point
input double          InpZoneMergeAtr    = 0.5;       // Turning points this close (in ATR) form one zone
input double          InpZoneMinWidthAtr = 0.2;       // Minimum zone thickness (in ATR)
input int             InpMinTouches      = 2;         // A zone needs at least this many touches
input double          InpZoneTolAtr      = 0.1;       // M tops / W bottoms may miss the zone by this many zone ATR

input group "M and W (entry chart)"
input ENUM_TIMEFRAMES InpEntryTf       = PERIOD_H1; // Entry timeframe
input int             InpLookBars      = 60;        // Bars to look back for the M / W
input int             InpRecentBars    = 12;        // Second top / bottom must be within this many bars
input double          InpMwTolAtr      = 1.0;       // The two tops (or bottoms) within this many ATR
input double          InpMinHeightAtr  = 1.0;       // Neckline at least this many ATR from the tops / bottoms
input int             InpApproachBars  = 10;        // Price must come from outside the zone this many bars before

input group "Big trend (new in v0.4)"
input int             InpTrendMode = 2;         // 0 = off, 1 = EMA 21 vs 55, 2 = full EMA 9 / 21 / 55 line-up
input ENUM_TIMEFRAMES InpTrendTf   = PERIOD_D1; // Timeframe for the big trend

input group "Extra confirmations"
input bool InpRequireDivergence = false; // Also require MACD divergence
input int  InpMacdFast          = 12;    // MACD fast EMA
input int  InpMacdSlow          = 26;    // MACD slow EMA
input int  InpMacdSignal        = 9;     // MACD signal
input bool InpUseEma            = false; // Also require EMA 9 / 21 / 55 in the trade direction (H1)
input int  InpEmaFast           = 9;     // Fast EMA (white)
input int  InpEmaMid            = 21;    // Middle EMA (yellow)
input int  InpEmaSlow           = 55;    // Slow EMA (green)

input group "Trade plan"
input double InpSlBufferAtr  = 0.3;    // Stop loss beyond the M top / W bottom (entry ATR)
input double InpMaxSlAtrZone = 1.5;    // Skip if stop is further than this many zone ATR. 0 = off
input double InpRR           = 2.0;    // Take profit = this many times the risk
input double InpRiskPct      = 0.25;   // Risk per trade, % of balance
input bool   InpAllowBuys    = true;   // Allow buy trades
input bool   InpAllowSells   = true;   // Allow sell trades

input group "Loss limits"
input double InpMaxDailyLossPct = 3.0;   // Stop new trades for the day after this loss (%). 0 = off
input double InpMaxTotalLossPct = 8.0;   // Stop trading for good after this loss (%). 0 = off

input group "Safety and display"
input bool   InpAllowLive    = false;        // Allow real orders outside the Strategy Tester
input int    InpMaxSpreadPts = 0;            // Skip if spread is above this (points). 0 = off
input long   InpMagic        = 260101;       // ID for this EA's trades
input string InpComment      = "InfluenceX"; // Order comment (ITH reads it as the strategy)
input bool   InpDrawZones    = true;         // Draw zones on the chart

struct Zone
{
   double lo;
   double hi;
   int    touches;
};

struct Setup
{
   int      dir;      // +1 W buy, -1 M sell
   int      zone;     // zone index
   double   extreme;  // M top (highest) or W bottom (lowest)
   double   neck;     // neckline
   datetime t2;       // time of the second top / bottom
   bool     div;      // MACD divergence present
};

CTrade   trade;
int      hMacd = INVALID_HANDLE, hAtrE = INVALID_HANDLE, hAtrZ = INVALID_HANDLE;
int      hFast = INVALID_HANDLE, hMid  = INVALID_HANDLE, hSlow = INVALID_HANDLE;
int      hFastT = INVALID_HANDLE, hMidT = INVALID_HANDLE, hSlowT = INVALID_HANDLE;
Zone     zones[];
double   zoneAtr         = 0.0;
datetime zonesBar        = 0;
datetime lastEntryBar    = 0;
datetime lastTradedShape = 0;
double   startBalance    = 0.0;
datetime dayStart        = 0;
double   dayStartBalance = 0.0;

//+------------------------------------------------------------------+
int OnInit()
{
   trade.SetExpertMagicNumber(InpMagic);
   trade.SetTypeFillingBySymbol(_Symbol);
   trade.SetDeviationInPoints(20);

   hMacd = iMACD(_Symbol, InpEntryTf, InpMacdFast, InpMacdSlow, InpMacdSignal, PRICE_CLOSE);
   hAtrE = iATR(_Symbol, InpEntryTf, 14);
   hAtrZ = iATR(_Symbol, InpZoneTf, 14);
   hFast = iMA(_Symbol, InpEntryTf, InpEmaFast, 0, MODE_EMA, PRICE_CLOSE);
   hMid  = iMA(_Symbol, InpEntryTf, InpEmaMid,  0, MODE_EMA, PRICE_CLOSE);
   hSlow = iMA(_Symbol, InpEntryTf, InpEmaSlow, 0, MODE_EMA, PRICE_CLOSE);
   hFastT = iMA(_Symbol, InpTrendTf, InpEmaFast, 0, MODE_EMA, PRICE_CLOSE);
   hMidT  = iMA(_Symbol, InpTrendTf, InpEmaMid,  0, MODE_EMA, PRICE_CLOSE);
   hSlowT = iMA(_Symbol, InpTrendTf, InpEmaSlow, 0, MODE_EMA, PRICE_CLOSE);
   if(hMacd == INVALID_HANDLE || hAtrE == INVALID_HANDLE || hAtrZ == INVALID_HANDLE ||
      hFast == INVALID_HANDLE || hMid == INVALID_HANDLE || hSlow == INVALID_HANDLE ||
      hFastT == INVALID_HANDLE || hMidT == INVALID_HANDLE || hSlowT == INVALID_HANDLE)
   {
      Print("InfluenceX EA: could not create indicators");
      return(INIT_FAILED);
   }
   startBalance = AccountInfoDouble(ACCOUNT_BALANCE);
   if(!MQLInfoInteger(MQL_TESTER) && !InpAllowLive)
      Print("InfluenceX EA: live trading is OFF (InpAllowLive = false). It will only show status.");
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   IndicatorRelease(hMacd); IndicatorRelease(hAtrE); IndicatorRelease(hAtrZ);
   IndicatorRelease(hFast); IndicatorRelease(hMid);  IndicatorRelease(hSlow);
   IndicatorRelease(hFastT); IndicatorRelease(hMidT); IndicatorRelease(hSlowT);
   ObjectsDeleteAll(0, "IFX_");
   Comment("");
}

//+------------------------------------------------------------------+
void OnTick()
{
   datetime barTime = iTime(_Symbol, InpEntryTf, 0);
   if(barTime == 0 || barTime == lastEntryBar)
      return;

   datetime today = iTime(_Symbol, PERIOD_D1, 0);
   if(today != 0 && today != dayStart)
   {
      dayStart        = today;
      dayStartBalance = AccountInfoDouble(ACCOUNT_BALANCE);
   }

   datetime zBar = iTime(_Symbol, InpZoneTf, 0);
   if(zBar != 0 && zBar != zonesBar)
   {
      if(!BuildZones())
         return;   // history still loading
      zonesBar = zBar;
   }
   lastEntryBar = barTime;

   Comment("ITH InfluenceX EA v0.4  ", _Symbol, "  zones: ", ArraySize(zones), "\n", CheckSetup());
}

//+------------------------------------------------------------------+
string CheckSetup()
{
   //--- big trend decides which side we look for
   int trend = BigTrend();
   bool lookSell = InpAllowSells && (InpTrendMode == 0 || trend < 0);
   bool lookBuy  = InpAllowBuys  && (InpTrendMode == 0 || trend > 0);
   if(InpTrendMode != 0 && trend == 0)
      return("WAIT: " + EnumToString(InpTrendTf) + " trend is mixed, no trades");
   string bias = (InpTrendMode == 0) ? "" : ((trend > 0) ? "Daily trend UP: looking for W at support. "
                                                         : "Daily trend DOWN: looking for M at resistance. ");

   Setup s;
   string found = "";
   if(lookSell && FindReversal(-1, s))      found = "sell";
   else if(lookBuy && FindReversal(1, s))   found = "buy";
   if(found == "")
      return(bias + "WAIT: no setup yet");

   string side = (s.dir > 0) ? "BUY" : "SELL";
   string shape = (s.dir > 0) ? "W at support" : "M at resistance";
   if(s.t2 == lastTradedShape)
      return(side + ": " + shape + " already traded");
   if(InpRequireDivergence && !s.div)
      return(side + ": " + shape + ", waiting: no MACD divergence");
   if(InpUseEma && EmaState(hFast, hMid, hSlow, 1) != s.dir)
      return(side + ": " + shape + ", waiting: EMAs not lined up");

   string block = LossBlock();
   if(block != "")
      return(block);
   return(TryTrade(s));
}

//+------------------------------------------------------------------+
//| Find a fresh M (dir -1) at resistance or W (dir +1) at support    |
//| whose neckline was broken by the last closed bar.                 |
//+------------------------------------------------------------------+
bool FindReversal(const int dir, Setup &s)
{
   int n = InpLookBars;
   MqlRates r[];
   double macd[], atr[];
   ArraySetAsSeries(r, true);
   ArraySetAsSeries(macd, true);
   ArraySetAsSeries(atr, true);
   if(CopyRates(_Symbol, InpEntryTf, 1, n, r) != n)    return(false);
   if(CopyBuffer(hMacd, 0, 1, n, macd) != n)           return(false);
   if(CopyBuffer(hAtrE, 0, 1, 1, atr) != 1 || atr[0] <= 0.0) return(false);
   double a = atr[0];

   //--- two most recent swing highs (M) or lows (W); p1 newer, p2 older
   int p1 = -1, p2 = -1;
   for(int i = 2; i < n - 2; i++)
   {
      bool sw;
      if(dir < 0)
         sw = r[i].high > r[i - 1].high && r[i].high > r[i - 2].high && r[i].high >= r[i + 1].high && r[i].high >= r[i + 2].high;
      else
         sw = r[i].low < r[i - 1].low && r[i].low < r[i - 2].low && r[i].low <= r[i + 1].low && r[i].low <= r[i + 2].low;
      if(!sw) continue;
      if(p1 < 0) p1 = i;
      else { p2 = i; break; }
   }
   if(p1 < 0 || p2 < 0 || p1 > InpRecentBars) return(false);

   double v1 = (dir < 0) ? r[p1].high : r[p1].low;
   double v2 = (dir < 0) ? r[p2].high : r[p2].low;
   if(MathAbs(v1 - v2) > InpMwTolAtr * a) return(false);

   //--- neckline: lowest low between two tops (M) / highest high between two bottoms (W)
   double neck = (dir < 0) ? r[p1].low : r[p1].high;
   for(int i = p1 + 1; i < p2; i++)
      neck = (dir < 0) ? MathMin(neck, r[i].low) : MathMax(neck, r[i].high);
   double extreme = (dir < 0) ? MathMax(v1, v2) : MathMin(v1, v2);
   if(MathAbs(extreme - neck) < InpMinHeightAtr * a) return(false);

   //--- neckline broken by the last closed bar, not before it
   if(dir < 0 && !(r[0].close < neck && r[1].close >= neck)) return(false);
   if(dir > 0 && !(r[0].close > neck && r[1].close <= neck)) return(false);

   //--- the tops / bottoms must sit on a zone, and price must have come from outside it
   double tol = InpZoneTolAtr * zoneAtr;
   int ap = MathMin(p2 + InpApproachBars, n - 1);
   int best = -1;
   for(int z = 0; z < ArraySize(zones); z++)
   {
      if(dir < 0)
      {
         if(extreme < zones[z].lo - tol || MathMin(v1, v2) > zones[z].hi + tol) continue;
         if(r[ap].close >= zones[z].lo) continue;          // did not come up from below
      }
      else
      {
         if(extreme > zones[z].hi + tol || MathMax(v1, v2) < zones[z].lo - tol) continue;
         if(r[ap].close <= zones[z].hi) continue;          // did not come down from above
      }
      best = z;
      break;
   }
   if(best < 0) return(false);

   s.dir     = dir;
   s.zone    = best;
   s.extreme = extreme;
   s.neck    = neck;
   s.t2      = r[p1].time;
   //--- MACD divergence: second top has lower MACD (M) / second bottom higher MACD (W)
   s.div     = (dir < 0) ? (macd[p1] < macd[p2]) : (macd[p1] > macd[p2]);
   return(true);
}

//+------------------------------------------------------------------+
//| Zones: turning points on the zone timeframe, grouped together     |
//+------------------------------------------------------------------+
bool BuildZones()
{
   ArrayResize(zones, 0);
   MqlRates r[];
   ArraySetAsSeries(r, false);   // oldest first
   int got = CopyRates(_Symbol, InpZoneTf, 1, InpZoneBars, r);
   if(got < InpZoneSwing * 2 + 20)
      return(false);
   double a[];
   if(CopyBuffer(hAtrZ, 0, 1, 1, a) != 1 || a[0] <= 0.0)
      return(false);
   zoneAtr = a[0];

   double lv[];
   int n = 0;
   for(int i = InpZoneSwing; i < got - InpZoneSwing; i++)
   {
      bool isH = true, isL = true;
      for(int j = 1; j <= InpZoneSwing; j++)
      {
         if(r[i - j].high > r[i].high || r[i + j].high > r[i].high) isH = false;
         if(r[i - j].low  < r[i].low  || r[i + j].low  < r[i].low)  isL = false;
      }
      if(isH) { ArrayResize(lv, n + 1, 100); lv[n++] = r[i].high; }
      if(isL) { ArrayResize(lv, n + 1, 100); lv[n++] = r[i].low; }
   }
   if(n == 0)
      return(true);
   ArraySort(lv);

   int nz = 0, i = 0;
   while(i < n)
   {
      double lo = lv[i], hi = lv[i];
      int cnt = 1, k = i + 1;
      while(k < n && lv[k] - lo <= InpZoneMergeAtr * zoneAtr)
      {
         hi = lv[k];
         cnt++;
         k++;
      }
      if(cnt >= InpMinTouches)
      {
         double mid  = (lo + hi) / 2.0;
         double half = MathMax((hi - lo) / 2.0, InpZoneMinWidthAtr * zoneAtr / 2.0);
         ArrayResize(zones, nz + 1);
         zones[nz].lo = mid - half;
         zones[nz].hi = mid + half;
         zones[nz].touches = cnt;
         nz++;
      }
      i = k;
   }
   if(InpDrawZones)
      DrawZones(r[0].time);
   return(true);
}

void DrawZones(const datetime from)
{
   ObjectsDeleteAll(0, "IFX_Z");
   double price = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   datetime to = TimeCurrent() + PeriodSeconds(PERIOD_D1) * 5;
   for(int i = 0; i < ArraySize(zones); i++)
   {
      string name = "IFX_Z" + IntegerToString(i);
      ObjectCreate(0, name, OBJ_RECTANGLE, 0, from, zones[i].lo, to, zones[i].hi);
      color c = (zones[i].hi < price) ? clrGreen : (zones[i].lo > price ? clrRed : clrGray);
      ObjectSetInteger(0, name, OBJPROP_COLOR, c);
      ObjectSetInteger(0, name, OBJPROP_FILL, true);
      ObjectSetInteger(0, name, OBJPROP_BACK, true);
      ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
   }
}

//+------------------------------------------------------------------+
//| +1 = EMA 9 > 21 > 55, -1 = EMA 9 < 21 < 55, 0 = mixed             |
//+------------------------------------------------------------------+
int EmaState(const int hf, const int hm, const int hs, const int shift)
{
   double f[], m[], s[];
   if(CopyBuffer(hf, 0, shift, 1, f) != 1) return(0);
   if(CopyBuffer(hm, 0, shift, 1, m) != 1) return(0);
   if(CopyBuffer(hs, 0, shift, 1, s) != 1) return(0);
   if(f[0] > m[0] && m[0] > s[0]) return(1);
   if(f[0] < m[0] && m[0] < s[0]) return(-1);
   return(0);
}

//+------------------------------------------------------------------+
//| Big trend on InpTrendTf (last closed bar)                         |
//| mode 2: EMA 9 > 21 > 55 = up, 55 > 21 > 9 = down, else mixed      |
//| mode 1: EMA 21 above 55 = up, below = down                        |
//+------------------------------------------------------------------+
int BigTrend()
{
   if(InpTrendMode == 2)
      return(EmaState(hFastT, hMidT, hSlowT, 1));
   if(InpTrendMode == 1)
   {
      double m[], s[];
      if(CopyBuffer(hMidT,  0, 1, 1, m) != 1) return(0);
      if(CopyBuffer(hSlowT, 0, 1, 1, s) != 1) return(0);
      if(m[0] > s[0]) return(1);
      if(m[0] < s[0]) return(-1);
   }
   return(0);
}

//+------------------------------------------------------------------+
string LossBlock()
{
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   if(InpMaxTotalLossPct > 0.0 && equity <= startBalance * (1.0 - InpMaxTotalLossPct / 100.0))
      return("STOPPED: max total loss reached, no more trades");
   if(InpMaxDailyLossPct > 0.0 && dayStartBalance > 0.0 &&
      equity <= dayStartBalance * (1.0 - InpMaxDailyLossPct / 100.0))
      return("PAUSED: daily loss limit reached, back tomorrow");
   return("");
}

//+------------------------------------------------------------------+
string TryTrade(const Setup &s)
{
   string side = (s.dir > 0) ? "BUY" : "SELL";
   if(HasOpenTrade())
      return("ENTRY " + side + ": skipped, a trade is already open");
   if(!MQLInfoInteger(MQL_TESTER) && !InpAllowLive)
      return("ENTRY " + side + ": signal only (live trading is off)");
   if(InpMaxSpreadPts > 0 && SymbolInfoInteger(_Symbol, SYMBOL_SPREAD) > InpMaxSpreadPts)
      return("ENTRY " + side + ": skipped, spread too high");

   double a[];
   if(CopyBuffer(hAtrE, 0, 1, 1, a) != 1) return("WAIT: loading ATR");
   double buf = a[0] * InpSlBufferAtr;

   double entry = (s.dir > 0) ? SymbolInfoDouble(_Symbol, SYMBOL_ASK) : SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double sl    = (s.dir > 0) ? s.extreme - buf : s.extreme + buf;
   double risk  = (s.dir > 0) ? entry - sl : sl - entry;
   lastTradedShape = s.t2;   // one attempt per M / W
   if(risk <= 0.0)
      return("ENTRY " + side + ": price already past the stop");
   if(InpMaxSlAtrZone > 0.0 && risk > InpMaxSlAtrZone * zoneAtr)
      return("ENTRY " + side + ": skipped, stop too far");

   double tp = (s.dir > 0) ? entry + risk * InpRR : entry - risk * InpRR;
   sl = NormalizeDouble(sl, _Digits);
   tp = NormalizeDouble(tp, _Digits);
   if(!StopsAreValid(s.dir, sl, tp))
      return("ENTRY " + side + ": stop too close for this broker, skipped");

   double lots = CalcLots(risk);
   if(lots <= 0.0)
      return("ENTRY " + side + ": lot size error");

   string why = (s.dir > 0) ? "W at support" : "M at resistance";
   if(s.div) why += " + MACD divergence";
   bool ok = (s.dir > 0) ? trade.Buy(lots, _Symbol, 0.0, sl, tp, InpComment)
                         : trade.Sell(lots, _Symbol, 0.0, sl, tp, InpComment);
   if(!ok)
   {
      PrintFormat("InfluenceX EA: %s failed, code %d (%s)", side, trade.ResultRetcode(), trade.ResultRetcodeDescription());
      return("ENTRY " + side + ": order failed, see Experts tab");
   }
   PrintFormat("InfluenceX EA: %s %s %.2f lots, SL %s, TP %s, %s", side, _Symbol, lots,
               DoubleToString(sl, _Digits), DoubleToString(tp, _Digits), why);
   return("ENTRY " + side + ": trade placed (" + why + ")");
}

//+------------------------------------------------------------------+
double CalcLots(const double dist)
{
   double tickSize = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   double tickVal  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   if(dist <= 0.0 || tickSize <= 0.0 || tickVal <= 0.0)
      return(0.0);
   double risk = AccountInfoDouble(ACCOUNT_BALANCE) * InpRiskPct / 100.0;
   double lots = risk / (dist / tickSize * tickVal);
   double step = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   double vmin = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double vmax = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   if(step > 0.0) lots = MathFloor(lots / step) * step;
   return(NormalizeDouble(MathMax(vmin, MathMin(vmax, lots)), 2));
}

bool HasOpenTrade()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      if(PositionGetString(POSITION_SYMBOL) == _Symbol && PositionGetInteger(POSITION_MAGIC) == InpMagic)
         return(true);
   }
   return(false);
}

bool StopsAreValid(const int dir, const double sl, const double tp)
{
   double minDist = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL) * _Point;
   double price   = (dir > 0) ? SymbolInfoDouble(_Symbol, SYMBOL_ASK) : SymbolInfoDouble(_Symbol, SYMBOL_BID);
   return(MathAbs(price - sl) > minDist && MathAbs(tp - price) > minDist);
}
//+------------------------------------------------------------------+
