//+------------------------------------------------------------------+
//| ITH_BTMM_MW.mq5                                                  |
//| Influence Trading House - BTMM M and W detector, version 0.4     |
//| - Finds W (PFL) and M (PFH) at MAJOR turning points              |
//| - Sell = all red, Buy = all green, BUY / SELL words on arrows    |
//| - Panel: H4 and H1 direction, M15 entry status                   |
//| - Main alert: H4 + H1 agree AND M15 gives the matching shape     |
//| - Trade plan: stop loss, take profit and lot size in panel/alert |
//| Rules: see BTMM_RULES_v1.md                                      |
//+------------------------------------------------------------------+
#property copyright "Influence Trading House"
#property description "BTMM M/W (PFH/PFL) v0.3: multi-timeframe panel and aligned entry alerts"
#property indicator_chart_window
#property indicator_buffers 2
#property indicator_plots   2

#property indicator_label1  "W buy"
#property indicator_type1   DRAW_ARROW
#property indicator_color1  clrLimeGreen
#property indicator_width1  3

#property indicator_label2  "M sell"
#property indicator_type2   DRAW_ARROW
#property indicator_color2  clrRed
#property indicator_width2  3

//--- inputs
input group "Shape detection"
input int    InpSwingBars      = 3;     // Bars each side to confirm a swing high/low
input int    InpAtrPeriod      = 14;    // ATR period (candle size of each timeframe)
input double InpTolAtr         = 1.0;   // Two lows (or highs) must be within this many ATR
input double InpMinHeightAtr   = 1.5;   // Neckline must be at least this many ATR away
input int    InpMajorBars      = 50;    // Low/high must be the extreme of the last N bars
input int    InpMaxBarsToBreak = 30;    // Neckline must break within this many bars
input int    InpLookback       = 3000;  // Bars to scan on this chart

input group "Multi-timeframe panel"
input bool            InpShowPanel = true;
input ENUM_TIMEFRAMES InpTfBig     = PERIOD_H4;   // Direction (big)
input ENUM_TIMEFRAMES InpTfMid     = PERIOD_H1;   // Direction (middle)
input ENUM_TIMEFRAMES InpTfEntry   = PERIOD_M15;  // Entry timeframe
input int             InpFreshBars = 4;           // Entry shape must be this recent (entry TF bars)

input group "Trade plan"
input double InpSlBufferAtr = 0.2;    // Stop loss distance beyond the M top / W bottom (in ATR)
input double InpRR          = 2.0;    // Take profit = this many times the risk
input double InpRiskPct     = 0.25;   // Risk per trade, % of balance (used for lot size)

input group "Colors"
input color  InpBuyColor  = clrLimeGreen;
input color  InpSellColor = clrRed;
input color  InpTextColor = clrWhite;
input color  InpWaitColor = clrSilver;

input group "Alerts"
input bool   InpAlertAligned = true;   // Alert when H4 + H1 agree and entry TF confirms
input bool   InpAlertChart   = true;   // Alert on any new shape on THIS chart's timeframe
input bool   InpPopup        = true;   // Pop-up alert in MT5
input bool   InpPush         = true;   // Push alert to MT5 on phone
input bool   InpTestAlert    = false;  // Send one test alert when the indicator loads

//--- buffers and state
double   BuyBuf[], SellBuf[];
datetime lastBarTime      = 0;
datetime lastChartAlert   = 0;
datetime lastAlignedAlert = 0;
const string PFX = "ITH_MW_";

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
   SetIndexBuffer(0, BuyBuf,  INDICATOR_DATA);
   SetIndexBuffer(1, SellBuf, INDICATOR_DATA);
   PlotIndexSetInteger(0, PLOT_ARROW, 233);   // up arrow
   PlotIndexSetInteger(1, PLOT_ARROW, 234);   // down arrow
   PlotIndexSetInteger(0, PLOT_LINE_COLOR, InpBuyColor);
   PlotIndexSetInteger(1, PLOT_LINE_COLOR, InpSellColor);
   PlotIndexSetDouble(0, PLOT_EMPTY_VALUE, EMPTY_VALUE);
   PlotIndexSetDouble(1, PLOT_EMPTY_VALUE, EMPTY_VALUE);
   IndicatorSetString(INDICATOR_SHORTNAME, "ITH BTMM M/W v0.4");

   EventSetTimer(60);   // refresh the panel every minute

   if(InpTestAlert)
      SendAlert("ITH test alert: alerts are working on " + _Symbol);

   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   ObjectsDeleteAll(0, PFX);
}

//+------------------------------------------------------------------+
void OnTimer()
{
   UpdatePanel();
   ChartRedraw();
}

//+------------------------------------------------------------------+
int OnCalculate(const int rates_total,
                const int prev_calculated,
                const datetime &time[],
                const double &open[],
                const double &high[],
                const double &low[],
                const double &close[],
                const long &tick_volume[],
                const long &volume[],
                const int &spread[])
{
   if(rates_total < 100)
      return(0);

   //--- work once per new bar (signals use closed candles only)
   if(prev_calculated > 0 && time[rates_total - 1] == lastBarTime)
      return(rates_total);

   int count = MathMin(rates_total, InpLookback + InpMajorBars + InpAtrPeriod + 10);
   MqlRates r[];
   if(CopyRates(_Symbol, _Period, 0, count, r) != count)
      return(0);   // data not ready, try next tick

   lastBarTime = time[rates_total - 1];
   int offset  = rates_total - count;

   ArrayInitialize(BuyBuf,  EMPTY_VALUE);
   ArrayInitialize(SellBuf, EMPTY_VALUE);
   ObjectsDeleteAll(0, PFX + "S_");

   Shape sh[];
   int ns = Detect(r, count, sh);

   for(int k = 0; k < ns; k++)
   {
      int bi = offset + sh[k].ibrk;
      if(sh[k].type > 0) BuyBuf[bi]  = sh[k].lbrk - sh[k].atr * 0.5;
      else               SellBuf[bi] = sh[k].hbrk + sh[k].atr * 0.5;
      DrawShape(sh[k]);
   }

   UpdatePanel();   // also sends the aligned alert

   //--- alert for a new shape on this chart's own timeframe
   if(InpAlertChart && ns > 0)
   {
      Shape s = sh[ns - 1];
      if(s.ibrk == count - 2 && s.tbrk != lastChartAlert)
      {
         lastChartAlert = s.tbrk;
         bool dup = (_Period == InpTfEntry && s.tbrk == lastAlignedAlert);
         if(!dup)
            SendAlert(StringFormat("ITH %s %s: %s confirmed at %s",
                      _Symbol, TfName(_Period),
                      s.type > 0 ? "W (PFL) BUY" : "M (PFH) SELL",
                      DoubleToString(s.pbrk, _Digits)));
      }
   }

   ChartRedraw();
   return(rates_total);
}

//+------------------------------------------------------------------+
//| Find all confirmed M and W shapes in a block of candles          |
//| r[] must be oldest first. Last candle (forming) is ignored.      |
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
//| Last confirmed shape on another timeframe                         |
//+------------------------------------------------------------------+
bool GetTfState(const ENUM_TIMEFRAMES tf, int &dir, datetime &tbrk, bool &fresh, Shape &last)
{
   dir = 0; tbrk = 0; fresh = false;
   MqlRates r[];
   int got = CopyRates(_Symbol, tf, 0, 1500, r);
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

//+------------------------------------------------------------------+
void UpdatePanel()
{
   int dB, dM, dE;
   datetime tB, tM, tE;
   bool fB, fM, fE;
   Shape sB, sM, sE;
   bool okB = GetTfState(InpTfBig,   dB, tB, fB, sB);
   bool okM = GetTfState(InpTfMid,   dM, tM, fM, sM);
   bool okE = GetTfState(InpTfEntry, dE, tE, fE, sE);

   //--- entry decision
   string entry;
   string plan = " ";
   bool   planOn = false;
   double sl = 0.0, tp = 0.0, lots = 0.0;
   color  ec = InpWaitColor;
   string eName = TfName(InpTfEntry);
   if(!okB || !okM || !okE)
      entry = "Loading data...";
   else if(dB != 0 && dB == dM)
   {
      if(dE == dB && fE)
      {
         ec = (dB > 0) ? InpBuyColor : InpSellColor;
         if(MakePlan(sE, sl, tp, lots))
         {
            planOn = true;
            entry  = (dB > 0) ? "ENTRY: BUY now" : "ENTRY: SELL now";
            plan   = StringFormat("SL %s  TP %s  Lots %.2f",
                     DoubleToString(sl, _Digits), DoubleToString(tp, _Digits), lots);
            if(InpAlertAligned && tE != lastAlignedAlert)
            {
               lastAlignedAlert = tE;
               double px = (dB > 0) ? SymbolInfoDouble(_Symbol, SYMBOL_ASK)
                                    : SymbolInfoDouble(_Symbol, SYMBOL_BID);
               SendAlert(StringFormat("ITH %s %s | Entry %s | SL %s | TP %s | Lots %.2f | %s+%s %s, %s %s",
                         (dB > 0) ? "BUY" : "SELL", _Symbol,
                         DoubleToString(px, _Digits), DoubleToString(sl, _Digits),
                         DoubleToString(tp, _Digits), lots,
                         TfName(InpTfBig), TfName(InpTfMid), (dB > 0) ? "up" : "down",
                         eName, (dB > 0) ? "W" : "M"));
            }
         }
         else
         {
            entry = "SETUP FAILED: price passed the stop";
            ec    = InpWaitColor;
         }
      }
      else
      {
         entry = (dB > 0) ? "BIAS BUY: wait for " + eName + " W"
                          : "BIAS SELL: wait for " + eName + " M";
         ec    = (dB > 0) ? InpBuyColor : InpSellColor;
      }
   }
   else
      entry = "WAIT: " + TfName(InpTfBig) + " and " + TfName(InpTfMid) + " disagree";

   if(!InpShowPanel)
      return;

   SetLabel("title", "ITH  BTMM  " + _Symbol, 0, InpTextColor);
   SetLabel("big",   TfLine(InpTfBig,   okB, dB, tB), 1, DirColor(okB, dB));
   SetLabel("mid",   TfLine(InpTfMid,   okM, dM, tM), 2, DirColor(okM, dM));
   SetLabel("ent",   TfLine(InpTfEntry, okE, dE, tE), 3, DirColor(okE, dE));
   SetLabel("entry", entry, 4, ec);
   SetLabel("plan",  plan,  5, ec);

   //--- stop loss and take profit lines on the chart
   if(planOn)
   {
      SetHLine("SL", sl, InpWaitColor, "ITH stop loss");
      SetHLine("TP", tp, ec, "ITH take profit");
   }
   else
   {
      ObjectDelete(0, PFX + "P_SL");
      ObjectDelete(0, PFX + "P_TP");
   }
}

//+------------------------------------------------------------------+
//| Trade plan from the entry-timeframe shape                         |
//| Sell: SL above the M top. Buy: SL below the W bottom.             |
//| TP = entry +/- risk x RR. Lots sized to InpRiskPct of balance.    |
//| Returns false if price has already passed the stop (setup failed)|
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
   if(dist > 0.0 && tickSize > 0.0 && tickVal > 0.0)
   {
      lots = risk / (dist / tickSize * tickVal);
      double step = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
      double vmin = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
      double vmax = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
      if(step > 0.0) lots = MathFloor(lots / step) * step;
      lots = MathMax(vmin, MathMin(vmax, lots));
   }
   return(true);
}

//+------------------------------------------------------------------+
void SetHLine(const string id, const double price, const color clr, const string tip)
{
   string name = PFX + "P_" + id;
   if(ObjectFind(0, name) < 0)
   {
      ObjectCreate(0, name, OBJ_HLINE, 0, 0, price);
      ObjectSetInteger(0, name, OBJPROP_STYLE, STYLE_DASH);
      ObjectSetInteger(0, name, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
   }
   ObjectSetDouble(0,  name, OBJPROP_PRICE, price);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetString(0,  name, OBJPROP_TOOLTIP, tip);
}

//+------------------------------------------------------------------+
string TfLine(const ENUM_TIMEFRAMES tf, const bool ok, const int dir, const datetime t)
{
   string name = TfName(tf);
   while(StringLen(name) < 4) name += " ";
   if(!ok)       return(name + " loading...");
   if(dir == 0)  return(name + " no shape yet");
   string what = (dir > 0) ? "UP    W PFL  " : "DOWN  M PFH  ";
   return(name + " " + what + TimeToString(t, TIME_DATE | TIME_MINUTES));
}

color DirColor(const bool ok, const int dir)
{
   if(!ok || dir == 0) return(InpWaitColor);
   return(dir > 0 ? InpBuyColor : InpSellColor);
}

string TfName(const ENUM_TIMEFRAMES tf)
{
   ENUM_TIMEFRAMES t = (tf == PERIOD_CURRENT) ? (ENUM_TIMEFRAMES)_Period : tf;
   return(StringSubstr(EnumToString(t), 7));   // "PERIOD_H4" -> "H4"
}

//+------------------------------------------------------------------+
void SendAlert(const string msg)
{
   if(InpPopup) Alert(msg);
   if(InpPush)  SendNotification(msg);
}

//+------------------------------------------------------------------+
void SetLabel(const string id, const string text, const int row, const color clr)
{
   string name = PFX + "P_" + id;
   if(ObjectFind(0, name) < 0)
   {
      ObjectCreate(0, name, OBJ_LABEL, 0, 0, 0);
      ObjectSetInteger(0, name, OBJPROP_CORNER,    CORNER_RIGHT_UPPER);
      ObjectSetInteger(0, name, OBJPROP_ANCHOR,    ANCHOR_RIGHT_UPPER);
      ObjectSetInteger(0, name, OBJPROP_XDISTANCE, 12);
      ObjectSetInteger(0, name, OBJPROP_YDISTANCE, 20 + row * 20);
      ObjectSetInteger(0, name, OBJPROP_FONTSIZE,  10);
      ObjectSetString(0,  name, OBJPROP_FONT,      "Consolas");
      ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, name, OBJPROP_HIDDEN,     true);
   }
   ObjectSetString(0,  name, OBJPROP_TEXT,  text);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
}

//+------------------------------------------------------------------+
void DrawShape(const Shape &s)
{
   color  clr = (s.type > 0) ? InpBuyColor : InpSellColor;
   string tag = (s.type > 0) ? "W" : "M";
   string id  = PFX + "S_" + tag + "_" + IntegerToString((long)s.ta) + "_";

   DrawLine(id + "1", s.ta, s.pa, s.tb, s.pb, clr, STYLE_SOLID);
   DrawLine(id + "2", s.tb, s.pb, s.tc, s.pc, clr, STYLE_SOLID);
   DrawLine(id + "3", s.tc, s.pc, s.tbrk, s.pbrk, clr, STYLE_SOLID);
   DrawLine(id + "N", s.tb, s.pb, s.tbrk, s.pb, clr, STYLE_DOT);   // neckline

   //--- shape name at the neckline
   DrawText(id + "L", s.tb, s.pb, (s.type > 0) ? "W  PFL" : "M  PFH", clr,
            (s.type > 0) ? ANCHOR_LOWER : ANCHOR_UPPER);

   //--- BUY / SELL word next to the arrow
   if(s.type > 0)
      DrawText(id + "T", s.tbrk, s.lbrk - s.atr * 1.2, "BUY", clr, ANCHOR_UPPER);
   else
      DrawText(id + "T", s.tbrk, s.hbrk + s.atr * 1.2, "SELL", clr, ANCHOR_LOWER);
}

//+------------------------------------------------------------------+
void DrawText(const string name, const datetime t, const double p, const string text,
              const color clr, const ENUM_ANCHOR_POINT anchor)
{
   ObjectCreate(0, name, OBJ_TEXT, 0, t, p);
   ObjectSetString(0,  name, OBJPROP_TEXT, text);
   ObjectSetString(0,  name, OBJPROP_FONT, "Arial Bold");
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_FONTSIZE, 9);
   ObjectSetInteger(0, name, OBJPROP_ANCHOR, anchor);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
}

//+------------------------------------------------------------------+
void DrawLine(const string name, const datetime t1, const double p1,
              const datetime t2, const double p2, const color clr, const ENUM_LINE_STYLE style)
{
   ObjectCreate(0, name, OBJ_TREND, 0, t1, p1, t2, p2);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_STYLE, style);
   ObjectSetInteger(0, name, OBJPROP_WIDTH, 2);
   ObjectSetInteger(0, name, OBJPROP_RAY_RIGHT, false);
   ObjectSetInteger(0, name, OBJPROP_BACK, true);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
}
//+------------------------------------------------------------------+
