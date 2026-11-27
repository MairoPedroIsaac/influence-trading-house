//+------------------------------------------------------------------+
//| ITH_Reporter.mq5                                                 |
//| Influence Trading House - sends your MT5 trades to your ITH      |
//| journal automatically. Put it on ANY one chart. It does not      |
//| trade. It reports every trade on the account, all symbols.       |
//|                                                                  |
//| Setup:                                                           |
//| 1. ITH > Profile > Connect MT5 > Make key. Copy the key.         |
//| 2. MT5 > Tools > Options > Expert Advisors > tick "Allow         |
//|    WebRequest for listed URL" and add  http://127.0.0.1:8000     |
//| 3. Drag ITH_Reporter onto a chart, paste the key in InpKey.      |
//+------------------------------------------------------------------+
#property copyright "Influence Trading House"
#property version   "1.00"
#property description "Sends your MT5 trades to your ITH journal. Does not trade."

input string InpServer   = "http://127.0.0.1:8000"; // ITH address (no slash at the end)
input string InpKey      = "";                      // Your ITH MT5 key (from Profile > Connect MT5)
input int    InpSyncDays = 30;                      // On start, also send closed trades from the last N days

long     sentClosed[];        // position tickets already sent as closed
datetime lastOpenSync = 0;
string   lastStatus   = "Starting...";
int      okCount = 0, failCount = 0;

//+------------------------------------------------------------------+
int OnInit()
{
   if(MQLInfoInteger(MQL_TESTER))
   {
      Print("ITH Reporter: does nothing in the Strategy Tester.");
      return(INIT_SUCCEEDED);
   }
   if(StringLen(InpKey) < 10)
   {
      Alert("ITH Reporter: paste your ITH MT5 key in the InpKey input.");
      return(INIT_PARAMETERS_INCORRECT);
   }
   EventSetTimer(60);
   SyncHistory(TimeCurrent() - (datetime)InpSyncDays * 86400);
   SyncOpenPositions();
   ShowStatus();
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   EventKillTimer();
   Comment("");
}

void OnTick() {}

//+------------------------------------------------------------------+
//| A deal was added: a trade opened, closed or partly closed         |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction &trans, const MqlTradeRequest &request, const MqlTradeResult &result)
{
   if(MQLInfoInteger(MQL_TESTER)) return;
   if(trans.type != TRADE_TRANSACTION_DEAL_ADD) return;
   if(trans.position == 0) return;
   SendPosition((long)trans.position);
   ShowStatus();
}

//+------------------------------------------------------------------+
//| Every minute: re-send open trades (stop loss / take profit may    |
//| have moved) and catch anything missed while offline.              |
//+------------------------------------------------------------------+
void OnTimer()
{
   SyncOpenPositions();
   SyncHistory(TimeCurrent() - 86400);
   ShowStatus();
}

//+------------------------------------------------------------------+
void SyncOpenPositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      long posId = PositionGetInteger(POSITION_IDENTIFIER);
      SendPosition(posId);
   }
}

void SyncHistory(const datetime from)
{
   if(!HistorySelect(from, TimeCurrent() + 3600)) return;
   int total = HistoryDealsTotal();
   long ids[];
   int n = 0;
   for(int i = 0; i < total; i++)
   {
      ulong deal = HistoryDealGetTicket(i);
      if(deal == 0) continue;
      long entry = HistoryDealGetInteger(deal, DEAL_ENTRY);
      if(entry != DEAL_ENTRY_OUT && entry != DEAL_ENTRY_OUT_BY && entry != DEAL_ENTRY_INOUT) continue;
      long posId = HistoryDealGetInteger(deal, DEAL_POSITION_ID);
      if(posId == 0 || WasSent(posId)) continue;
      bool dup = false;
      for(int k = 0; k < n; k++) if(ids[k] == posId) { dup = true; break; }
      if(dup) continue;
      ArrayResize(ids, n + 1);
      ids[n++] = posId;
   }
   for(int k = 0; k < n; k++)
      SendPosition(ids[k]);
}

bool WasSent(const long posId)
{
   for(int i = 0; i < ArraySize(sentClosed); i++)
      if(sentClosed[i] == posId) return(true);
   return(false);
}

//+------------------------------------------------------------------+
//| Build one trade from its deals and send it to ITH                 |
//+------------------------------------------------------------------+
void SendPosition(const long posId)
{
   if(WasSent(posId)) return;

   bool   isOpen = PositionSelectByTicket((ulong)posId);
   string symbol = "", side = "", comment = "";
   long   magic = 0;
   double lots = 0, entry = 0, sl = 0, tp = 0, exitPrice = 0, profit = 0;
   datetime opened = 0, closedAt = 0;

   if(isOpen)
   {
      symbol  = PositionGetString(POSITION_SYMBOL);
      side    = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY) ? "BUY" : "SELL";
      lots    = PositionGetDouble(POSITION_VOLUME);
      entry   = PositionGetDouble(POSITION_PRICE_OPEN);
      sl      = PositionGetDouble(POSITION_SL);
      tp      = PositionGetDouble(POSITION_TP);
      opened  = (datetime)PositionGetInteger(POSITION_TIME);
      magic   = PositionGetInteger(POSITION_MAGIC);
      comment = PositionGetString(POSITION_COMMENT);
   }
   else
   {
      if(!HistorySelectByPosition(posId)) return;
      int total = HistoryDealsTotal();
      double outVol = 0;
      for(int i = 0; i < total; i++)
      {
         ulong deal = HistoryDealGetTicket(i);
         if(deal == 0) continue;
         long   e   = HistoryDealGetInteger(deal, DEAL_ENTRY);
         double vol = HistoryDealGetDouble(deal, DEAL_VOLUME);
         profit += HistoryDealGetDouble(deal, DEAL_PROFIT) + HistoryDealGetDouble(deal, DEAL_SWAP)
                 + HistoryDealGetDouble(deal, DEAL_COMMISSION);
         if(e == DEAL_ENTRY_IN)
         {
            symbol  = HistoryDealGetString(deal, DEAL_SYMBOL);
            side    = (HistoryDealGetInteger(deal, DEAL_TYPE) == DEAL_TYPE_BUY) ? "BUY" : "SELL";
            lots   += vol;
            entry   = HistoryDealGetDouble(deal, DEAL_PRICE);
            opened  = (datetime)HistoryDealGetInteger(deal, DEAL_TIME);
            magic   = HistoryDealGetInteger(deal, DEAL_MAGIC);
            comment = HistoryDealGetString(deal, DEAL_COMMENT);
            if(sl == 0) sl = HistoryDealGetDouble(deal, DEAL_SL);
            if(tp == 0) tp = HistoryDealGetDouble(deal, DEAL_TP);
         }
         else
         {
            outVol   += vol;
            exitPrice = HistoryDealGetDouble(deal, DEAL_PRICE);
            closedAt  = (datetime)HistoryDealGetInteger(deal, DEAL_TIME);
            double dsl = HistoryDealGetDouble(deal, DEAL_SL);
            double dtp = HistoryDealGetDouble(deal, DEAL_TP);
            if(dsl != 0) sl = dsl;
            if(dtp != 0) tp = dtp;
         }
      }
      if(symbol == "" || outVol <= 0) return;   // not a finished trade
   }
   if(symbol == "" || lots <= 0) return;

   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   if(digits <= 0) digits = 5;

   string json = "{";
   json += "\"ticket\":" + IntegerToString(posId);
   json += ",\"symbol\":\"" + Esc(symbol) + "\"";
   json += ",\"side\":\"" + side + "\"";
   json += ",\"lots\":" + DoubleToString(lots, 2);
   json += ",\"entry_price\":" + DoubleToString(entry, digits);
   json += ",\"stop_loss\":" + DoubleToString(sl, digits);
   json += ",\"take_profit\":" + DoubleToString(tp, digits);
   json += ",\"opened_at\":\"" + IsoUtc(opened) + "\"";
   json += ",\"magic\":" + IntegerToString(magic);
   json += ",\"comment\":\"" + Esc(comment) + "\"";
   if(isOpen)
      json += ",\"closed\":false";
   else
   {
      json += ",\"closed\":true";
      json += ",\"exit_price\":" + DoubleToString(exitPrice, digits);
      json += ",\"closed_at\":\"" + IsoUtc(closedAt) + "\"";
      json += ",\"profit\":" + DoubleToString(profit, 2);
   }
   json += "}";

   int code = Post(json);
   if(code == 200 || code == 201)
   {
      okCount++;
      lastStatus = "OK: sent " + side + " " + symbol + (isOpen ? " (open)" : " (closed)");
      if(!isOpen)
      {
         int n = ArraySize(sentClosed);
         ArrayResize(sentClosed, n + 1);
         sentClosed[n] = posId;
      }
   }
   else
   {
      failCount++;
      if(code == 401)       lastStatus = "KEY NOT VALID: make a new key in ITH Profile and paste it in InpKey";
      else if(code == -1)   lastStatus = "CANNOT CONNECT: is the ITH backend running, and is " + InpServer + " in Tools > Options > Expert Advisors?";
      else                  lastStatus = "ERROR " + IntegerToString(code) + " sending " + symbol + ", see Experts tab";
   }
}

//+------------------------------------------------------------------+
int Post(const string json)
{
   string url = InpServer + "/api/v1/mt5/trades/";
   string headers = "Content-Type: application/json\r\nX-ITH-Key: " + InpKey + "\r\n";
   char body[], reply[];
   string replyHeaders;
   int len = StringToCharArray(json, body, 0, WHOLE_ARRAY, CP_UTF8);
   if(len > 0) ArrayResize(body, len - 1);   // drop the ending zero
   ResetLastError();
   int code = WebRequest("POST", url, headers, 5000, body, reply, replyHeaders);
   if(code == -1)
      PrintFormat("ITH Reporter: cannot reach %s (error %d). Add it in Tools > Options > Expert Advisors.", url, GetLastError());
   else if(code != 200 && code != 201)
      PrintFormat("ITH Reporter: server answered %d: %s", code, CharArrayToString(reply, 0, WHOLE_ARRAY, CP_UTF8));
   return(code);
}

//+------------------------------------------------------------------+
//| MT5 times are broker server time. Convert to UTC for ITH.         |
//+------------------------------------------------------------------+
string IsoUtc(const datetime serverTime)
{
   long offset = (long)(TimeTradeServer() - TimeGMT());
   offset = (long)MathRound(offset / 1800.0) * 1800;   // whole half hours
   datetime utc = serverTime - (datetime)offset;
   MqlDateTime t;
   TimeToStruct(utc, t);
   return(StringFormat("%04d-%02d-%02dT%02d:%02d:%02dZ", t.year, t.mon, t.day, t.hour, t.min, t.sec));
}

string Esc(const string s)
{
   string r = s;
   StringReplace(r, "\\", "\\\\");
   StringReplace(r, "\"", "\\\"");
   return(r);
}

void ShowStatus()
{
   Comment("ITH Reporter v1.0  (sends trades, does not trade)\n",
           "Sent: ", okCount, "   Failed: ", failCount, "\n", lastStatus);
}
//+------------------------------------------------------------------+
