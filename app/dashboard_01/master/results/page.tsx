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
  const [target, setTarget] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/a04-dashboard-01/main_result`, { cache: 'no-store' });
        // const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        // const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        // const res = await fetch(`${API_BASE_URL}/v1/a04-dashboard-01/main_result`, { cache: 'no-store', headers });
        const json = await res.json();
        if (mounted) setData(json);
      } catch {
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/a04-dashboard-01/getActiveMexc`, { cache: 'no-store' });
        const json = await res.json();
        if (mounted) setActive(!!json);
      } catch {
        if (mounted) setActive(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleActive = async () => {
    try {
      // 1) send target to server
      const n = parseFloat(target);
      if (!Number.isNaN(n) && Number.isFinite(n)) {
        await fetch(`${API_BASE_URL}/v1/a04-dashboard-01/setTarget`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: n }),
        });
      }
      // 2) toggle active
      await fetch(`${API_BASE_URL}/v1/a04-dashboard-01/setActiveMexc`, { cache: 'no-store' });
      const res = await fetch(`${API_BASE_URL}/v1/a04-dashboard-01/getActiveMexc`, { cache: 'no-store' });
      const json = await res.json();
      setActive(!!json);
    } catch {
      // ignore
    }
  };

  const rows = useMemo(() => {
    return data?.rows ?? [];
  }, [data]);

  const totals = useMemo(() => {
    return data?.totals ?? { totalUsdt: 0, totalToken: 0, availUsdt: 0, availToken: 0, usingUsdt: 0, usingToken: 0, usedUsdt: 0, usedToken: 0, avgPrice: 0};
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Mexc</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">목표값</span>
              <input
                type="number"
                step="any"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="10.2"
                className="w-28 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={toggleActive}
              className={[
                'px-4 py-2 rounded-md text-sm font-semibold transition-colors',
                active
                  ? 'bg-green-600 hover:bg-green-700 text-white border border-green-500'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600',
              ].join(' ')}
              aria-pressed={active}
            >
              {active ? '활성화됨' : '비활성화'}
            </button>
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
          <button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 font-semibold">그룹수정하기</button>
        </div>
      </div>
    </div>
  );
}


