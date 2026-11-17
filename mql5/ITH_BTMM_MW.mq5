//+------------------------------------------------------------------+
//| ITH_BTMM_MW.mq5                                                  |
//| Influence Trading House - BTMM M and W detector, version 0.1     |
//| Finds W (double bottom) and M (double top) shapes, draws them,   |
//| and alerts when a candle CLOSES beyond the neckline.             |
//| Rules: see BTMM_RULES_v1.md. Use on M15.                         |
//+------------------------------------------------------------------+
#property copyright "Influence Trading House"
#property version   "0.10"
#property description "BTMM M and W detector with neckline break alerts"
#property indicator_chart_window
#property indicator_buffers 2
#property indicator_plots   2

#property indicator_label1  "W buy"
#property indicator_type1   DRAW_ARROW
#property indicator_color1  clrLimeGreen
#property indicator_width1  2

#property indicator_label2  "M sell"
#property indicator_type2   DRAW_ARROW
#property indicator_color2  clrRed
#property indicator_width2  2

//--- inputs
input group "Shape detection"
input int    InpSwingBars       = 5;     // Bars each side to confirm a swing high/low
input double InpTolPctAdr       = 10;    // Two lows (or highs) must be within this % of ADR
input double InpMinHeightPctAdr = 15;    // Neckline must be at least this % of ADR from the lows/highs
input int    InpMaxBarsToBreak  = 40;    // Neckline must break within this many bars
input int    InpLookback        = 3000;  // How many bars back to scan
input int    InpAdrDays         = 14;    // Days used for ADR

input group "Drawing"
input bool   InpDrawShapes = true;
input color  InpWColor     = clrLimeGreen;
input color  InpMColor     = clrRed;

input group "Alerts"
input bool   InpPopup = true;   // Pop-up alert in MT5
input bool   InpPush  = true;   // Push alert to MT5 on phone

//--- buffers and state
double   BuyBuf[], SellBuf[];
datetime lastBarTime   = 0;
datetime lastAlertTime = 0;
const string PFX = "ITH_MW_";

struct Pivot
{
   int    idx;
   double price;
   int    type;   // +1 swing high, -1 swing low
};

//+------------------------------------------------------------------+
int OnInit()
{
   SetIndexBuffer(0, BuyBuf,  INDICATOR_DATA);
   SetIndexBuffer(1, SellBuf, INDICATOR_DATA);
   PlotIndexSetInteger(0, PLOT_ARROW, 233);   // up arrow
   PlotIndexSetInteger(1, PLOT_ARROW, 234);   // down arrow
   PlotIndexSetDouble(0, PLOT_EMPTY_VALUE, EMPTY_VALUE);
   PlotIndexSetDouble(1, PLOT_EMPTY_VALUE, EMPTY_VALUE);
   IndicatorSetString(INDICATOR_SHORTNAME, "ITH BTMM M/W");
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   ObjectsDeleteAll(0, PFX);
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
   if(rates_total < InpSwingBars * 2 + 10)
      return(0);

   //--- work only once per new bar (signals use closed candles only)
   if(prev_calculated > 0 && time[rates_total - 1] == lastBarTime)
      return(rates_total);

   double adr = GetAdr();
   if(adr <= 0.0)
      return(0);   // daily data not ready yet, try again next tick

   lastBarTime = time[rates_total - 1];

   ArrayInitialize(BuyBuf,  EMPTY_VALUE);
   ArrayInitialize(SellBuf, EMPTY_VALUE);
   ObjectsDeleteAll(0, PFX);

   int start      = MathMax(InpSwingBars, rates_total - InpLookback);
   int lastClosed = rates_total - 2;

   //--- 1. find swing highs and lows
   Pivot piv[];
   int n = 0;
   for(int i = start; i <= lastClosed - InpSwingBars; i++)
   {
      bool isH = true, isL = true;
      for(int j = 1; j <= InpSwingBars; j++)
      {
         if(high[i - j] > high[i] || high[i + j] >= high[i]) isH = false;
         if(low[i - j]  < low[i]  || low[i + j]  <= low[i])  isL = false;
         if(!isH && !isL) break;
      }
      if(isH) AddPivot(piv, n, i, high[i], 1);
      if(isL) AddPivot(piv, n, i, low[i], -1);
   }

   double tol  = adr * InpTolPctAdr / 100.0;
   double minH = adr * InpMinHeightPctAdr / 100.0;

   //--- 2. look for W (low, high, low) and M (high, low, high)
   for(int k = 0; k + 2 < n; k++)
   {
      Pivot a = piv[k];
      Pivot b = piv[k + 1];
      Pivot c = piv[k + 2];

      if(MathAbs(a.price - c.price) > tol)
         continue;

      int from = c.idx + InpSwingBars;   // second low/high is only known here
      int to   = MathMin(c.idx + InpMaxBarsToBreak, lastClosed);

      if(a.type == -1)   // W
      {
         double bottom = MathMin(a.price, c.price);
         if(b.price - MathMax(a.price, c.price) < minH)
            continue;

         for(int i = c.idx + 1; i <= to; i++)
         {
            if(close[i] < bottom) break;                 // W failed
            if(i >= from && close[i] > b.price)          // neckline break
            {
               BuyBuf[i] = low[i] - adr * 0.05;
               if(InpDrawShapes) DrawShape("W", a, b, c, i, time, close[i], InpWColor);
               Signal(i, lastClosed, time[i], "W confirmed, BUY setup", close[i]);
               break;
            }
         }
      }
      else               // M
      {
         double top = MathMax(a.price, c.price);
         if(MathMin(a.price, c.price) - b.price < minH)
            continue;

         for(int i = c.idx + 1; i <= to; i++)
         {
            if(close[i] > top) break;                    // M failed
            if(i >= from && close[i] < b.price)          // neckline break
            {
               SellBuf[i] = high[i] + adr * 0.05;
               if(InpDrawShapes) DrawShape("M", a, b, c, i, time, close[i], InpMColor);
               Signal(i, lastClosed, time[i], "M confirmed, SELL setup", close[i]);
               break;
            }
         }
      }
   }

   return(rates_total);
}

//+------------------------------------------------------------------+
//| Keep pivots alternating high/low; keep the more extreme one      |
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
//| Alert only for the newest closed candle, once                    |
//+------------------------------------------------------------------+
void Signal(const int i, const int lastClosed, const datetime t, const string what, const double price)
{
   if(i != lastClosed || t == lastAlertTime)
      return;
   lastAlertTime = t;
   string msg = StringFormat("ITH %s %s: %s at %s",
                             _Symbol, EnumToString((ENUM_TIMEFRAMES)_Period), what,
                             DoubleToString(price, _Digits));
   if(InpPopup) Alert(msg);
   if(InpPush)  SendNotification(msg);
}

//+------------------------------------------------------------------+
void DrawShape(const string tag, const Pivot &a, const Pivot &b, const Pivot &c,
               const int brk, const datetime &time[], const double brkPrice, const color clr)
{
   string id = PFX + tag + "_" + IntegerToString(a.idx) + "_";
   DrawLine(id + "1", time[a.idx], a.price, time[b.idx], b.price, clr, STYLE_SOLID);
   DrawLine(id + "2", time[b.idx], b.price, time[c.idx], c.price, clr, STYLE_SOLID);
   DrawLine(id + "3", time[c.idx], c.price, time[brk],   brkPrice, clr, STYLE_SOLID);
   DrawLine(id + "N", time[b.idx], b.price, time[brk],   b.price, clr, STYLE_DOT);   // neckline

   string lbl = id + "L";
   ObjectCreate(0, lbl, OBJ_TEXT, 0, time[b.idx], b.price);
   ObjectSetString(0,  lbl, OBJPROP_TEXT, tag);
   ObjectSetInteger(0, lbl, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, lbl, OBJPROP_FONTSIZE, 9);
   ObjectSetInteger(0, lbl, OBJPROP_ANCHOR, tag == "W" ? ANCHOR_LOWER : ANCHOR_UPPER);
   ObjectSetInteger(0, lbl, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, lbl, OBJPROP_HIDDEN, true);
}

//+------------------------------------------------------------------+
void DrawLine(const string name, const datetime t1, const double p1,
              const datetime t2, const double p2, const color clr, const ENUM_LINE_STYLE style)
{
   ObjectCreate(0, name, OBJ_TREND, 0, t1, p1, t2, p2);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_STYLE, style);
   ObjectSetInteger(0, name, OBJPROP_WIDTH, 1);
   ObjectSetInteger(0, name, OBJPROP_RAY_RIGHT, false);
   ObjectSetInteger(0, name, OBJPROP_BACK, true);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
}

//+------------------------------------------------------------------+
//| ADR in price: average daily (high - low) of the last N days       |
//+------------------------------------------------------------------+
double GetAdr()
{
   if(InpAdrDays < 1) return(0.0);
   double highs[], lows[];
   if(CopyHigh(_Symbol, PERIOD_D1, 1, InpAdrDays, highs) != InpAdrDays) return(0.0);
   if(CopyLow(_Symbol,  PERIOD_D1, 1, InpAdrDays, lows)  != InpAdrDays) return(0.0);
   double sum = 0.0;
   for(int i = 0; i < InpAdrDays; i++)
      sum += highs[i] - lows[i];
   return(sum / InpAdrDays);
}
//+------------------------------------------------------------------+
