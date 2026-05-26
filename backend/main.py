from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import redis
import httpx  # Lightweight async HTTP client to pull REST data cleanly
import time

app = FastAPI(title="TradeBench API")

# Expanded origins to maintain clean CORS handshakes across dev domains
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "localhost:5173",
    "127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    r = redis.Redis(host='cache', port=6379, decode_responses=True)
    r.ping()
except redis.exceptions.ConnectionError:
    r = redis.Redis(host='localhost', port=6379, decode_responses=True)

@app.get("/")
def read_root():
    return {"status": "TradeBench Backend Online"}


# --- NEW: HISTORICAL BOOTSTRAP ENDPOINT ---
@app.get("/api/history/btcusdt")
async def get_historical_klines():
    """
    Fetches the last 100 historical 1-minute candlestick bars (klines)
    directly from Binance.US REST API to bootstrap the frontend chart timeline.
    """
    url = "https://api.binance.us/api/v3/klines"
    params = {
        "symbol": "BTCUSDT",
        "interval": "1m",
        "limit": 100
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            if response.status_code != 200:
                print(f"Binance API returned error status: {response.status_code}")
                return []
            
            raw_klines = response.json()
            formatted_history = []
            
            for k in raw_klines:
                # Based on the documentation image indices:
                # k[0] = Open time, k[1] = Open, k[2] = High, k[3] = Low, k[4] = Close
                formatted_history.append({
                    "time":   int(k[0] / 1000),
                    "open":   float(k[1]),
                    "high":   float(k[2]),
                    "low":    float(k[3]),
                    "close":  float(k[4]),
                    "volume": float(k[5]),   # ← base asset volume
                })
            return formatted_history
            
    except Exception as e:
        print(f"Error executing historical kline fetch: {e}")
        return []


# --- PIPELINE 1: BOOK TICKER (BEST BID / BEST ASK) ---
@app.websocket("/ws/ticker/btcusdt")
async def websocket_ticker(websocket: WebSocket):
    await websocket.accept()
    print("Frontend client connected to BookTicker pipeline.")
    try:
        last_bid, last_ask = None, None
        while True:
            ticker_data = r.hgetall("ticker:btcusdt")
            if ticker_data:
                current_bid = ticker_data.get("bid")
                current_ask = ticker_data.get("ask")
                
                if current_bid != last_bid or current_ask != last_ask:
                    await websocket.send_json({"b": current_bid, "a": current_ask})
                    last_bid, last_ask = current_bid, current_ask
            await asyncio.sleep(0.02)
    except WebSocketDisconnect:
        print("Frontend client disconnected from BookTicker pipeline.")

# --- PIPELINE 2: RAW TRADES (FOR CANDLESTICK AGGREGATION) ---
@app.websocket("/ws/trade/btcusdt")
async def websocket_trades(websocket: WebSocket):
    await websocket.accept()
    try:
        last_trade_time = None
        while True:
            trade_data = r.hgetall("ticker:btcusdt:trade")
            if trade_data:
                current_time = trade_data.get("trade_time")
                event_time   = trade_data.get("event_time")

                # Don't send stale data from a previous session
                if event_time and (time.time() * 1000 - float(event_time)) > 5000:
                    await asyncio.sleep(0.02)
                    continue

                if current_time != last_trade_time:
                    await websocket.send_json({
                        "p": trade_data.get("price"),
                        "T": current_time,
                        "q": trade_data.get("qty"),
                        "E": trade_data.get("event_time"),
                    })
                    last_trade_time = current_time
            await asyncio.sleep(0.02)
    except WebSocketDisconnect:
        print("Frontend client disconnected from Raw Trade pipeline.")

# --- PIPELINE 3: ORDER BOOK DEPTH ---
@app.websocket("/ws/depth/btcusdt")
async def websocket_depth(websocket: WebSocket):
    await websocket.accept()
    print("Frontend client connected to Depth pipeline.")
    try:
        last_update = None
        while True:
            raw = r.get("depth:btcusdt")
            if raw and raw != last_update:
                await websocket.send_text(raw)  # already JSON, no need to re-serialize
                last_update = raw
            await asyncio.sleep(0.1)  # 100ms matches the stream update speed
    except WebSocketDisconnect:
        print("Frontend client disconnected from Depth pipeline.")