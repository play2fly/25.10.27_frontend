'use client';
import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../../../_config/env';

type ResultRow = {
  name: string;
  totalUsdt: number;
  totalToken: number;
  availUsdt: number;
  availToken: number;
  usingUsdt: number;
  usingToken: number;
  usedUsdt: number;
  usedToken: number;
  avgPrice: number;
};
type BackendResult = {
  rows: ResultRow[];
  totals: {
    totalUsdt: number;
    totalToken: number;
    availUsdt: number;
    availToken: number;
    usingUsdt: number;
    usingToken: number;
    usedUsdt: number;
    usedToken: number;
    avgPrice: number;
  };
  headers?: { exchange?: string; price?: number; timestamp?: string };
};

export default function ResultsPage() {
  const [data, setData] = useState<BackendResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<boolean>(false);

  // MM params
  const [symbolMode, setSymbolMode] = useState<'swc_usdt' | 'trx_usdt' | 'INPUT'>('swc_usdt');
  const [symbolInput, setSymbolInput] = useState<string>('');
  const [perOrderUsdt, setPerOrderUsdt] = useState<string>('7');
  const [levelsPerSide, setLevelsPerSide] = useState<string>('4');
  const [levelGapPct, setLevelGapPct] = useState<string>('0.3');
  const [minSpreadTicks, setMinSpreadTicks] = useState<string>('1');
  const [ttlMs, setTtlMs] = useState<string>('1200');
  const [bandPct, setBandPct] = useState<string>('3');
  const [inventoryTargetBase, setInventoryTargetBase] = useState<string>('0.02');
  const [inventoryBandBase, setInventoryBandBase] = useState<string>('0.01');
  const [killSwitchDailyLossPct, setKillSwitchDailyLossPct] = useState<string>('0.5');
  const [postOnly, setPostOnly] = useState<boolean>(true);
  const [timeInForce, setTimeInForce] = useState<'GTC' | 'IOC' | 'FOK'>('GTC');
  const [anchorPrice, setAnchorPrice] = useState<string>('0');
  const [discoveryMode, setDiscoveryMode] = useState<boolean>(true);
  const [targetPrice, setTargetPrice] = useState<string>('0');
  // Scheduled pair trade params (integrated with activation)
  const [execPrice, setExecPrice] = useState<string>('0.016');
  const [execUsdt, setExecUsdt] = useState<string>('0.1');
  const [execPeriodSec, setExecPeriodSec] = useState<string>('2'); // seconds
  const disabledInputCls = active ? ' bg-gray-800 border-red-500 text-red-400 placeholder-red-400 cursor-not-allowed' : '';
  const disabledCheckCls = active ? ' accent-red-500 opacity-60 cursor-not-allowed' : '';
  const disabledSelectCls = active ? ' bg-gray-800 border-red-500 text-red-400 cursor-not-allowed' : '';
  // Manual cancel range
  const [cancelRangeMode, setCancelRangeMode] = useState<'ALL'|'CUSTOM'>('ALL');
  const [cancelFrom, setCancelFrom] = useState<string>('10');
  const [cancelTo, setCancelTo] = useState<string>('15');
  // Buy-wall preview reactive state
  const [bwBase, setBwBase] = useState<string>('0.014');
  const [bwGap, setBwGap] = useState<string>('1.0');
  const [bwPer, setBwPer] = useState<string>('1');
  const [bwLevels, setBwLevels] = useState<string>('2');
  const [bwRows, setBwRows] = useState<Array<{ lvl:number; ref:number; price:number; usdt:number; qty:number }>>([]);
  useEffect(()=>{
    const base = parseFloat(bwBase || '0') || 1;
    const gapPct = parseFloat(bwGap || '0.5') || 0.5;
    const per = parseFloat(bwPer || '10') || 10;
    const n = Math.max(1, parseInt(bwLevels || '3', 10) || 3);
    const rows: Array<{ lvl:number; ref:number; price:number; usdt:number; qty:number; }> = [];
    const clamp = (v:number) => Math.max(0, Number(v.toFixed(8)));
    for (let i=1;i<=n;i++){
      const gapF = 1 + (Math.random()*0.01 - 0.005);
      const qtyF = 1 + (Math.random()*0.05 - 0.025);
      const step = (gapPct/100) * i * gapF;
      const price = clamp(base * (1 - step));
      const usdt = clamp(per * qtyF);
      const qty = price > 0 ? clamp(usdt / price) : 0;
      rows.push({ lvl:i, ref: base, price, usdt, qty });
    }
    setBwRows(rows);
  }, [bwBase, bwGap, bwPer, bwLevels]);
  // Sell-wall preview reactive state
  const [swBase, setSwBase] = useState<string>('0.019');
  const [swGap, setSwGap] = useState<string>('1.0');
  const [swPer, setSwPer] = useState<string>('1');
  const [swLevels, setSwLevels] = useState<string>('2');
  const [swRows, setSwRows] = useState<Array<{ lvl:number; ref:number; price:number; usdt:number; qty:number }>>([]);
  useEffect(()=>{
    const base = parseFloat(swBase || '0') || 1;
    const gapPct = parseFloat(swGap || '0.5') || 0.5;
    const per = parseFloat(swPer || '10') || 10;
    const n = Math.max(1, parseInt(swLevels || '3', 10) || 3);
    const rows: Array<{ lvl:number; ref:number; price:number; usdt:number; qty:number; }> = [];
    const clamp = (v:number) => Math.max(0, Number(v.toFixed(8)));
    for (let i=1;i<=n;i++){
      const gapF = 1 + (Math.random()*0.01 - 0.005);
      const qtyF = 1 + (Math.random()*0.05 - 0.025);
      const step = (gapPct/100) * i * gapF;
      const price = clamp(base * (1 + step));
      const usdt = clamp(per * qtyF);
      const qty = price > 0 ? clamp(usdt / price) : 0;
      rows.push({ lvl:i, ref: base, price, usdt, qty });
    }
    setSwRows(rows);
  }, [swBase, swGap, swPer, swLevels]);
  // Quick pair preview reactive state
  const [qpBase, setQpBase] = useState<string>('');
  const [qpPer, setQpPer] = useState<string>('');
  useEffect(()=>{
    // set sensible defaults after mount to keep inputs controlled from first render
    setQpBase(prev => (prev === '' ? '0.017' : prev));
    setQpPer(prev => (prev === '' ? '1' : prev));
  },[]);
  const [qpPreview, setQpPreview] = useState<{ price:number; qty:number; usdt:number } | null>(null);
  useEffect(()=>{
    const base = parseFloat(qpBase || '0');
    const usdt = parseFloat(qpPer || '0');
    if (base > 0 && usdt > 0) {
      const price = Number(base.toFixed(8));
      const qty = Number((usdt / price).toFixed(8));
      setQpPreview({ price, qty, usdt });
    } else {
      setQpPreview(null);
    }
  }, [qpBase, qpPer]);

  // Load saved params + active state on mount so the button and form restore previous session
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/a05-dashboard-02/mm/params`, { cache: 'no-store' });
        const json = await res.json();
        if (!mounted) return;
        if (json?.success && json?.params) {
          const p = json.params as any;
          const sm = String(p?.symbolMode || '').toLowerCase();
          if (sm === 'swc_usdt' || sm === 'trx_usdt') {
            setSymbolMode(sm as 'swc_usdt' | 'trx_usdt');
          } else if (sm === 'input') {
            setSymbolMode('INPUT');
          }
          if (p?.symbol != null) setSymbolInput(String(p.symbol));
          if (p?.perOrderUsdt != null) setPerOrderUsdt(String(p.perOrderUsdt));
          if (p?.levelsPerSide != null) setLevelsPerSide(String(p.levelsPerSide));
          if (p?.levelGapPct != null) setLevelGapPct(String(p.levelGapPct));
          if (p?.minSpreadTicks != null) setMinSpreadTicks(String(p.minSpreadTicks));
          if (p?.ttlMs != null) setTtlMs(String(p.ttlMs));
          if (p?.bandPct != null) setBandPct(String(p.bandPct));
          if (p?.inventoryTargetBase != null) setInventoryTargetBase(String(p.inventoryTargetBase));
          if (p?.inventoryBandBase != null) setInventoryBandBase(String(p.inventoryBandBase));
          if (p?.killSwitchDailyLossPct != null) setKillSwitchDailyLossPct(String(p.killSwitchDailyLossPct));
          if (p?.postOnly != null) setPostOnly(!!p.postOnly);
          if (p?.timeInForce != null) setTimeInForce(p.timeInForce as any);
          if (p?.anchorPrice != null) setAnchorPrice(String(p.anchorPrice));
          if (p?.discoveryMode != null) setDiscoveryMode(!!p.discoveryMode);
          if (p?.targetPrice != null) setTargetPrice(String(p.targetPrice));
          if (p?.execPrice != null) setExecPrice(String(p.execPrice));
          if (p?.execUsdt != null) setExecUsdt(String(p.execUsdt));
          if (p?.execPeriodSec != null) setExecPeriodSec(String(p.execPeriodSec));
        }
        if (typeof json?.active === 'boolean') {
          setActive(!!json.active);
        }
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const rows = useMemo(() => {
    return data?.rows ?? [];
  }, [data]);

  const totals = useMemo(() => {
    return data?.totals ?? { totalUsdt: 0, totalToken: 0, availUsdt: 0, availToken: 0, usingUsdt: 0, usingToken: 0, usedUsdt: 0, usedToken: 0, avgPrice: 0 };
  }, [data]);

  const formattedTimestamp = useMemo(() => {
    const ts = data?.headers?.timestamp;
    if (!ts) return '-';
    try {
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return ts;
      const yyyy = d.getFullYear();
      const MM = String(d.getMonth() + 1).padStart(2, '0');
      const DD = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${yyyy}-${MM}-${DD} ${hh}:${mm}:${ss}`;
    } catch {
      return ts;
    }
  }, [data]);

  const headerTitle = useMemo(() => data?.headers?.exchange ?? '-', [data]);
  const headerPrice = useMemo(() => {
    const p = data?.headers?.price;
    return typeof p === 'number' ? p : (p as any) ?? '-';
  }, [data]);

  // Refresh balances/status from server (getLbankBalances) on page load and when symbol changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        qs.set('symbolMode', symbolMode);
        if (symbolMode === 'INPUT') {
          qs.set('symbol', symbolInput || '');
        }
        const res = await fetch(`${API_BASE_URL}/v1/a05-dashboard-02/getLbankBalances?${qs.toString()}`, { cache: 'no-store' });
        const json = await res.json();
        if (cancelled) return;
        if (json && (json.rows || json.totals)) {
          setData(json as any);
        } else {
          setData(prev => {
            const baseTotals = { totalUsdt: 0, totalToken: 0, availUsdt: 0, availToken: 0, usingUsdt: 0, usingToken: 0, usedUsdt: 0, usedToken: 0, avgPrice: 0 };
            return {
              rows: prev?.rows ?? [],
              totals: prev?.totals ?? baseTotals,
              headers: { exchange: 'LBank', price: (prev as any)?.headers?.price, timestamp: new Date().toISOString() },
            };
          });
        }
      } catch {
        // ignore fetch errors
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [symbolMode, symbolInput]);

  return (
    <div className="space-y-6 min-h-[70vh] bg-gray-900 text-gray-100 p-4 md:p-6 rounded-xl">
      {/* Page header */}
      {/* <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl">📊</div>
        <div>
          <nav className="text-sm text-gray-500">
            <ol className="flex items-center gap-2">
              <li>User</li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-700">Results</li>
            </ol>
          </nav>
          <h1 className="text-2xl font-bold mt-1">결과</h1>
        </div>
      </div> */}

      {/* Group 1 card */}
      <div className="rounded-2xl border border-gray-700 bg-gray-800 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-lg font-semibold text-white">LBank</h3>
            {/* Symbol selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">심볼</span>
              <label className="flex items-center gap-1 text-sm text-gray-200">
                <input type="radio" name="lb_symbol" checked={symbolMode === 'swc_usdt'} onChange={() => setSymbolMode('swc_usdt')} disabled={active} className={disabledCheckCls} />
                swc_usdt
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-200">
                <input type="radio" name="lb_symbol" checked={symbolMode === 'trx_usdt'} onChange={() => setSymbolMode('trx_usdt')} disabled={active} className={disabledCheckCls} />
                trx_usdt
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-200">
                <input type="radio" name="lb_symbol" checked={symbolMode === 'INPUT'} onChange={() => setSymbolMode('INPUT')} disabled={active} className={disabledCheckCls} />
                INPUT
              </label>
              <input
                type="text"
                value={symbolInput}
                onChange={(e) => setSymbolInput(e.target.value)}
                placeholder="swc_usdt"
                className={"w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" + (active ? ' bg-gray-800 border-red-500 text-red-400 placeholder-red-400 cursor-not-allowed' : '')}
                disabled={symbolMode !== 'INPUT' || active}
              />
            </div>
            <button
              onClick={async () => {
                const payload = {
                  action: active ? 'stop' : 'start',
                  symbolMode,
                  symbol: symbolInput,
                  perOrderUsdt: parseFloat(perOrderUsdt),
                  levelsPerSide: parseInt(levelsPerSide, 10),
                  levelGapPct: parseFloat(levelGapPct),
                  minSpreadTicks: parseInt(minSpreadTicks, 10),
                  ttlMs: parseInt(ttlMs, 10),
                  bandPct: parseFloat(bandPct),
                  inventoryTargetBase: parseFloat(inventoryTargetBase),
                  inventoryBandBase: parseFloat(inventoryBandBase),
                  killSwitchDailyLossPct: parseFloat(killSwitchDailyLossPct),
                  postOnly,
                  timeInForce,
                  anchorPrice: parseFloat(anchorPrice || '0'),
                  discoveryMode,
                  targetPrice: parseFloat(targetPrice || '0'),
                  // scheduled pair trade params
                  execPrice: parseFloat(execPrice || '0'),
                  execUsdt: parseFloat(execUsdt || '0'),
                  execPeriodSec: parseFloat(execPeriodSec || '99999'),
                };
                try {
                  const res = await fetch(`${API_BASE_URL}/v1/a05-dashboard-02/mm/run`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  });
                  const json = await res.json();
                  setActive(!!json?.active);
                } catch { }
              }}
              className={[
                'px-4 py-2 rounded-md text-sm font-semibold transition-colors',
                active
                  ? 'bg-green-600 hover:bg-green-700 text-white border border-green-500'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600',
              ].join(' ')}
              aria-pressed={active}
            >
              {active ? '중지' : '활성화'}
            </button>
          </div>
        </div>
        {/* First-time guidance */}
        <div className="px-6 py-4 border-b border-gray-700 text-sm text-gray-300 space-y-2">
          <div className="font-semibold text-indigo-300">처음 마켓메이킹 가이드 (권장 기본값)</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-semibold text-gray-100">초기가격(Anchor)</span> (현재 {anchorPrice || '0'}) — 상장 직후 유효한 호가/체결이 부족할 때
              기준가로 사용됩니다. 탐색모드가 켜져 있고 유효한 북티커/최근체결이 없을 경우, 이 값을 중심으로 넓은 밴드・낮은 금액으로
              안전하게 초기 레벨을 형성합니다. 미입력(0)이면 데이터 확보 전까지 주문을 보류합니다.
            </li>
            <li>
              <span className="font-semibold text-gray-100">탐색모드(Discovery)</span> (현재 {discoveryMode ? 'ON' : 'OFF'}) — 초기 유동성이 부족할 때
              안전한 파라미터(넓은 <u>밴드</u>, 작은 <u>주문당 USDT</u>, 적은 <u>레벨/사이드</u>)로 레벨을 깔고, 유효한 호가나 최근 체결이
              충분히 관측되면 자동으로 정상 모드로 전환합니다.
            </li>
            <li>
              <span className="font-semibold text-gray-100">목표가격(Target)</span> (현재 {targetPrice || '0'}) — 0보다 크면 레벨의 중심(middle)을
              <u>목표가격</u>으로 강하게 바이어스합니다. 유동성이 충분한 정상 모드에서도 의도한 지점 주변으로 레벨을 형성하고 싶을 때 사용합니다.
              0이면 최근체결/미드프라이스(또는 Anchor) 기반으로 배치합니다.
            </li>
            <li>
              <span className="font-semibold text-gray-100">주문당 USDT</span> (현재 {perOrderUsdt}) — 각 레벨(호가)마다 한 번에 사용할 명목상 금액입니다.
              예를 들어 가격이 0.50 USDT라면 수량은 약 <code className="text-gray-100">USDT/가격 = {Number(perOrderUsdt || '0') / 0.5} 개</code>가 됩니다.
              거래소 최소수량/소수점 제한에 맞게 반올림됩니다.
            </li>
            <li>
              <span className="font-semibold text-gray-100">레벨/사이드</span> (현재 {levelsPerSide}) — 매수와 매도 각각 몇 개의 호가(벽)를 깔지 결정합니다.
              값이 3이면 매수 3개, 매도 3개 총 6개의 레벨을 유지합니다. 레벨이 많을수록 유동성은 좋아지지만 자본과 관리량이 증가합니다.
            </li>
            <li>
              <span className="font-semibold text-gray-100">레벨 간격(%)</span> (현재 0.5%) — 인접한 레벨 간의 가격 간격을 백분율로 지정합니다.
              기준가는 최근 체결가 또는 미드프라이스로, 예를 들어 1.0000일 때 0.5% 간격이면 매수는 0.9950 → 0.9900…, 매도는 1.0050 → 1.0100…으로 배치됩니다.
            </li>
            <li>
              <span className="font-semibold text-gray-100">최소 스프레드(tick)</span> (현재 {minSpreadTicks}) — 현재 최우선 매수/매도호가 간 차이가 최소 몇 틱 이상일 때만 메이커 주문을 유지합니다.
              틱은 거래소의 최소 가격 단위(예: 소수점 2자리면 0.01)이며, 스프레드가 너무 좁으면 즉시 체결(테이커)이 되어 수수료가 불리할 수 있어 방지합니다.
            </li>
            <li>
              <span className="font-semibold text-gray-100">TTL(ms)</span> (현재 {ttlMs}) — Time-To-Live. 주문을 제출한 뒤 지정한 시간(ms) 안에 체결되지 않으면 자동으로 취소합니다.
              오래된(스테일) 호가를 정리하고 시장에 맞춰 빠르게 재배치하기 위해 사용합니다.
            </li>
            <li>
              <span className="font-semibold text-gray-100">밴드(±%)</span> (현재 {bandPct}%) — 기준가 대비 위아래로 허용하는 안전 범위입니다.
              이 범위 밖의 가격에는 호가를 두지 않고, 이미 나가 있는 주문도 자동으로 정리하여 과도한 노출을 방지합니다.
            </li>
            <li>
              <span className="font-semibold text-gray-100">인벤토리 목표(SWC)</span> / <span className="font-semibold text-gray-100">인벤토리 밴드(SWC)</span> (현재 {inventoryTargetBase} / {inventoryBandBase}) —
              보유하고자 하는 SWC 수량의 목표와 허용 오차입니다. 보유량이 목표보다 낮으면 매수 레벨을 더 공격적으로, 높으면 매도 레벨을 더 공격적으로 배치하여
              재고를 균형 있게 유지합니다.
            </li>
            <li>
              <span className="font-semibold text-gray-100">킬스위치 일손실(%)</span> (현재 {killSwitchDailyLossPct}%) — 일 단위 손실률이 임계치를 넘으면 자동으로 전략을 중지하여
              급변/비정상 상황에서 손실 확산을 차단합니다.
            </li>
            <li>
              <span className="font-semibold text-gray-100">PostOnly</span> (현재 {postOnly ? 'ON' : 'OFF'}) — 항상 메이커 주문만 제출합니다. 기존 호가에 즉시 맞물리는 주문(테이커)은 방지하여 수수료 역전 및 불리한 체결을 막습니다.
            </li>
            <li>
              <span className="font-semibold text-gray-100">TIF (Time In Force)</span> (현재 {timeInForce}) — 주문 유효기간/방식입니다.
              <u>GTC</u>(취소 전까지 유지, 기본), <u>IOC</u>(즉시 체결 가능한 수량만 체결 후 나머지 취소),
              <u>FOK</u>(전량 즉시 체결 불가 시 전체 취소) 중 선택합니다. 마켓메이킹+TTL 조합에는 보통 GTC가 권장됩니다.
            </li>
            <li>
              <span className="font-semibold text-gray-100">체결가격</span> (현재 {execPrice}) — 선택한 심볼당 얼마에 매수·매도 할지?
            </li>
            <li>
              <span className="font-semibold text-gray-100">체결량(USDT)</span> (현재 {execUsdt}(USDT)) — 선택한 심볼을 USDT단위로 얼마를 매수·매도 할지?
            </li>
            <li>
              <span className="font-semibold text-gray-100">체결주기(초)</span> (현재 {execPeriodSec}초 마다) — 몇초마다 거래 할게 할지?
            </li>
          </ul>
          <div className="mt-2 text-xs text-gray-400">
            활성화 시 현재 파라미터가 서버에 저장되고 엔진이 시작됩니다. 처음 거래가 없을 때도 북티커/깊이/최근체결을 기반으로 기본 레벨을 생성합니다.
          </div>
        </div>
        {/* Params form */}
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-gray-700">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">초기가격(Anchor)</label>
            <input className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledInputCls} type="number" step="any" value={anchorPrice} onChange={e => setAnchorPrice(e.target.value)} placeholder="0 (없음)" disabled={active} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">탐색모드(Discovery)</label>
            <input type="checkbox" checked={discoveryMode} onChange={e => setDiscoveryMode(e.target.checked)} disabled={active} className={disabledCheckCls} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">목표가격</label>
            <input className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledInputCls} type="number" step="any" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} placeholder="0 (미사용)" disabled={active} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">주문당 USDT</label>
            <input className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledInputCls} type="number" step="any" value={perOrderUsdt} onChange={e => setPerOrderUsdt(e.target.value)} placeholder="10" disabled={active} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">레벨/사이드</label>
            <input className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledInputCls} type="number" step="1" value={levelsPerSide} onChange={e => setLevelsPerSide(e.target.value)} placeholder="3" disabled={active} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">레벨 간격(%)</label>
            <input className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledInputCls} type="number" step="any" value={levelGapPct} onChange={e => setLevelGapPct(e.target.value)} placeholder="0.5" disabled={active} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">최소 스프레드(tick)</label>
            <input className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledInputCls} type="number" step="1" value={minSpreadTicks} onChange={e => setMinSpreadTicks(e.target.value)} placeholder="1" disabled={active} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">TTL(ms)</label>
            <input className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledInputCls} type="number" step="100" value={ttlMs} onChange={e => setTtlMs(e.target.value)} placeholder="1200" disabled={active} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">밴드(±%)</label>
            <input className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledInputCls} type="number" step="any" value={bandPct} onChange={e => setBandPct(e.target.value)} placeholder="1" disabled={active} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">인벤토리 목표(SWC)</label>
            <input className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledInputCls} type="number" step="any" value={inventoryTargetBase} onChange={e => setInventoryTargetBase(e.target.value)} placeholder="0.02" disabled={active} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">인벤토리 밴드(SWC)</label>
            <input className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledInputCls} type="number" step="any" value={inventoryBandBase} onChange={e => setInventoryBandBase(e.target.value)} placeholder="0.01" disabled={active} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">킬스위치 일손실(%)</label>
            <input className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledInputCls} type="number" step="any" value={killSwitchDailyLossPct} onChange={e => setKillSwitchDailyLossPct(e.target.value)} placeholder="0.5" disabled={active} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">PostOnly</label>
            <input type="checkbox" checked={postOnly} onChange={e => setPostOnly(e.target.checked)} disabled={active} className={disabledCheckCls} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">TIF</label>
            <select className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledSelectCls} value={timeInForce} onChange={e => setTimeInForce(e.target.value as any)} disabled={active}>
              <option value="GTC">GTC</option>
              <option value="IOC">IOC</option>
              <option value="FOK">FOK</option>
            </select>
          </div>
          {/* Scheduled pair trade params in main param grid */}
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">체결가격</label>
            <input className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledInputCls} type="number" step="any" value={execPrice} onChange={e=>setExecPrice(e.target.value)} placeholder="12.0000" disabled={active} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">체결량(USDT)</label>
            <input className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledInputCls} type="number" step="any" value={execUsdt} onChange={e=>setExecUsdt(e.target.value)} placeholder="10" disabled={active} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">체결주기(초)</label>
            <input className={"w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" + disabledInputCls} type="number" step="any" value={execPeriodSec} onChange={e=>setExecPeriodSec(e.target.value)} placeholder="60" disabled={active} />
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full text-center align-middle">
            <thead>
              <tr className="bg-gray-900 text-gray-300 text-sm">
                <th colSpan={3} className="py-2 text-indigo-400">{headerTitle}</th>
                <th className="py-2 text-red-400">{headerPrice}</th>
                <th colSpan={3} className="py-2">{formattedTimestamp}</th>
                <th colSpan={3} className="py-2">각 계정별 사용 내역</th>
              </tr>
              <tr className="text-gray-300">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">전체 USDT</th>
                <th className="px-3 py-2">전체 SWC</th>
                <th className="px-3 py-2">사용 가능 USDT</th>
                <th className="px-3 py-2">사용 가능 SWC</th>
                <th className="px-3 py-2">사용 중인 USDT</th>
                <th className="px-3 py-2">사용 중인 SWC</th>
                <th className="px-3 py-2">사용한 USDT</th>
                <th className="px-3 py-2">사용한 SWC</th>
                <th className="px-3 py-2">개별 평단</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td className="px-3 py-6 text-center text-gray-400" colSpan={10}>Loading...</td></tr>
              ) : (
                <>
                  {rows.map((r, idx) => (
                    <tr key={idx} className="border-t border-gray-700">
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2">{r.totalUsdt.toLocaleString()}</td>
                      <td className="px-3 py-2">{r.totalToken.toLocaleString()}</td>
                      <td className="px-3 py-2">{r.availUsdt.toLocaleString()}</td>
                      <td className="px-3 py-2">{r.availToken.toLocaleString()}</td>
                      <td className="px-3 py-2">{r.usingUsdt.toLocaleString()}</td>
                      <td className="px-3 py-2">{r.usingToken.toLocaleString()}</td>
                      <td className="px-3 py-2 text-indigo-400">{(r.usedUsdt || 0).toLocaleString()}</td>
                      <td className="px-3 py-2 text-red-400">{(r.usedToken || 0).toLocaleString()}</td>
                      <td className="px-3 py-2 text-gray-400">{r.avgPrice}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-700 bg-gray-900">
                    <td className="px-3 py-2 font-semibold">합계</td>
                    <td className="px-3 py-2">{totals.totalUsdt.toLocaleString()}</td>
                    <td className="px-3 py-2">{totals.totalToken.toLocaleString()}</td>
                    <td className="px-3 py-2">{totals.availUsdt.toLocaleString()}</td>
                    <td className="px-3 py-2">{totals.availToken.toLocaleString()}</td>
                    <td className="px-3 py-2">{totals.usingUsdt.toLocaleString()}</td>
                    <td className="px-3 py-2">{totals.usingToken.toLocaleString()}</td>
                    <td className="px-3 py-2 text-indigo-400">{totals.usedUsdt.toLocaleString()}</td>
                    <td className="px-3 py-2 text-red-400">{totals.usedToken.toLocaleString()}</td>
                    <td className="px-3 py-2 text-gray-400">{totals.avgPrice.toLocaleString()}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-700">
          <button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 font-semibold">  </button>
        </div>
      </div>



      {/* Manual Mode */}
      <div className="rounded-2xl border border-gray-700 bg-gray-800 shadow-sm mt-6">
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="text-lg font-semibold text-white">수동 모드</div>
        </div>
        {/* Subsection: 매수벽/매도벽 전체 취소 */}
        <div className="px-6 py-4">
          <div className="text-sm font-semibold text-gray-200">매수벽/매도벽 전체 취소</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Symbol choose */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">심볼 선택</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="manual_symbol" defaultChecked />
                  swc_usdt
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="manual_symbol" />
                  trx_usdt
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="manual_symbol" />
                  INPUT
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">직접입력</label>
              <input id="manual_symbol_input" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" type="text" placeholder="ex) swc_usdt" />
            </div>
            {/* Side choose */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">취소 방향</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="manual_side" defaultChecked />
                  ALL
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="manual_side" />
                  SELL
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="manual_side" />
                  BUY
                </label>
              </div>
            </div>
            {/* Account scope */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">대상 계정</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="manual_acct" defaultChecked />
                  전체
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="manual_acct" />
                  첫번째
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="manual_acct" />
                  두번째
                </label>
              </div>
            </div>
            {/* Cancel range */}
            <div className="md:col-span-2 lg:col-span-2 flex items-start justify-between gap-6">
              <label className="text-sm text-gray-300 mt-2">취소 범위</label>
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input
                    type="radio"
                    name="manual_range_mode"
                    checked={cancelRangeMode === 'ALL'}
                    onChange={()=>setCancelRangeMode('ALL')}
                  />
                  전체
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input
                    type="radio"
                    name="manual_range_mode"
                    checked={cancelRangeMode === 'CUSTOM'}
                    onChange={()=>setCancelRangeMode('CUSTOM')}
                  />
                  사용자지정
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="manual_cancel_from"
                    className={`w-36 rounded-md bg-gray-700 border border-gray-600 px-3 py-1.5 text-sm text-gray-100${cancelRangeMode !== 'CUSTOM' ? ' opacity-50 cursor-not-allowed' : ''}`}
                    type="number"
                    step="any"
                    value={cancelFrom}
                    onChange={e=>setCancelFrom(e.target.value)}
                    disabled={cancelRangeMode !== 'CUSTOM'}
                  />
                  <span className="text-gray-400">~</span>
                  <input
                    id="manual_cancel_to"
                    className={`w-36 rounded-md bg-gray-700 border border-gray-600 px-3 py-1.5 text-sm text-gray-100${cancelRangeMode !== 'CUSTOM' ? ' opacity-50 cursor-not-allowed' : ''}`}
                    type="number"
                    step="any"
                    value={cancelTo}
                    onChange={e=>setCancelTo(e.target.value)}
                    disabled={cancelRangeMode !== 'CUSTOM'}
                  />
                </div>
              </div>
            </div>
            {/* Execute button spans all */}
            <div className="md:col-span-2 lg:col-span-3">
              <button
                onClick={async () => {
                  const symRadios = Array.from(document.getElementsByName('manual_symbol')) as HTMLInputElement[];
                  const sideRadios = Array.from(document.getElementsByName('manual_side')) as HTMLInputElement[];
                  const acctRadios = Array.from(document.getElementsByName('manual_acct')) as HTMLInputElement[];
                  const symSel = symRadios.find(r => r.checked);
                  const sideSel = sideRadios.find(r => r.checked);
                  const acctSel = acctRadios.find(r => r.checked);
                  const symbolMode = symSel?.nextSibling?.textContent?.trim() || 'swc_usdt';
                  const sideMode = sideSel?.nextSibling?.textContent?.trim() || 'ALL';
                  const accountMode = (() => {
                    const t = (acctSel?.nextSibling?.textContent || '').trim();
                    if (t === '첫번째') return 'FIRST';
                    if (t === '두번째') return 'SECOND';
                    return 'ALL';
                  })();
                  const symbolInputEl = document.getElementById('manual_symbol_input') as HTMLInputElement | null;
                  const symbol = symbolInputEl?.value || '';
                  try {
                    const res = await fetch(`${API_BASE_URL}/v1/a05-dashboard-02/manual/cancel-walls`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify((() => {
                        const rangeMode = cancelRangeMode;
                        if (rangeMode === 'CUSTOM') {
                          const rangeFrom = parseFloat(cancelFrom || '10');
                          const rangeTo = parseFloat(cancelTo || '15');
                          return { symbolMode, symbol, sideMode, accountMode, rangeMode, rangeFrom, rangeTo };
                        }
                        return { symbolMode, symbol, sideMode, accountMode, rangeMode };
                      })()),
                    });
                    const json = await res.json();
                    if (!res.ok || json?.success === false) {
                      const msg = json?.msg || json?.error || json?.message || '요청 실패';
                      const code = typeof json?.error_code !== 'undefined' ? ` (code=${json.error_code})` : '';
                      const stage = json?.stage ? ` [${json.stage}]` : '';
                      alert(`실패${code}${stage}\n${msg}`);
                      return;
                    }
                    alert(`완료: ${json?.totalCancelled ?? 0}건 취소 (symbol=${json?.symbol}, side=${json?.sideMode}, account=${json?.accountMode})`);
                  } catch (e) {
                    const msg = (e as any)?.message ?? String(e);
                    alert('요청 실패: ' + msg);
                  }
                }}
                className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 font-semibold"
              >
                매수벽/매도벽 전체 취소 실행
              </button>
            </div>
          </div>
        </div>



        {/* Subsection: 매수벽 설정 (moved below cancel section) */}
        <div className="px-6 py-4">
          <div className="text-sm font-semibold text-gray-200">매수벽 설정</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Symbol choose */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">심볼 선택</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="buywall_symbol" defaultChecked />
                  swc_usdt
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="buywall_symbol" />
                  trx_usdt
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="buywall_symbol" />
                  INPUT
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">직접입력</label>
              <input id="buywall_symbol_input" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="text" placeholder="ex) swc_usdt" />
            </div>
          {/* Account choose */}
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">계정 선택</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 text-sm text-gray-200">
                <input type="radio" name="buywall_acct" defaultChecked />
                첫번째
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-200">
                <input type="radio" name="buywall_acct" />
                두번째
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-200">
                <input type="radio" name="buywall_acct" />
                둘다
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">기준금액(USDT)</label>
            <input id="buywall_base_usdt" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="any" placeholder="예: 0.014" value={bwBase} onChange={e=>setBwBase(e.target.value)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">레벨 간격(%)</label>
            <input id="buywall_level_gap" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="any" placeholder="예: 6.0" value={bwGap} onChange={e=>setBwGap(e.target.value)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">주문당 USDT</label>
            <input id="buywall_per_usdt" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="any" placeholder="예: 10" value={bwPer} onChange={e=>setBwPer(e.target.value)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">레벨 수</label>
            <input id="buywall_levels" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="1" placeholder="예: 3" value={bwLevels} onChange={e=>setBwLevels(e.target.value)} />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <button
                onClick={async () => {
                  const symRadios = Array.from(document.getElementsByName('buywall_symbol')) as HTMLInputElement[];
                  const symSel = symRadios.find(r => r.checked);
                  const symbolMode = symSel?.nextSibling?.textContent?.trim() || 'swc_usdt';
                  const symbolInputEl = document.getElementById('buywall_symbol_input') as HTMLInputElement | null;
                const acctRadios = Array.from(document.getElementsByName('buywall_acct')) as HTMLInputElement[];
                const acctSel = acctRadios.find(r => r.checked);
                  const baseUsdtEl = document.getElementById('buywall_base_usdt') as HTMLInputElement | null;
                  const levelGapEl = document.getElementById('buywall_level_gap') as HTMLInputElement | null;
                  const perUsdtEl = document.getElementById('buywall_per_usdt') as HTMLInputElement | null;
                  const levelsEl = document.getElementById('buywall_levels') as HTMLInputElement | null;
                  const symbol = symbolInputEl?.value || '';
                  const baseUsdt = parseFloat(baseUsdtEl?.value || '0');
                  const levelGapPct = parseFloat(levelGapEl?.value || '0.5');
                  const perOrderUsdt = parseFloat(perUsdtEl?.value || '10');
                  const levels = parseInt(levelsEl?.value || '3', 10);
                const accountMode = (() => {
                  const t = (acctSel?.nextSibling?.textContent || '').trim();
                  if (t === '첫번째') return 'FIRST';
                  if (t === '두번째') return 'SECOND';
                  if (t === '둘다') return 'BOTH';
                  return 'AUTO';
                })();
                  try {
                    const res = await fetch(`${API_BASE_URL}/v1/a05-dashboard-02/manual/place-buy-walls`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ symbolMode, symbol, baseUsdt, levelGapPct, perOrderUsdt, levels, accountMode }),
                    });
                    const json = await res.json();
                    if (!res.ok || json?.success === false) {
                      const msg = json?.msg || json?.error || json?.message || '요청 실패';
                      const code = typeof json?.error_code !== 'undefined' ? ` (code=${json.error_code})` : '';
                      const stage = json?.stage ? ` [${json.stage}]` : '';
                      alert(`실패${code}${stage}\n${msg}`);
                      return;
                    }
                    alert(`배치 완료: ${json?.placedCount ?? 0}건 (symbol=${json?.symbol}, levels=${json?.levels})`);
                  } catch (e) {
                    const msg = (e as any)?.message ?? String(e);
                    alert('요청 실패: ' + msg);
                  }
                }}
                className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white py-2.5 font-semibold"
              >
                매수벽 배치 실행
              </button>
            </div>
          {/* Preview table */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="text-sm text-gray-300 mb-2">예시 미리보기 (랜덤 가중치 예: 간격×1.00~1.01, 금액×1.00~1.05)</div>
            <table className="min-w-full text-center align-middle border border-gray-700 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-900 text-gray-300 text-sm">
                  <th className="px-3 py-2">레벨</th>
                  <th className="px-3 py-2">기준가격</th>
                  <th className="px-3 py-2">목표가격(예시)</th>
                  <th className="px-3 py-2">주문당 USDT(예시)</th>
                  <th className="px-3 py-2">수량(예시)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {bwRows.map(r=>(
                  <tr key={r.lvl} className="border-t border-gray-700">
                    <td className="px-3 py-2">{r.lvl}</td>
                    <td className="px-3 py-2 text-gray-300">{r.ref}</td>
                    <td className="px-3 py-2 text-indigo-300">{r.price}</td>
                    <td className="px-3 py-2 text-green-300">{r.usdt}</td>
                    <td className="px-3 py-2 text-gray-200">{r.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>



        {/* Subsection: 매도벽 설정 */}
        <div className="px-6 py-4 border-t border-gray-700">
          <div className="text-sm font-semibold text-gray-200">매도벽 설정</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Symbol choose */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">심볼 선택</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="sellwall_symbol" defaultChecked />
                  swc_usdt
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="sellwall_symbol" />
                  trx_usdt
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="sellwall_symbol" />
                  INPUT
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">직접입력</label>
              <input id="sellwall_symbol_input" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="text" placeholder="ex) swc_usdt" />
            </div>
            {/* Account choose */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">계정 선택</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="sellwall_acct" defaultChecked />
                  첫번째
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="sellwall_acct" />
                  두번째
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-200">
                  <input type="radio" name="sellwall_acct" />
                  둘다
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">기준금액(USDT)</label>
              <input id="sellwall_base_usdt" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="any" placeholder="예: 1.0000" value={swBase} onChange={e=>setSwBase(e.target.value)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">레벨 간격(%)</label>
              <input id="sellwall_level_gap" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="any" placeholder="예: 0.5" value={swGap} onChange={e=>setSwGap(e.target.value)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">주문당 USDT</label>
              <input id="sellwall_per_usdt" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="any" placeholder="예: 10" value={swPer} onChange={e=>setSwPer(e.target.value)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-300">레벨 수</label>
              <input id="sellwall_levels" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="1" placeholder="예: 3" value={swLevels} onChange={e=>setSwLevels(e.target.value)} />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <button
                onClick={async () => {
                  const symRadios = Array.from(document.getElementsByName('sellwall_symbol')) as HTMLInputElement[];
                  const symSel = symRadios.find(r => r.checked);
                  const symbolMode = symSel?.nextSibling?.textContent?.trim() || 'swc_usdt';
                  const symbolInputEl = document.getElementById('sellwall_symbol_input') as HTMLInputElement | null;
                  const acctRadios = Array.from(document.getElementsByName('sellwall_acct')) as HTMLInputElement[];
                  const acctSel = acctRadios.find(r => r.checked);
                  const baseUsdtEl = document.getElementById('sellwall_base_usdt') as HTMLInputElement | null;
                  const levelGapEl = document.getElementById('sellwall_level_gap') as HTMLInputElement | null;
                  const perUsdtEl = document.getElementById('sellwall_per_usdt') as HTMLInputElement | null;
                  const levelsEl = document.getElementById('sellwall_levels') as HTMLInputElement | null;
                  const symbol = symbolInputEl?.value || '';
                  const baseUsdt = parseFloat(baseUsdtEl?.value || '0');
                  const levelGapPct = parseFloat(levelGapEl?.value || '0.5');
                  const perOrderUsdt = parseFloat(perUsdtEl?.value || '10');
                  const levels = parseInt(levelsEl?.value || '3', 10);
                  const accountMode = (() => {
                    const t = (acctSel?.nextSibling?.textContent || '').trim();
                    if (t === '첫번째') return 'FIRST';
                    if (t === '두번째') return 'SECOND';
                    if (t === '둘다') return 'BOTH';
                    return 'AUTO';
                  })();
                  try {
                    const res = await fetch(`${API_BASE_URL}/v1/a05-dashboard-02/manual/place-sell-walls`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ symbolMode, symbol, baseUsdt, levelGapPct, perOrderUsdt, levels, accountMode }),
                    });
                    const json = await res.json();
                    if (!res.ok || json?.success === false) {
                      const msg = json?.msg || json?.error || json?.message || '요청 실패';
                      const code = typeof json?.error_code !== 'undefined' ? ` (code=${json.error_code})` : '';
                      const stage = json?.stage ? ` [${json.stage}]` : '';
                      alert(`실패${code}${stage}\n${msg}`);
                      return;
                    }
                    alert(`배치 완료: ${json?.placedCount ?? 0}건 (symbol=${json?.symbol}, levels=${json?.levels})`);
                  } catch (e) {
                    const msg = (e as any)?.message ?? String(e);
                    alert('요청 실패: ' + msg);
                  }
                }}
                className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-white py-2.5 font-semibold"
              >
                매도벽 배치 실행
              </button>
            </div>

            
            {/* Preview table */}
            <div className="md:col-span-2 lg:col-span-3">
              <div className="text-sm text-gray-300 mb-2">예시 미리보기 (랜덤 가중치 예: 간격×1.00~1.01, 금액×1.00~1.05)</div>
              <table className="min-w-full text-center align-middle border border-gray-700 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-900 text-gray-300 text-sm">
                    <th className="px-3 py-2">레벨</th>
                    <th className="px-3 py-2">기준가격</th>
                    <th className="px-3 py-2">목표가격(예시)</th>
                    <th className="px-3 py-2">주문당 USDT(예시)</th>
                    <th className="px-3 py-2">수량(예시)</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {swRows.map(r=>(
                    <tr key={r.lvl} className="border-t border-gray-700">
                      <td className="px-3 py-2">{r.lvl}</td>
                      <td className="px-3 py-2 text-gray-300">{r.ref}</td>
                      <td className="px-3 py-2 text-indigo-300">{r.price}</td>
                      <td className="px-3 py-2 text-orange-300">{r.usdt}</td>
                      <td className="px-3 py-2 text-gray-200">{r.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>



       {/* Subsection: 매수매도 실행 */}
       <div className="px-6 py-4 border-t border-gray-700">
         <div className="text-sm font-semibold text-gray-200">매수·매도 즉시 실행</div>
         <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {/* Symbol choose */}
           <div className="flex items-center justify-between gap-3">
             <label className="text-sm text-gray-300">심볼 선택</label>
             <div className="flex items-center gap-3">
               <label className="flex items-center gap-1 text-sm text-gray-200">
                 <input type="radio" name="quick_symbol" defaultChecked />
                 swc_usdt
               </label>
               <label className="flex items-center gap-1 text-sm text-gray-200">
                 <input type="radio" name="quick_symbol" />
                 trx_usdt
               </label>
               <label className="flex items-center gap-1 text-sm text-gray-200">
                 <input type="radio" name="quick_symbol" />
                 INPUT
               </label>
             </div>
           </div>
           <div className="flex items-center justify-between gap-3">
             <label className="text-sm text-gray-300">직접입력</label>
             <input id="quick_symbol_input" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="text" placeholder="ex) swc_usdt" />
           </div>
          <div className="flex items-center justify-between gap-3">
             <label className="text-sm text-gray-300">체결가격</label>
            <input id="quick_base_usdt" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="any" placeholder="예: 15.0000" value={qpBase} onChange={e=>setQpBase(e.target.value)} />
           </div>
           <div className="flex items-center justify-between gap-3">
             <label className="text-sm text-gray-300">체결량(USDT)</label>
            <input id="quick_per_usdt" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="any" placeholder="예: 10" value={qpPer} onChange={e=>setQpPer(e.target.value)} />
           </div>
           {/* Buyer account */}
           <div className="flex items-center justify-between gap-3">
             <label className="text-sm text-gray-300">매수 계정</label>
             <div className="flex items-center gap-3">
               <label className="flex items-center gap-1 text-sm text-gray-200">
                 <input type="radio" name="quick_buyer" defaultChecked />
                 첫번째
               </label>
               <label className="flex items-center gap-1 text-sm text-gray-200">
                 <input type="radio" name="quick_buyer" />
                 두번째
               </label>
             </div>
           </div>
          <div className="md:col-span-2 lg:col-span-3">
            {/* Quick pair preview */}
            <div className="mb-3 text-sm text-gray-300">
              {qpPreview ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-gray-400">예시:</span>
                  <span>가격 <span className="text-indigo-300 font-semibold">{qpPreview.price}</span></span>
                  <span>USDT <span className="text-green-300 font-semibold">{qpPreview.usdt}</span></span>
                  <span>수량 <span className="text-gray-200 font-semibold">{qpPreview.qty}</span></span>
                </div>
              ) : (
                <span className="text-gray-500">가격과 USDT를 입력하면 예시가 표시됩니다.</span>
              )}
            </div>
             <button
               onClick={async ()=>{
                 const symRadios = Array.from(document.getElementsByName('quick_symbol')) as HTMLInputElement[];
                 const symSel = symRadios.find(r=>r.checked);
                 const symbolMode = symSel?.nextSibling?.textContent?.trim() || 'swc_usdt';
                 const symbolInputEl = document.getElementById('quick_symbol_input') as HTMLInputElement | null;
                 const baseUsdtEl = document.getElementById('quick_base_usdt') as HTMLInputElement | null;
                 const perUsdtEl = document.getElementById('quick_per_usdt') as HTMLInputElement | null;
                 const buyerRadios = Array.from(document.getElementsByName('quick_buyer')) as HTMLInputElement[];
                 const buyerSel = buyerRadios.find(r=>r.checked);
                 const symbol = symbolInputEl?.value || '';
                 const baseUsdt = parseFloat(baseUsdtEl?.value || '0');
                 const perOrderUsdt = parseFloat(perUsdtEl?.value || '10');
                 const buyer = ((buyerSel?.nextSibling as any)?.textContent || '').trim() === '두번째' ? 'SECOND' : 'FIRST';
                 try {
                   const res = await fetch(`${API_BASE_URL}/v1/a05-dashboard-02/manual/quick-pair`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ symbolMode, symbol, baseUsdt, perOrderUsdt, buyer }),
                   });
                   const json = await res.json();
                   if (!res.ok || json?.success === false) {
                     const msg = json?.msg || json?.error || json?.message || '요청 실패';
                     const code = typeof json?.error_code !== 'undefined' ? ` (code=${json.error_code})` : '';
                     const stage = json?.stage ? ` [${json.stage}]` : '';
                     const sym = json?.symbol ? ` {${json.symbol}}` : '';
                     alert(`실패${code}${stage}${sym}\n${msg}`);
                     return;
                   }
                   const placed = (json?.placed || []).map((p:any)=>`${p.side}/${p.account}/${p.orderId}`).join(', ');
                   const cancelled = (json?.cancelled || []).map((c:any)=>`${c.side}/${c.account}/${c.orderId}:${c.status}`).join(', ');
                   alert(`완료\n가격=${json?.price}, 수량=${json?.qty}\n배치: ${placed}\n취소: ${cancelled}`);
                 } catch (e) {
                   const msg = (e as any)?.message ?? String(e);
                   alert('요청 실패: ' + msg);
                 }
               }}
               className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 font-semibold"
             >
               매수·매도 즉시 실행 (부분체결 발생 시 양측 모두 취소)
             </button>
           </div>
         </div>
       </div>


      {/* Subsection: 수동운전 모드 */}
      <div className="px-6 py-4 border-t border-gray-700">
        <div className="text-sm font-semibold text-gray-200">수동운전 모드 (시간·가격 입력)</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">년</label>
            <input id="anchor_year" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="1" placeholder="YYYY" defaultValue={new Date().getFullYear()} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">월</label>
            <input id="anchor_month" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="1" placeholder="MM" defaultValue={new Date().getMonth()+1} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">일</label>
            <input id="anchor_day" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="1" placeholder="DD" defaultValue={new Date().getDate()} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">시</label>
            <input id="anchor_hour" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="1" placeholder="HH (0~23)" defaultValue={new Date().getHours()} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">분</label>
            <input id="anchor_minute" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="1" placeholder="mm" defaultValue={new Date().getMinutes()} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">초</label>
            <input id="anchor_second" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="1" placeholder="ss" defaultValue={new Date().getSeconds()} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-300">금액</label>
            <input id="anchor_price" className="w-36 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100" type="number" step="any" placeholder="예: 1.2345" />
          </div>
          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 gap-4">
            <div className="flex items-center gap-2 w-full">
            <button
              onClick={async () => {
                // Set current time as defaults and clear price on click
                try {
                  const now = new Date();
                  const setIfEmpty = (id: string, v: string) => {
                    const el = document.getElementById(id) as HTMLInputElement | null;
                    if (el && (el.value === '' || el.value == null)) el.value = v;
                  };
                  setIfEmpty('anchor_year', String(now.getFullYear()));
                  setIfEmpty('anchor_month', String(now.getMonth() + 1));
                  setIfEmpty('anchor_day', String(now.getDate()));
                  setIfEmpty('anchor_hour', String(now.getHours()));
                  setIfEmpty('anchor_minute', String(now.getMinutes()));
                  setIfEmpty('anchor_second', String(now.getSeconds()));
                  // clear price only if not a valid positive number already
                  const priceEl = document.getElementById('anchor_price') as HTMLInputElement | null;
                  const priceVal = priceEl?.value ?? '';
                  if (!(parseFloat(priceVal) > 0)) {
                    if (priceEl) priceEl.value = '';
                  }
                } catch {}
                const y = parseInt((document.getElementById('anchor_year') as HTMLInputElement)?.value || '0', 10);
                const mo = parseInt((document.getElementById('anchor_month') as HTMLInputElement)?.value || '0', 10);
                const d = parseInt((document.getElementById('anchor_day') as HTMLInputElement)?.value || '0', 10);
                const h = parseInt((document.getElementById('anchor_hour') as HTMLInputElement)?.value || '0', 10);
                const mi = parseInt((document.getElementById('anchor_minute') as HTMLInputElement)?.value || '0', 10);
                const s = parseInt((document.getElementById('anchor_second') as HTMLInputElement)?.value || '0', 10);
                const price = parseFloat((document.getElementById('anchor_price') as HTMLInputElement)?.value || '0');
                if (!(y>0 && mo>0 && d>0 && price>0)) { alert('년/월/일/금액은 필수입니다.'); return; }
                try {
                  const res = await fetch(`${API_BASE_URL}/v1/a05-dashboard-02/manual/set-anchor`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ year: y, month: mo, day: d, hour: h, minute: mi, second: s, price }),
                  });
                  const json = await res.json();
                  if (!res.ok || json?.success === false) {
                    const msg = json?.msg || json?.error || json?.message || '요청 실패';
                    alert(`실패\n${msg}`);
                    return;
                  }
                  alert(`저장 완료\nKST=${json?.saved?.isoKst}\nUTC=${json?.saved?.isoUtc}\n가격=${json?.saved?.price}`);
                } catch (e) {
                  alert('요청 실패: ' + ((e as any)?.message ?? String(e)));
                }
              }}
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 font-semibold"
            >
              입력
            </button>
            <button
              onClick={async ()=>{
                try {
                  const res = await fetch(`${API_BASE_URL}/v1/a05-dashboard-02/manual/list-anchor`, { cache: 'no-store' });
                  const json = await res.json();
                  if (!res.ok || json?.success === false) {
                    const msg = json?.msg || json?.error || json?.message || '요청 실패';
                    alert(`실패\n${msg}`);
                    return;
                  }
                  const list: Array<{ price:number; timestamp:number; }> = Array.isArray(json?.items) ? json.items : [];
                  // render below
                  const container = document.getElementById('anchor_list_output');
                  if (container) {
                    const fmt = (ts:number) => {
                      try {
                        return new Date(ts).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
                      } catch { return String(ts); }
                    };
                    container.innerHTML = list.map((it, idx) => (
                      `<div class="flex justify-between text-sm py-0.5">
                        <span class="text-gray-300">${idx+1}.</span>
                        <span class="text-gray-200">${fmt(it.timestamp)}</span>
                        <span class="text-indigo-300">${it.price}</span>
                      </div>`
                    )).join('') || '<div class="text-sm text-gray-500">데이터가 없습니다.</div>';
                  }
                } catch (e) {
                  alert('요청 실패: ' + ((e as any)?.message ?? String(e)));
                }
              }}
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-semibold"
            >
              출력
            </button>
            <button
              onClick={async ()=>{
                try {
                  const res = await fetch(`${API_BASE_URL}/v1/a05-dashboard-02/manual/clear-anchor`, {
                    method: 'POST',
                  });
                  const json = await res.json();
                  if (!res.ok || json?.success === false) {
                    const msg = json?.msg || json?.error || json?.message || '요청 실패';
                    alert(`실패\n${msg}`);
                    return;
                  }
                  ['anchor_year','anchor_month','anchor_day','anchor_hour','anchor_minute','anchor_second','anchor_price'].forEach(id=>{
                    const el = document.getElementById(id) as HTMLInputElement | null;
                    if (el) el.value = '';
                  });
                  alert('"현시간 이전 삭제" 완료');
                } catch (e) {
                  alert('요청 실패: ' + ((e as any)?.message ?? String(e)));
                }
              }}
              className="flex-1 rounded-xl bg-gray-600 hover:bg-gray-700 text-white py-2.5 font-semibold"
            >
              현시간 이전 삭제
            </button>
            <button
              onClick={async ()=>{
                try {
                  const res = await fetch(`${API_BASE_URL}/v1/a05-dashboard-02/manual/clear-anchor`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode: 'ALL', all: true }),
                  });
                  const json = await res.json();
                  if (!res.ok || json?.success === false) {
                    const msg = json?.msg || json?.error || json?.message || '요청 실패';
                    alert(`실패\n${msg}`);
                    return;
                  }
                  ['anchor_year','anchor_month','anchor_day','anchor_hour','anchor_minute','anchor_second','anchor_price'].forEach(id=>{
                    const el = document.getElementById(id) as HTMLInputElement | null;
                    if (el) el.value = '';
                  });
                  alert('"전체 삭제" 완료');
                } catch (e) {
                  alert('요청 실패: ' + ((e as any)?.message ?? String(e)));
                }
              }}
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 font-semibold"
            >
              전체 삭제
            </button>
            </div>
            
          </div>
          <div className="md:col-span-2 lg:col-span-3 mt-3">
            <div className="text-sm text-gray-300 mb-2">저장된 목록 (GMT+9)</div>
            <div id="anchor_list_output" className="space-y-0.5"></div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}


