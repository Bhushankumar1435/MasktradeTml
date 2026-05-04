import React, { useEffect, useRef, useState, useCallback } from "react";
import { getTradeHistoryApi } from "../../ApiService/Adminapi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../components/ui/Loader";
import { FaChartBar, FaArrowUp, FaArrowDown, FaSyncAlt, FaSearchPlus, FaSearchMinus } from "react-icons/fa";

const FAPI = "https://fapi.binance.com/fapi/v1";
const SAPI = "https://api.binance.com/api/v3";

const getPrice = async (symbol) => {
  try {
    const r = await fetch(`${FAPI}/premiumIndex?symbol=${symbol}`);
    const d = await r.json();
    if (d.markPrice) return parseFloat(d.markPrice);
  } catch {}
  try {
    const r = await fetch(`${SAPI}/ticker/price?symbol=${symbol}`);
    const d = await r.json();
    if (d.price) return parseFloat(d.price);
  } catch {}
  return null;
};

const getAllPrices = async () => {
  try {
    const r = await fetch(`${FAPI}/premiumIndex`);
    const arr = await r.json();
    if (!Array.isArray(arr)) return {};
    return arr.reduce((a, d) => { a[d.symbol] = parseFloat(d.markPrice); return a; }, {});
  } catch { return {}; }
};

const getKlines = async (symbol, interval, limit = 200) => {
  try {
    const r = await fetch(`${FAPI}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    const d = await r.json();
    return Array.isArray(d) ? d.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] })) : [];
  } catch { return []; }
};

const get24h = async (symbol) => {
  try {
    const r = await fetch(`${FAPI}/ticker/24hr?symbol=${symbol}`);
    const d = await r.json();
    return d.code ? {} : d;
  } catch { return {}; }
};

const fp = (p) => {
  if (!p && p !== 0) return "—";
  if (p >= 10000) return p.toFixed(1);
  if (p >= 100) return p.toFixed(2);
  if (p >= 1) return p.toFixed(4);
  return p.toFixed(6);
};
const fv = (v) => {
  if (!v) return "—";
  if (v >= 1e9) return `${(v/1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v/1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v/1e3).toFixed(1)}K`;
  return v.toFixed(0);
};

// ── Canvas Chart ─────────────────────────────────────────────────────────────
const ChartCanvas = ({ candles, markPrice, entryLines, timeframe }) => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({ start: 0, count: 80, tooltip: null });
  const drag = useRef({ on: false, x0: 0, s0: 0 });
  const [tip, setTip] = useState(null);
  const animRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles || !candles.length) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const { start, count } = stateRef.current;
    const visible = candles.slice(start, Math.min(start + count, candles.length));
    if (!visible.length) return;

    const PL = 6, PR = 78, PT = 12, CHART_H = Math.floor(H * 0.7);
    const VOL_Y = CHART_H + 6, VOL_H = H - CHART_H - 6 - 28;
    const IW = W - PL - PR, IH = CHART_H - PT;

    ctx.fillStyle = "#131722"; ctx.fillRect(0, 0, W, H);

    let lo = Math.min(...visible.map(c => c.l));
    let hi = Math.max(...visible.map(c => c.h));
    if (markPrice) { lo = Math.min(lo, markPrice); hi = Math.max(hi, markPrice); }
    (entryLines||[]).forEach(e => { lo = Math.min(lo, e.price); hi = Math.max(hi, e.price); });
    const pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
    const rng = hi - lo || 1;
    const maxVol = Math.max(...visible.map(c => c.v)) || 1;
    const n = visible.length;
    const slotW = IW / n;
    const bW = Math.max(1, slotW * 0.72);
    const xM = i => PL + i * slotW + slotW / 2;
    const xB = i => PL + i * slotW + (slotW - bW) / 2;
    const yP = p => PT + (1 - (p - lo) / rng) * IH;
    const yV = v => VOL_Y + VOL_H - (v / maxVol) * VOL_H;

    // Grid
    for (let i = 0; i <= 5; i++) {
      const y = PT + (IH / 5) * i;
      ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PL, y); ctx.lineTo(W - PR, y); ctx.stroke();
      const price = hi - (rng / 5) * i;
      ctx.fillStyle = "rgba(255,255,255,0.38)"; ctx.font = "10px monospace"; ctx.textAlign = "left";
      ctx.fillText(fp(price), W - PR + 5, y + 4);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W - PR, PT); ctx.lineTo(W - PR, CHART_H); ctx.stroke();

    // Entry lines
    ctx.setLineDash([5, 3]);
    (entryLines||[]).forEach(e => {
      const y = yP(e.price), col = e.mode === "LONG" ? "#22c55e" : "#ef4444";
      ctx.strokeStyle = col; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PL, y); ctx.lineTo(W - PR, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = col + "28"; ctx.fillRect(PL, y - 9, 72, 18);
      ctx.fillStyle = col; ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
      ctx.fillText(`${e.mode[0]} ${fp(e.price)}`, PL + 4, y + 4);
      ctx.setLineDash([5, 3]);
    });
    ctx.setLineDash([]);

    // Candles
    visible.forEach((c, i) => {
      const g = c.c >= c.o, col = g ? "#26a69a" : "#ef5350";
      const bTop = yP(Math.max(c.o, c.c)), bBot = yP(Math.min(c.o, c.c));
      ctx.strokeStyle = col; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(xM(i), yP(c.h)); ctx.lineTo(xM(i), yP(c.l)); ctx.stroke();
      ctx.fillStyle = col; ctx.fillRect(xB(i), bTop, bW, Math.max(1, bBot - bTop));
    });

    // Mark price
    if (markPrice) {
      const y = yP(markPrice);
      ctx.strokeStyle = "#f0b90b"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 2]);
      ctx.beginPath(); ctx.moveTo(PL, y); ctx.lineTo(W - PR, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#f0b90b"; ctx.fillRect(W - PR, y - 10, PR - 2, 20);
      ctx.fillStyle = "#000"; ctx.font = "bold 10px monospace"; ctx.textAlign = "left";
      ctx.fillText(fp(markPrice), W - PR + 3, y + 4);
    }

    // Volume
    visible.forEach((c, i) => {
      ctx.fillStyle = c.c >= c.o ? "rgba(38,166,154,0.4)" : "rgba(239,83,80,0.4)";
      ctx.fillRect(xB(i), yV(c.v), bW, Math.max(1, VOL_Y + VOL_H - yV(c.v)));
    });
    ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PL, VOL_Y); ctx.lineTo(W - PR, VOL_Y); ctx.stroke();

    // Time axis
    const xStep = Math.max(1, Math.floor(n / 7));
    const isIntra = ["1m","3m","5m","15m","30m","1h","2h","4h"].includes(timeframe);
    ctx.fillStyle = "rgba(255,255,255,0.32)"; ctx.font = "9px sans-serif"; ctx.textAlign = "center";
    visible.forEach((c, i) => {
      if (i % xStep !== 0 && i !== n - 1) return;
      const d = new Date(c.t);
      const label = isIntra
        ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      ctx.fillText(label, xM(i), H - 7);
    });

    // Tooltip crosshair
    const { tooltip } = stateRef.current;
    if (tooltip) {
      const i = tooltip.i;
      const y = yP(tooltip.c.c);
      ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(xM(i), PT); ctx.lineTo(xM(i), CHART_H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PL, y); ctx.lineTo(W - PR, y); ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [candles, markPrice, entryLines, timeframe]);

  // Resize observer — requestAnimationFrame prevents loop error
  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const setSize = () => {
      const w = wrap.clientWidth || 900;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== 480) canvas.height = 480;
    };

    const ro = new ResizeObserver(() => {
      // Cancel any pending animation frame to avoid loop
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(() => {
        setSize();
        draw();
      });
    });

    ro.observe(wrap);
    setSize();
    draw();
    return () => { ro.disconnect(); if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  // Init view when candles load — show last 80 candles for perfect sizing
  useEffect(() => {
    if (!candles || !candles.length) return;
    const count = Math.min(80, candles.length);
    stateRef.current = { ...stateRef.current, start: Math.max(0, candles.length - count), count };
    draw();
  }, [candles, draw]);

  useEffect(() => { draw(); }, [markPrice, entryLines, draw]);

  const getHovered = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles || !candles.length) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const { start, count } = stateRef.current;
    const visible = candles.slice(start, Math.min(start + count, candles.length));
    const IW = canvas.width - 84;
    const slotW = IW / visible.length;
    const i = Math.round((mx - 6) / slotW);
    if (i >= 0 && i < visible.length) return { i, c: visible[i] };
    return null;
  }, [candles]);

  const onWheel = (e) => {
    e.preventDefault();
    if (!candles || !candles.length) return;
    const factor = e.deltaY > 0 ? 1.15 : 0.87;
    const { start, count } = stateRef.current;
    const newCount = Math.max(10, Math.min(Math.round(count * factor), candles.length));
    const newStart = Math.max(0, Math.min(start + Math.round((count - newCount) / 2), candles.length - newCount));
    stateRef.current = { ...stateRef.current, start: newStart, count: newCount };
    draw();
  };

  const onMouseDown = (e) => {
    drag.current = { on: true, x0: e.clientX, s0: stateRef.current.start };
  };
  const onMouseMove = (e) => {
    if (drag.current.on) {
      const canvas = canvasRef.current;
      const { count } = stateRef.current;
      const IW = canvas.width - 84;
      const pxPerCandle = IW / count;
      const shift = Math.round((drag.current.x0 - e.clientX) / pxPerCandle);
      const newStart = Math.max(0, Math.min(drag.current.s0 + shift, candles.length - count));
      stateRef.current = { ...stateRef.current, start: newStart };
      draw();
    } else {
      const h = getHovered(e);
      stateRef.current = { ...stateRef.current, tooltip: h };
      setTip(h ? h.c : null);
      draw();
    }
  };
  const onMouseUp = () => { drag.current.on = false; };
  const onLeave = () => { drag.current.on = false; stateRef.current = { ...stateRef.current, tooltip: null }; setTip(null); draw(); };

  const zoom = (factor) => {
    if (!candles || !candles.length) return;
    const { start, count } = stateRef.current;
    const newCount = Math.max(10, Math.min(Math.round(count * factor), candles.length));
    const newStart = Math.max(0, Math.min(start, candles.length - newCount));
    stateRef.current = { ...stateRef.current, start: newStart, count: newCount };
    draw();
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <button onClick={() => zoom(0.7)} className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"><FaSearchPlus /></button>
        <button onClick={() => zoom(1.4)} className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"><FaSearchMinus /></button>
        <span className="text-gray-600 text-xs ml-2">Scroll to zoom · Drag to pan</span>
        {tip && (
          <div className="ml-4 flex gap-4 text-xs font-mono">
            <span className="text-gray-400">{new Date(tip.t).toLocaleString()}</span>
            {[["O",tip.o,"text-white"],["H",tip.h,"text-green-400"],["L",tip.l,"text-red-400"],["C",tip.c,tip.c>=tip.o?"text-green-400":"text-red-400"],["V",tip.v,"text-blue-400"]].map(([l,v,cls])=>(
              <span key={l}><span className="text-gray-500">{l}: </span><span className={cls}>{l==="V"?fv(v):fp(v)}</span></span>
            ))}
          </div>
        )}
      </div>
      {/* Canvas wrapper — fixed height prevents CSS distortion */}
      <div ref={wrapRef} className="w-full relative" style={{ height: '480px' }}>
        {(!candles || !candles.length) && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            No chart data available
          </div>
        )}
        <canvas ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', cursor: drag.current.on ? "grabbing" : "crosshair" }}
          onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove}
          onMouseUp={onMouseUp} onMouseLeave={onLeave}
        />
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const TIMEFRAMES = [
  {l:"1m",v:"1m"},{l:"5m",v:"5m"},{l:"15m",v:"15m"},
  {l:"1H",v:"1h"},{l:"4H",v:"4h"},{l:"1D",v:"1d"},{l:"1W",v:"1w"},
];

export default function TokenChart() {
  const [trades, setTrades] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [selected, setSelected] = useState("");
  const [prices, setPrices] = useState({});
  const [klines, setKlines] = useState([]);
  const [ticker, setTicker] = useState({});
  const [tf, setTf] = useState("1m");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTradeHistoryApi(1, 1000, "", "OPEN");
      if (res?.data?.success) {
        const t = res.data.data?.trades || [];
        setTrades(t);
        const uniq = [...new Set(t.map(x => x.pair))];
        setPairs(uniq);
        if (uniq.length && !selected) setSelected(uniq[0]);
      }
    } catch { toast.error("Failed to load trades"); }
    finally { setLoading(false); }
  }, []);

  const fetchPrices = useCallback(async () => {
    const all = await getAllPrices();
    if (Object.keys(all).length) setPrices(all);
  }, []);

  const fetchChart = useCallback(async () => {
    if (!selected) return;
    setChartLoading(true);
    try {
      const [k, t24] = await Promise.all([getKlines(selected, tf, 200), get24h(selected)]);
      setKlines(k);
      setTicker(t24);
    } catch { toast.error("Chart error"); }
    finally { setChartLoading(false); }
  }, [selected, tf]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);
  useEffect(() => { fetchChart(); }, [fetchChart]);
  // ✅ WebSocket real-time mark price for TokenChart
  useEffect(() => {
    let ws, pollId;
    const startPolling = () => {
      fetchPrices();
      pollId = window.setInterval(fetchPrices, 3000);
    };
    try {
      ws = new WebSocket("wss://fstream.binance.com/ws/!markPrice@arr@1s");
      ws.onopen = () => fetchPrices();
      ws.onmessage = (e) => {
        try {
          const arr = JSON.parse(e.data);
          if (!Array.isArray(arr)) return;
          const updated = {};
          arr.forEach(d => { updated[d.s] = parseFloat(d.p); });
          if (Object.keys(updated).length) setPrices(prev => ({ ...prev, ...updated }));
        } catch {}
      };
      ws.onerror = () => { ws = null; startPolling(); };
      ws.onclose = () => { if (ws) startPolling(); };
    } catch { startPolling(); }
    return () => {
      if (ws) ws.close();
      if (pollId) window.clearInterval(pollId);
    };
  }, [fetchPrices]);
  useEffect(() => {
    const id = window.setInterval(fetchChart, 60000);
    return () => window.clearInterval(id);
  }, [fetchChart]);

  const pairStats = pairs.map(pair => {
    const pt = trades.filter(t => t.pair === pair);
    const mp = prices[pair];
    let pnl = 0;
    pt.forEach(t => {
      const qty = t.quantity || (t.usedUSDT * t.leverage) / t.entryPrice;
      if (mp) pnl += t.mode === "LONG" ? (mp - t.entryPrice) * qty : (t.entryPrice - mp) * qty;
    });
    return { pair, pnl, count: pt.length, mp };
  }).sort((a, b) => b.pnl - a.pnl);

  const curTrades = trades.filter(t => t.pair === selected).map(t => {
    const mp = prices[selected];
    const qty = t.quantity || (t.usedUSDT * t.leverage) / t.entryPrice;
    const pnl = mp ? (t.mode === "LONG" ? (mp - t.entryPrice) * qty : (t.entryPrice - mp) * qty) : 0;
    return { ...t, livePnl: pnl, mp };
  });

  const entryLines = curTrades.map(t => ({ price: t.entryPrice, mode: t.mode }));
  const mp = prices[selected];
  const c24 = parseFloat(ticker.priceChangePercent) || 0;
  const totalPnl = curTrades.reduce((s, t) => s + t.livePnl, 0);

  return (
    <div className="w-full min-h-screen flex flex-col gap-4 font-poppins relative overflow-hidden">
      <ToastContainer />
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-brand-gold/6 blur-[120px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="relative z-10 glass-panel p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 border border-brand-gold/30 rounded-xl bg-brand-gold/10">
            <FaChartBar className="text-brand-gold text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-300">Token Chart — Live Binance</h1>
            <p className="text-gray-500 text-xs mt-0.5">{pairs.length} pairs · scroll=zoom · drag=pan</p>
          </div>
        </div>
        <button onClick={() => { fetchTrades(); fetchChart(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 text-sm transition">
          <FaSyncAlt className={chartLoading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? <div className="flex items-center justify-center h-64"><Loader /></div> : (<>

        {/* Token tabs */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {pairStats.map(({ pair, pnl, count, mp }) => {
            const profit = pnl >= 0, sel = pair === selected;
            return (
              <button key={pair} onClick={() => setSelected(pair)}
                className={`flex flex-col px-4 py-2.5 rounded-xl border text-left transition-all
                  ${sel ? (profit ? "bg-green-500/15 border-green-500/40" : "bg-red-500/15 border-red-500/40") : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                <div className="flex items-center gap-1">
                  <span className={`font-bold text-sm ${sel ? (profit ? "text-green-400" : "text-red-400") : "text-white"}`}>{pair}</span>
                  {profit ? <FaArrowUp className="text-green-500 text-[10px]" /> : <FaArrowDown className="text-red-500 text-[10px]" />}
                </div>
                <div className={`text-xs font-mono font-semibold ${profit ? "text-green-400" : "text-red-400"}`}>{profit?"+":""}{pnl.toFixed(2)} USDT</div>
                <div className="text-[10px] text-gray-500">{mp ? fp(mp) : "—"} · {count} trade{count!==1?"s":""}</div>
              </button>
            );
          })}
        </div>

        {/* Chart Panel */}
        <div className="relative z-10 glass-panel rounded-2xl overflow-hidden">
          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-5 px-5 py-3 border-b border-white/5">
            <div>
              <span className="text-2xl font-bold font-mono text-white">{mp ? fp(mp) : "—"}</span>
              <span className={`ml-2 text-sm font-semibold ${c24 >= 0 ? "text-green-400" : "text-red-400"}`}>{c24 >= 0 ? "+" : ""}{c24.toFixed(2)}%</span>
            </div>
            {[["24H High", fp(parseFloat(ticker.highPrice)||0), "text-green-400"],
              ["24H Low", fp(parseFloat(ticker.lowPrice)||0), "text-red-400"],
              ["Volume", fv(parseFloat(ticker.volume)||0), "text-blue-400"],
              ["Net PnL", `${totalPnl>=0?"+":""}${totalPnl.toFixed(4)}`, totalPnl>=0?"text-green-400":"text-red-400"],
            ].map(([l,v,c]) => (
              <div key={l} className="flex flex-col"><span className="text-[10px] text-gray-500">{l}</span><span className={`text-sm font-mono font-semibold ${c}`}>{v}</span></div>
            ))}
            <div className="ml-auto flex gap-1">
              {TIMEFRAMES.map(({l,v}) => (
                <button key={v} onClick={() => setTf(v)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${tf===v?"bg-brand-gold/20 text-brand-gold border border-brand-gold/40":"text-gray-500 hover:text-white hover:bg-white/10"}`}>{l}</button>
              ))}
            </div>
          </div>

          {/* Canvas chart */}
          <div className="relative bg-[#131722]">
            {chartLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#131722]/80 z-10"><Loader /></div>
            )}
            <ChartCanvas candles={klines} markPrice={mp} entryLines={entryLines} timeframe={tf} />
          </div>
        </div>

        {/* Trades table */}
        <div className="relative z-10 glass-panel rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">Open Trades — <span className="text-brand-gold">{selected}</span> <span className="text-gray-500 font-normal text-xs">({curTrades.length})</span></h2>
            <div className={`text-sm font-bold font-mono ${totalPnl>=0?"text-green-400":"text-red-400"}`}>Total: {totalPnl>=0?"+":""}{totalPnl.toFixed(4)} USDT</div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="min-w-[860px] glass-table whitespace-nowrap">
              <thead><tr><th>#</th><th>User ID</th><th>Mode</th><th>Entry</th><th>Mark Price</th><th>Qty</th><th>Amount</th><th>Lev</th><th className="text-center">Live PnL</th><th>Date</th></tr></thead>
              <tbody>
                {curTrades.length > 0 ? curTrades.map((t, i) => (
                  <tr key={t._id||i}>
                    <td><span className="text-gray-500">{i+1}</span></td>
                    <td className="text-white font-medium">{t.userId}</td>
                    <td><span className={`glass-badge ${t.mode==="LONG"?"glass-badge-success":"glass-badge-danger"}`}>{t.mode}</span></td>
                    <td className="font-mono text-gray-300">{fp(t.entryPrice)}</td>
                    <td className="font-mono text-brand-gold">{t.mp ? fp(t.mp) : <span className="text-gray-600 text-xs animate-pulse">Live…</span>}</td>
                    <td className="text-gray-300">{t.quantity}</td>
                    <td className="font-semibold text-brand-gold">{t.usedUSDT}</td>
                    <td className="text-gray-300">{t.leverage}x</td>
                    <td className={`text-center font-bold font-mono ${t.livePnl>=0?"text-green-400":"text-red-400"}`}>{t.livePnl>=0?"+":""}{t.livePnl.toFixed(4)}</td>
                    <td className="text-gray-500 text-xs">{new Date(t.createdAt).toLocaleString([],{dateStyle:"medium",timeStyle:"short"})}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="10" className="text-center py-10 text-gray-500">No open trades for {selected}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>)}
    </div>
  );
}
