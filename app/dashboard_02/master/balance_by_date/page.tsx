'use client';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../_config/env';

type DailyItem = {
  dateKst: string;
  hourKst: number;
  capturedAtUtc: string;
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
  source?: string;
  symbolMode?: string;
  symbol?: string;
};

export default function ResultsPage() {
  const [items, setItems] = useState<DailyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [accountId, setAccountId] = useState<string>('TOTAL');
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // load account list
        const ra = await fetch(`${API_BASE_URL}/v1/a05-dashboard-02/balances/accounts`, { cache: 'no-store' });
        const ja = await ra.json();
        if (!cancelled) {
          const list = Array.isArray(ja?.items) ? ja.items : [];
          setAccounts(list);
          if (list.includes('TOTAL')) setAccountId('TOTAL');
          else if (list.length > 0) setAccountId(list[0]);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        qs.set('days', '30');
        if (accountId) qs.set('accountId', accountId);
        const url = `${API_BASE_URL}/v1/a05-dashboard-02/balances/daily?${qs.toString()}`;
        const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
        const json = await res.json();
        if (cancelled) return;
        const arr: DailyItem[] = Array.isArray(json?.items) ? json.items : [];
        setItems(arr);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [accountId]);

  return (
    <div className="space-y-6 min-h-[70vh] bg-gray-900 text-gray-100 p-4 md:p-6 rounded-xl">
      <div className="rounded-2xl border border-gray-700 bg-gray-800 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">일별 잔고 (KST 00:00 기준)</h3>
          <div className="text-sm text-gray-400 mt-1">최근 30일</div>
          <div className="mt-3">
            <label className="text-sm text-gray-300 mr-2">계정</label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-gray-100"
            >
              {(['TOTAL', ...accounts.filter(a => a !== 'TOTAL')]).map((a, idx) => (
                <option key={idx} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full text-center align-middle">
            <thead>
              <tr className="bg-gray-900 text-gray-300 text-sm">
                <th className="px-3 py-2">날짜(KST)</th>
                <th className="px-3 py-2">전체 USDT</th>
                <th className="px-3 py-2">전체 TOKEN</th>
                <th className="px-3 py-2">사용 가능 USDT</th>
                <th className="px-3 py-2">사용 가능 TOKEN</th>
                <th className="px-3 py-2">사용 중 USDT</th>
                <th className="px-3 py-2">사용 중 TOKEN</th>
                <th className="px-3 py-2">사용한 USDT</th>
                <th className="px-3 py-2">사용한 TOKEN</th>
                <th className="px-3 py-2">평단</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td className="px-3 py-6 text-center text-gray-400" colSpan={10}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="px-3 py-6 text-center text-gray-400" colSpan={10}>데이터가 없습니다.</td></tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={idx} className="border-t border-gray-700">
                    <td className="px-3 py-2">{it.dateKst}</td>
                    <td className="px-3 py-2">{it.totals.totalUsdt?.toLocaleString?.() ?? it.totals.totalUsdt}</td>
                    <td className="px-3 py-2">{it.totals.totalToken?.toLocaleString?.() ?? it.totals.totalToken}</td>
                    <td className="px-3 py-2">{it.totals.availUsdt?.toLocaleString?.() ?? it.totals.availUsdt}</td>
                    <td className="px-3 py-2">{it.totals.availToken?.toLocaleString?.() ?? it.totals.availToken}</td>
                    <td className="px-3 py-2">{it.totals.usingUsdt?.toLocaleString?.() ?? it.totals.usingUsdt}</td>
                    <td className="px-3 py-2">{it.totals.usingToken?.toLocaleString?.() ?? it.totals.usingToken}</td>
                    <td className="px-3 py-2 text-indigo-400">{it.totals.usedUsdt?.toLocaleString?.() ?? it.totals.usedUsdt}</td>
                    <td className="px-3 py-2 text-red-400">{it.totals.usedToken?.toLocaleString?.() ?? it.totals.usedToken}</td>
                    <td className="px-3 py-2 text-gray-400">{it.totals.avgPrice?.toLocaleString?.() ?? it.totals.avgPrice}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}