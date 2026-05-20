import asyncio
import json
import logging
import websockets
import redis

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

try:
    r = redis.Redis(host='cache', port=6379, decode_responses=True)
    r.ping()
except redis.exceptions.ConnectionError:
    r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# --- ENGINE 1: PARALLEL BOOK TICKER PIPELINE ---
async def track_book_ticker():
    # Direct endpoint skips the subscription payload wrapping completely
    url = "wss://stream.binance.us:9443/ws/btcusdt@bookTicker"
    logging.info("Starting isolated BookTicker stream pipeline...")
    
    while True:
        try:
            async with websockets.connect(url) as ws:
                logging.info("BookTicker Pipe Connected.")
                while True:
                    raw_data = await ws.recv()
                    data = json.loads(raw_data)
                    
                    bid = data.get("b")
                    ask = data.get("a")
                    
                    if bid and ask:
                        r.hset("ticker:btcusdt", mapping={
                            "bid": bid,
                            "ask": ask
                        })
                    await asyncio.sleep(0.001)
        except Exception as e:
            logging.error(f"BookTicker connection error: {e}. Reconnecting...")
            await asyncio.sleep(3)

# --- ENGINE 2: PARALLEL RAW TRADE AGGREGATOR PIPELINE ---
async def track_raw_trades():
    # Direct endpoint for flat trade execution payloads
    url = "wss://stream.binance.us:9443/ws/btcusdt@trade"
    logging.info("Starting isolated Raw Trade stream pipeline...")
    
    while True:
        try:
            async with websockets.connect(url) as ws:
                logging.info("Raw Trade Pipe Connected.")
                while True:
                    raw_data = await ws.recv()
                    data = json.loads(raw_data)
                    
                    if data.get("e") == "trade":
                        price = data.get("p")
                        trade_time = data.get("T")
                        if price and trade_time:
                            r.hset("ticker:btcusdt:trade", mapping={
                                "price":      price,
                                "trade_time": str(trade_time),
                                "qty":        data.get("q", "0"),       # ← add this
                                "event_time": str(data.get("E", trade_time))  # ← and this
                            })
                    await asyncio.sleep(0.001)
        except Exception as e:
            logging.error(f"Trade stream connection error: {e}. Reconnecting...")
            await asyncio.sleep(3)

# --- RUN BOTH ENGINES CONCURRENTLY ---
async def main():
    await asyncio.gather(
        track_book_ticker(),
        track_raw_trades()
    )

if __name__ == "__main__":
    asyncio.run(main())