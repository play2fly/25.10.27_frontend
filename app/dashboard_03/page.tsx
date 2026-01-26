"use client";

import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../_config/env";

type CtEvent = { id: string; ts: number; level: "info" | "warn" | "error"; msg: string; meta?: any };
type CtExchange = { idx: number; exchangeId: string; name: string; enabled: boolean; spotEnabled: boolean; perpEnabled: boolean };
type CtKey = { idx: number; exchangeId: string; accountLabel: string; apiKeyMasked: string; isActive: boolean; lastUsedAt?: string | null };
type CtBot = { botId: string; kind: "MM" | "ARB"; exchangeId: string; market: "SPOT" | "PERP"; symbol: string; status: string; config?: any; updatedTs: number };

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function HomePage() {
  const base = useMemo(() => API_BASE_URL.replace(/\/$/, ""), []);
  const [connected, setConnected] = useState(false);
  const [lastErr, setLastErr] = useState<string | null>(null);

  const [exchanges, setExchanges] = useState<CtExchange[]>([]);
  const [supportedExchanges, setSupportedExchanges] = useState<Array<{ exchangeId: string; name: string }>>([]);
  const [keys, setKeys] = useState<CtKey[]>([]);
  const [bots, setBots] = useState<CtBot[]>([]);
  const [events, setEvents] = useState<CtEvent[]>([]);
  const [metrics, setMetrics] = useState<Record<string, Record<string, number>>>({});
  const [eventFilter, setEventFilter] = useState<"all" | "error" | "warn" | "info">("all");
  const [activeTab, setActiveTab] = useState<"keys" | "bot-create" | "bot-list">("keys");

  const [keyExchangeId, setKeyExchangeId] = useState("lbank");
  const [keyLabel, setKeyLabel] = useState("main");
  const [keyApiKey, setKeyApiKey] = useState("");
  const [keyApiSecret, setKeyApiSecret] = useState("");
  const [keyPassphrase, setKeyPassphrase] = useState("");

  const [botExchangeId, setBotExchangeId] = useState("lbank");
  const [botMarket, setBotMarket] = useState<"SPOT" | "PERP">("SPOT");
  const [botSymbol, setBotSymbol] = useState("SWC/USDT");
  const [botWallSizeUsdt, setBotWallSizeUsdt] = useState("2");
  const [botWallLevels, setBotWallLevels] = useState("3");
  const [botWallLevelStepPct, setBotWallLevelStepPct] = useState("0.5");
  const [botWallTargetBandPct, setBotWallTargetBandPct] = useState("3");
  const [botWallTtlMs, setBotWallTtlMs] = useState("1200");
  const [botWallRefreshMs, setBotWallRefreshMs] = useState("1000");

  const [botSelfTradeSizeUsdt, setBotSelfTradeSizeUsdt] = useState("3");
  const [botSelfTradeRefreshMs, setBotSelfTradeRefreshMs] = useState("29000");
  const [botExecMode, setBotExecMode] = useState<"paper" | "live">("paper");
  const [botPriceSource, setBotPriceSource] = useState<"REDIS_LAST_TRADE" | "REDIS_TICK" | "MONGO_CANDLE_CLOSE" | "MANUAL">("REDIS_LAST_TRADE");
  const [botMongoCollection, setBotMongoCollection] = useState("LBANK:SWCUSDT-1m");
  const [botManualPrice, setBotManualPrice] = useState("");
  const [botSelectedKeyIdxes, setBotSelectedKeyIdxes] = useState<number[]>([]);
  

  const exchangeOptions = useMemo(() => {
    return supportedExchanges.map((e) => ({ id: e.exchangeId, name: e.name }));
  }, [supportedExchanges]);

  async function getJson<T>(path: string): Promise<T> {
    const res = await fetch(`${base}${path}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(String((data as any)?.message || `HTTP_${res.status}`));
    return data as T;
  }

  async function postJson<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${base}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(String((data as any)?.message || `HTTP_${res.status}`));
    return data as T;
  }

  async function del(path: string) {
    const res = await fetch(`${base}${path}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(String((data as any)?.message || `HTTP_${res.status}`));
    return data;
  }

  async function refreshSnapshot() {
    const snap = await getJson<any>(`/v1/a07-ct/snapshot`);
    setExchanges(snap.exchanges || []);
    setBots(snap.bots || []);
    setEvents(snap.events || []);
    setMetrics(snap.metrics || {});
    // keys are separate
    const ks = await getJson<any>(`/v1/a07-ct/keys`);
    setKeys(ks.keys || []);
    // supported exchanges
    const sup = await getJson<any>(`/v1/a07-ct/exchanges/supported`);
    setSupportedExchanges(sup.exchanges || []);
  }

  useEffect(() => {
    void refreshSnapshot().catch((e) => setLastErr(String(e?.message || e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-select active keys when exchange changes or keys are loaded
  useEffect(() => {
    if (keys.length > 0 && botExchangeId) {
      const activeKeys = keys.filter((k) => k.exchangeId === botExchangeId && k.isActive).map((k) => k.idx);
      // Only auto-select if no keys are currently selected, or if all selected keys are from different exchange
      const selectedFromCurrentEx = botSelectedKeyIdxes.filter((idx) => {
        const key = keys.find((k) => k.idx === idx);
        return key && key.exchangeId === botExchangeId;
      });
      if (activeKeys.length > 0 && selectedFromCurrentEx.length === 0) {
        setBotSelectedKeyIdxes(activeKeys);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botExchangeId, keys]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      // No token, trigger logout
      try {
        window.dispatchEvent(new Event('auth:logout'));
      } catch {}
      return;
    }

    const wsUrl = `${base.replace(/^http/, "ws")}/v1/a07-ct/ws`;
    // WebSocket doesn't support custom headers directly, use subprotocol for token
    // This will be available in req.headers['sec-websocket-protocol']
    const ws = new WebSocket(wsUrl, token);
    let closed = false;
    let authFailed = false;
    
    ws.onopen = () => {
      setConnected(true);
      setLastErr(null);
      authFailed = false;
    };
    ws.onerror = () => {
      setLastErr("WS_ERROR");
    };
    ws.onclose = (event) => {
      closed = true;
      setConnected(false);
      
      // Check if close was due to authentication failure
      // Close code 1008 = policy violation (often used for auth failure)
      if (event.code === 1008 && !authFailed) {
        authFailed = true;
        try {
          window.dispatchEvent(new Event('auth:logout'));
        } catch {}
      }
    };
    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(String(evt.data || "{}"));
        if (msg.type === "AUTH_ERROR" || msg.type === "UNAUTHORIZED") {
          // Server explicitly sent auth error
          authFailed = true;
          try {
            window.dispatchEvent(new Event('auth:logout'));
          } catch {}
          ws.close();
          return;
        }
        if (msg.type === "SNAPSHOT") {
          setExchanges(msg.exchanges || []);
          setBots(msg.bots || []);
          setEvents(msg.events || []);
          return;
        }
        if (msg.type === "EVENT") {
          const e = msg.event as CtEvent;
          setEvents((prev) => [e, ...prev].slice(0, 200));
          return;
        }
        if (msg.type === "EVENTS") {
          setEvents(msg.events || []);
        }
      } catch {
        // ignore
      }
    };
    return () => {
      if (!closed) ws.close();
    };
  }, [base]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-extrabold tracking-tight">Control Tower (CT)</div>
          <div className="mt-1 text-sm text-gray-500">
            API: <span className="font-mono">{base}</span> · WS: <span className="font-mono">/v1/a07-ct/ws</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold border", connected ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-amber-300 text-amber-700 bg-amber-50")}>
            {connected ? "WS CONNECTED" : "WS DISCONNECTED"}
          </span>
          {lastErr ? <span className="rounded-full px-3 py-1 text-xs font-semibold border border-rose-300 text-rose-700 bg-rose-50">ERR {lastErr}</span> : null}
          <button className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50" onClick={() => void refreshSnapshot()}>
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">실시간 로그 (latest 50)</div>
          <div className="flex items-center gap-2">
            <select className="rounded border px-2 py-1 text-xs" value={eventFilter} onChange={(e) => setEventFilter(e.target.value as any)}>
              <option value="all">all</option>
              <option value="error">error</option>
              <option value="warn">warn</option>
              <option value="info">info</option>
            </select>
            <span className="text-xs text-gray-500">총 {events.length}개</span>
          </div>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-auto border rounded-lg p-3 bg-gray-50">
          {events
            .sort((a, b) => b.ts - a.ts)
            .filter((e) => eventFilter === "all" || e.level === eventFilter)
            .slice(0, 50)
            .map((e) => (
            <div key={e.id} className={cn("rounded-lg border-l-4 px-3 py-2 text-sm transition-all", e.level === "error" ? "border-l-rose-500 bg-rose-50" : e.level === "warn" ? "border-l-amber-500 bg-amber-50" : "border-l-blue-500 bg-blue-50")}>
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-gray-600">{new Date(e.ts).toLocaleTimeString()}</div>
                <div className={cn("text-xs font-semibold px-2 py-0.5 rounded", e.level === "error" ? "text-rose-700 bg-rose-100" : e.level === "warn" ? "text-amber-700 bg-amber-100" : "text-blue-700 bg-blue-100")}>
                  {e.level.toUpperCase()}
                </div>
              </div>
              <div className="mt-1 font-mono text-xs break-words">{e.msg}</div>
              {e.meta ? <div className="mt-1 font-mono text-[11px] text-gray-600 overflow-auto bg-white/50 rounded p-2">{JSON.stringify(e.meta, null, 2)}</div> : null}
            </div>
          ))}
          {events.length === 0 ? <div className="text-sm text-gray-500 text-center py-4">no events</div> : null}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b">
          <button
            className={cn("px-4 py-2 text-sm font-semibold border-b-2 transition-colors", activeTab === "keys" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700")}
            onClick={() => setActiveTab("keys")}
          >
            거래소 키 등록
          </button>
          <button
            className={cn("px-4 py-2 text-sm font-semibold border-b-2 transition-colors", activeTab === "bot-create" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700")}
            onClick={() => setActiveTab("bot-create")}
          >
            봇 등록
          </button>
          <button
            className={cn("px-4 py-2 text-sm font-semibold border-b-2 transition-colors", activeTab === "bot-list" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700")}
            onClick={() => setActiveTab("bot-list")}
          >
            봇 현황
          </button>
        </div>

        {activeTab === "keys" && (
          <div className="space-y-4">
            <div className="text-sm font-semibold">API Keys</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs text-gray-500">exchangeId</div>
              <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={keyExchangeId} onChange={(e) => setKeyExchangeId(e.target.value)}>
                {exchangeOptions.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.id} {x.name && x.name !== x.id ? `(${x.name})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs text-gray-500">label</div>
              <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={keyLabel} onChange={(e) => setKeyLabel(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-gray-500">apiKey</div>
              <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={keyApiKey} onChange={(e) => setKeyApiKey(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-gray-500">apiSecret</div>
              <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={keyApiSecret} onChange={(e) => setKeyApiSecret(e.target.value)} />
            </div>
            <div className={cn(keyExchangeId !== "kucoin" && "opacity-60")}>
              <div className="text-xs text-gray-500">passphrase (KuCoin required)</div>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                value={keyPassphrase}
                onChange={(e) => setKeyPassphrase(e.target.value)}
                placeholder={keyExchangeId === "kucoin" ? "required for KuCoin" : "optional"}
              />
              {keyExchangeId === "kucoin" ? (
                <div className="mt-1 text-xs text-amber-700">KuCoin은 passphrase가 없으면 live 주문이 막힙니다.</div>
              ) : null}
            </div>
          </div>
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
            disabled={
              keyApiKey.trim().length < 5 ||
              keyApiSecret.trim().length < 5 ||
              (keyExchangeId === "kucoin" && keyPassphrase.trim().length < 2)
            }
            onClick={async () => {
              try {
                await postJson(`/v1/a07-ct/keys`, {
                  exchangeId: keyExchangeId,
                  accountLabel: keyLabel,
                  apiKey: keyApiKey,
                  apiSecret: keyApiSecret,
                  passphrase: keyPassphrase.trim() || undefined,
                });
                setKeyApiKey("");
                setKeyApiSecret("");
                setKeyPassphrase("");
                await refreshSnapshot();
              } catch (e: any) {
                setLastErr(String(e?.message || e));
              }
            }}
          >
            Save Key
          </button>
          <div className="overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-2 pr-3">active</th>
                  <th className="py-2 pr-3">exchange</th>
                  <th className="py-2 pr-3">label</th>
                  <th className="py-2 pr-3">key</th>
                  <th className="py-2 pr-3">actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.idx} className="border-b">
                    <td className="py-2 pr-3">{k.isActive ? "YES" : "-"}</td>
                    <td className="py-2 pr-3">{k.exchangeId}</td>
                    <td className="py-2 pr-3">{k.accountLabel}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{k.apiKeyMasked}</td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                          onClick={async () => {
                            try {
                              await postJson(`/v1/a07-ct/keys/${k.idx}/activate`, {});
                              await refreshSnapshot();
                            } catch (e: any) {
                              setLastErr(String(e?.message || e));
                            }
                          }}
                        >
                          Activate
                        </button>
                        <button
                          className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                          onClick={async () => {
                            try {
                              await del(`/v1/a07-ct/keys/${k.idx}`);
                              await refreshSnapshot();
                            } catch (e: any) {
                              setLastErr(String(e?.message || e));
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {keys.length === 0 ? <tr><td className="py-3 text-gray-500" colSpan={5}>no keys</td></tr> : null}
              </tbody>
            </table>
          </div>
          </div>
        )}

        {activeTab === "bot-create" && (
          <div className="space-y-4">
            <div className="text-sm font-semibold">봇 등록</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <div className="text-xs text-gray-500">exchangeId</div>
            <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={botExchangeId} onChange={(e) => {
              const newExId = e.target.value;
              setBotExchangeId(newExId);
              // Auto-select active keys for the new exchange
              const activeKeys = keys.filter((k) => k.exchangeId === newExId && k.isActive).map((k) => k.idx);
              setBotSelectedKeyIdxes(activeKeys);
            }}>
              {exchangeOptions.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.id} {x.name && x.name !== x.id ? `(${x.name})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs text-gray-500">market</div>
            <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={botMarket} onChange={(e) => setBotMarket(e.target.value as any)}>
              <option value="SPOT">SPOT</option>
              <option value="PERP">PERP</option>
            </select>
          </div>
          <div>
            <div className="text-xs text-gray-500">symbol</div>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={botSymbol} onChange={(e) => setBotSymbol(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <div className="text-xs text-gray-500">wallSizeUsdt</div>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={botWallSizeUsdt} onChange={(e) => setBotWallSizeUsdt(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-gray-500">실행주기 (ms)</div>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" type="number" value={botWallRefreshMs} onChange={(e) => setBotWallRefreshMs(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-gray-500">TTL (ms)</div>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" type="number" value={botWallTtlMs} onChange={(e) => setBotWallTtlMs(e.target.value)} />
          </div>          
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
            <div className="text-xs text-gray-500">레벨</div>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" type="number" value={botWallLevels} onChange={(e) => setBotWallLevels(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-gray-500">레벨간격(%)</div>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" type="number" value={botWallLevelStepPct} onChange={(e) => setBotWallLevelStepPct(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-gray-500">밴드(±%)</div>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" type="number" value={botWallTargetBandPct} onChange={(e) => setBotWallTargetBandPct(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <div className="text-xs text-gray-500">selfTradeSizeUsdt</div>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={botSelfTradeSizeUsdt} onChange={(e) => setBotSelfTradeSizeUsdt(e.target.value)} />
            <div className="mt-1 text-xs text-gray-500">
              참고: live 모드에서는 self-trade 주문은 차단됩니다(시뮬레이션 값으로만 사용).
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">셀프트레이드 주기 (ms)</div>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" type="number" value={botSelfTradeRefreshMs} onChange={(e) => setBotSelfTradeRefreshMs(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-gray-500">execMode</div>
            <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={botExecMode} onChange={(e) => setBotExecMode(e.target.value as any)}>
              <option value="paper">paper (no real orders)</option>
              <option value="live">live (REAL orders)</option>
            </select>
            {botExecMode === "live" ? <div className="mt-1 text-xs text-rose-600 font-semibold">WARNING: REAL orders will be sent.</div> : null}
          </div>
          
          
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <div className="text-xs text-gray-500">priceSource</div>
            <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={botPriceSource} onChange={(e) => setBotPriceSource(e.target.value as any)}>
              <option value="REDIS_LAST_TRADE">REDIS_LAST_TRADE</option>
              <option value="REDIS_TICK">REDIS_TICK</option>
              <option value="MONGO_CANDLE_CLOSE">MONGO_CANDLE_CLOSE</option>
              <option value="MANUAL">MANUAL</option>
            </select>
          </div>
          <div className={cn(botPriceSource !== "MONGO_CANDLE_CLOSE" && "opacity-50")}>
            <div className="text-xs text-gray-500">mongo collection</div>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={botMongoCollection} onChange={(e) => setBotMongoCollection(e.target.value)} disabled={botPriceSource !== "MONGO_CANDLE_CLOSE"} />
          </div>
          <div className={cn(botPriceSource !== "MANUAL" && "opacity-50")}>
            <div className="text-xs text-gray-500">manual price</div>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={botManualPrice} onChange={(e) => setBotManualPrice(e.target.value)} disabled={botPriceSource !== "MANUAL"} />
          </div>
        </div>
        
        <div className="rounded-lg border p-4 bg-gray-50">
          <div className="text-xs font-semibold text-gray-700 mb-2">사용할 API 키 선택 (1개 이상 필수)</div>
          <div className="space-y-2 max-h-[200px] overflow-auto">
            {keys.filter((k) => k.exchangeId === botExchangeId).length === 0 ? (
              <div className="text-xs text-gray-500 py-2">
                {botExchangeId} 거래소에 등록된 키가 없습니다. 먼저 "거래소 키 등록" 탭에서 키를 등록하세요.
              </div>
            ) : (
              keys
                .filter((k) => k.exchangeId === botExchangeId)
                .map((k) => (
                  <label key={k.idx} className={cn("flex items-center gap-2 cursor-pointer hover:bg-white rounded px-2 py-1.5", !k.isActive && "opacity-60")}>
                    <input
                      type="checkbox"
                      checked={botSelectedKeyIdxes.includes(k.idx)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBotSelectedKeyIdxes([...botSelectedKeyIdxes, k.idx]);
                        } else {
                          setBotSelectedKeyIdxes(botSelectedKeyIdxes.filter((idx) => idx !== k.idx));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-semibold">{k.accountLabel}</div>
                        {k.isActive ? (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-semibold">ACTIVE</span>
                        ) : (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">INACTIVE</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">{k.apiKeyMasked}</div>
                    </div>
                  </label>
                ))
            )}
          </div>
          {botSelectedKeyIdxes.length === 0 && keys.filter((k) => k.exchangeId === botExchangeId).length > 0 ? (
            <div className="mt-2 text-xs text-rose-600">⚠️ 최소 1개 이상의 키를 선택해야 합니다.</div>
          ) : null}
          {botSelectedKeyIdxes.length > 0 ? (
            <div className="mt-2 text-xs text-green-600">✓ {botSelectedKeyIdxes.length}개 키 선택됨</div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            onClick={async () => {
              try {
                const res = await postJson<any>(`/v1/a07-ct/preflight`, {
                  exchangeId: botExchangeId,
                  market: botMarket,
                  symbol: botSymbol,
                  config: {
                    // execMode: botExecMode,
                    // priceSource: botPriceSource,
                    // mongoCandleCollection: botMongoCollection,
                    // manualPrice: botManualPrice ? Number(botManualPrice) : undefined,
                    // wallRefreshMs: Number(botInterval || 1000),
                    // selfTradeRefreshMs: Number(botSelfTradeInterval || 300),
                    // ingestTtlSec: 3,
                    // targetBandBps: Number(botBand || 100),
                    // mmLevels: Number(botLevel || 5),
                    // mmLevelStepBps: Number(botLevelInterval || 10),
                    // wallSizeUsdt: Number(botWallSizeUsdt || 10),
                    // selfTradeSizeUsdt: Number(botSelfSizeUsdt || 3),
                    // wallTtlMs: Number(botTtl || 1200),
                    // wallMaxOrders: 12,
                    // selfTradeMaxOrdersPerTick: 2,
                  },
                });
                const errs = Array.isArray(res?.errors) ? res.errors : [];
                const warns = Array.isArray(res?.warnings) ? res.warnings : [];
                window.alert(`preflight ok=${String(res?.ok)}\n\nerrors:\n- ${errs.join("\n- ") || "(none)"}\n\nwarnings:\n- ${warns.join("\n- ") || "(none)"}`);
              } catch (e: any) {
                setLastErr(String(e?.message || e));
              }
            }}
          >
            Preflight
          </button>
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={botSelectedKeyIdxes.length === 0}
            onClick={async () => {
              try {
                if (botSelectedKeyIdxes.length === 0) {
                  setLastErr("최소 1개 이상의 키를 선택해야 합니다.");
                  return;
                }
                const bot = await postJson<any>(`/v1/a07-ct/bots`, {
                  kind: "MM",
                  exchangeId: botExchangeId,
                  market: botMarket,
                  symbol: botSymbol,
                  apiKeyIdxes: botSelectedKeyIdxes,
                  config: {
                    execMode: botExecMode,
                    priceSource: botPriceSource,
                    mongoCandleCollection: botMongoCollection,
                    manualPrice: botManualPrice ? Number(botManualPrice) : undefined,
                    wallSizeUsdt: Number(botWallSizeUsdt || 10),
                    wallRefreshMs: Number(botWallRefreshMs || 1000),
                    wallTtlMs: Number(botWallTtlMs || 1200),
                    wallLevels: Number(botWallLevels || 3), 
                    wallLevelStepPct: Number(botWallLevelStepPct || 10),
                    wallTargetBandPct: Number(botWallTargetBandPct || 100),
                    selfTradeSizeUsdt: Number(botSelfTradeSizeUsdt || 3),
                    selfTradeRefreshMs: Number(botSelfTradeRefreshMs || 300),
                    // ingestTtlSec: 3,
                    
                     
                    
                    
                    
                    
                    // wallMaxOrders: 12,
                    // selfTradeMaxOrdersPerTick: 2,
                  },
                });
                await postJson(`/v1/a07-ct/bot/${encodeURIComponent(bot.bot.botId)}/action`, { action: "START" });
                setBotSelectedKeyIdxes([]); // Reset after creation
                await refreshSnapshot();
              } catch (e: any) {
                setLastErr(String(e?.message || e));
              }
            }}
          >
            Create+Start MM Bot
          </button>
        </div>
          </div>
        )}

        {activeTab === "bot-list" && (
          <div className="space-y-4">
            <div className="text-sm font-semibold">봇 현황</div>
            <div className="overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="py-2 pr-3">botId</th>
                    <th className="py-2 pr-3">ex</th>
                    <th className="py-2 pr-3">market</th>
                    <th className="py-2 pr-3">symbol</th>
                    <th className="py-2 pr-3">status</th>
                    <th className="py-2 pr-3">metrics</th>
                    <th className="py-2 pr-3">actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bots.map((b) => (
                    <tr key={b.botId} className="border-b">
                      <td className="py-2 pr-3 font-mono text-xs">{b.botId}</td>
                      <td className="py-2 pr-3">{b.exchangeId}</td>
                      <td className="py-2 pr-3">{b.market}</td>
                      <td className="py-2 pr-3 font-semibold">{b.symbol}</td>
                      <td className="py-2 pr-3">
                        <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-semibold", b.status === "RUNNING" ? "bg-green-100 text-green-700" : b.status === "PAUSED" ? "bg-amber-100 text-amber-700" : b.status === "ERROR" ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-700")}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        {metrics[b.botId] ? (
                          <div className="text-xs space-y-0.5">
                            {metrics[b.botId].wall_orders_placed ? <div>🟢 wall placed: {metrics[b.botId].wall_orders_placed}</div> : null}
                            {metrics[b.botId].wall_orders_canceled ? <div>🔴 wall canceled: {metrics[b.botId].wall_orders_canceled}</div> : null}
                            {metrics[b.botId].wall_errors ? <div className="text-rose-600">❌ wall errors: {metrics[b.botId].wall_errors}</div> : null}
                            {metrics[b.botId].selftrade_orders_placed ? <div>🟡 self placed: {metrics[b.botId].selftrade_orders_placed}</div> : null}
                            {metrics[b.botId].selftrade_orders_canceled ? <div>🟠 self canceled: {metrics[b.botId].selftrade_orders_canceled}</div> : null}
                            {metrics[b.botId].selftrade_errors ? <div className="text-rose-600">❌ self errors: {metrics[b.botId].selftrade_errors}</div> : null}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">-</div>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {b.status !== "RUNNING" ? (
                            <button className="rounded border px-2 py-1 text-xs hover:bg-green-50 text-green-700 border-green-300" onClick={() => void postJson(`/v1/a07-ct/bot/${encodeURIComponent(b.botId)}/action`, { action: "START" }).then(refreshSnapshot).catch((e: any) => setLastErr(String(e?.message || e)))}>Start</button>
                          ) : null}
                          {b.status === "RUNNING" ? (
                            <button className="rounded border px-2 py-1 text-xs hover:bg-amber-50 text-amber-700 border-amber-300" onClick={() => void postJson(`/v1/a07-ct/bot/${encodeURIComponent(b.botId)}/action`, { action: "PAUSE" }).then(refreshSnapshot).catch((e: any) => setLastErr(String(e?.message || e)))}>Pause</button>
                          ) : null}
                          {b.status !== "STOPPED" ? (
                            <button className="rounded border px-2 py-1 text-xs hover:bg-gray-50 text-gray-700" onClick={() => void postJson(`/v1/a07-ct/bot/${encodeURIComponent(b.botId)}/action`, { action: "STOP" }).then(refreshSnapshot).catch((e: any) => setLastErr(String(e?.message || e)))}>Stop</button>
                          ) : null}
                          <button className="rounded border px-2 py-1 text-xs hover:bg-rose-50 text-rose-700 border-rose-300" onClick={() => void postJson(`/v1/a07-ct/bot/${encodeURIComponent(b.botId)}/action`, { action: "DELETE" }).then(refreshSnapshot).catch((e: any) => setLastErr(String(e?.message || e)))}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bots.length === 0 ? <tr><td className="py-3 text-gray-500" colSpan={7}>no bots</td></tr> : null}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
