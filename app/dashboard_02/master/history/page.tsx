'use client';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../_config/env';

type TransactionItem = {
  orderId: string;
  symbol: string;
  side: string;
  price: number;
  qty: number;
  quoteQty: number;
  fee: number;
  feeAsset: string;
  time: number;
  isMaker: boolean;
};

export default function HistoryPage() {
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [symbolMode, setSymbolMode] = useState<string>('swc_usdt');
  const [symbol, setSymbol] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [limit, setLimit] = useState<number>(100);
  const [fetchAll, setFetchAll] = useState<boolean>(true); // Fetch all transactions until endTime

  // Helper function to format date as yyyy-MM-dd HH:mm:ss in KST
  const formatDateTimeKST = (date: Date): string => {
    // Convert to KST (UTC+9)
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const yyyy = kstDate.getUTCFullYear();
    const MM = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
    const DD = String(kstDate.getUTCDate()).padStart(2, '0');
    const hh = String(kstDate.getUTCHours()).padStart(2, '0');
    const mm = String(kstDate.getUTCMinutes()).padStart(2, '0');
    const ss = String(kstDate.getUTCSeconds()).padStart(2, '0');
    return `${yyyy}-${MM}-${DD} ${hh}:${mm}:${ss}`;
  };

  // Initialize default time range (12 hours ago to now) in KST
  useEffect(() => {
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    
    setStartTime(formatDateTimeKST(twelveHoursAgo));
    setEndTime(formatDateTimeKST(now));
  }, []);

  // Convert KST (UTC+9) to UTC+8 for API request
  const convertKSTToUTC8 = (kstTimeStr: string): string => {
    // Parse KST time string: yyyy-MM-dd HH:mm:ss
    const [datePart, timePart] = kstTimeStr.split(' ');
    const [yyyy, MM, DD] = datePart.split('-').map(Number);
    const [hh, mm, ss] = timePart.split(':').map(Number);
    
    // Create Date object assuming KST (UTC+9)
    // Then subtract 1 hour to convert to UTC+8
    const kstDate = new Date(Date.UTC(yyyy, MM - 1, DD, hh, mm, ss));
    const utc8Date = new Date(kstDate.getTime() - 1 * 60 * 60 * 1000); // KST - 1 hour = UTC+8
    
    const yyyy8 = utc8Date.getUTCFullYear();
    const MM8 = String(utc8Date.getUTCMonth() + 1).padStart(2, '0');
    const DD8 = String(utc8Date.getUTCDate()).padStart(2, '0');
    const hh8 = String(utc8Date.getUTCHours()).padStart(2, '0');
    const mm8 = String(utc8Date.getUTCMinutes()).padStart(2, '0');
    const ss8 = String(utc8Date.getUTCSeconds()).padStart(2, '0');
    
    return `${yyyy8}-${MM8}-${DD8} ${hh8}:${mm8}:${ss8}`;
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const allItems: TransactionItem[] = [];
      let hasMore = true;
      const maxIterations = 1000; // Safety limit
      let iteration = 0;

      // Validate time formats
      const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        console.warn('Invalid time format. Expected: yyyy-MM-dd HH:mm:ss');
        setItems([]);
        return;
      }

      // Convert endTime to UTC+8 timestamp for comparison
      const utc8EndTime = convertKSTToUTC8(endTime);
      const [endDatePart, endTimePart] = utc8EndTime.split(' ');
      const [endYyyy, endMM, endDD] = endDatePart.split('-').map(Number);
      const [endHh, endMm, endSs] = endTimePart.split(':').map(Number);
      const endTimestamp = new Date(Date.UTC(endYyyy, endMM - 1, endDD, endHh, endMm, endSs)).getTime();

      // Start with initial startTime
      let currentStartTime = startTime;

      while (hasMore && iteration < maxIterations) {
        iteration++;
        const qs = new URLSearchParams();
        if (symbolMode) qs.set('symbolMode', symbolMode);
        if (symbolMode === 'INPUT' && symbol) qs.set('symbol', symbol);
        
        // Convert current startTime (KST) to UTC+8 for API request
        const utc8StartTime = convertKSTToUTC8(currentStartTime);
        qs.set('startTime', utc8StartTime);
        
        // Always use original endTime
        const utc8EndTimeStr = convertKSTToUTC8(endTime);
        qs.set('endTime', utc8EndTimeStr);
        
        qs.set('limit', String(limit));

        console.log(`[Fetch ${iteration}] startTime=${utc8StartTime}, endTime=${utc8EndTimeStr}`);

        const token = localStorage.getItem('token');
        const url = `${API_BASE_URL}/v1/a05-dashboard-02/transactions/history?${qs.toString()}`;
        
        const res = await fetch(url, {
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
            // Authorization: token ? `Bearer ${token}` : '',
          },
        });
        const json = await res.json();
        
        console.log(`[Fetch ${iteration}] Response: success=${json?.success}, items=${json?.items?.length || 0}`);
        
        if (json?.success && Array.isArray(json.items) && json.items.length > 0) {
          // Filter items that are within endTime
          const filteredItems = json.items.filter((item: TransactionItem) => {
            return item.time <= endTimestamp;
          });
          
          console.log(`[Fetch ${iteration}] Filtered: ${filteredItems.length} items within endTime`);
          
          allItems.push(...filteredItems);
          console.log(`[Fetch ${iteration}] Total items so far: ${allItems.length}`);
          
          // Check if we should continue fetching
          if (fetchAll) {
            // Get the last item from original response (not filtered) for pagination
            const lastItem = json.items[json.items.length - 1];
            
            console.log(`[Fetch ${iteration}] Last item time: ${lastItem.time}, endTimestamp: ${endTimestamp}`);
            
            // Continue if:
            // 1. We got full limit of items
            // 2. Last item is still within endTime range
            if (json.items.length === limit && lastItem.time <= endTimestamp) {
              // Use last item's time + 1 second as new startTime (to avoid duplicate)
              // API returns timestamp in UTC+8, we need to convert it to KST (UTC+9) string format
              // Important: API timestamp represents UTC+8 time, but JavaScript Date treats it as UTC
              // To convert UTC+8 timestamp to KST: add 1 hour (UTC+8 -> UTC+9)
              // const nextStartTimestamp = lastItem.time + 1000; // Add 1 second
              const nextStartTimestamp = lastItem.time;
              
              // API timestamp is UTC+8, JavaScript Date treats it as UTC
              // To get KST from UTC+8 timestamp: add 1 hour
              // But since Date treats it as UTC, we need to add 1 hour to get KST
              const kstTimestamp = nextStartTimestamp + 9 * 60 * 60 * 1000; // UTC+8 + 1 hour = KST
              const kstDate = new Date(kstTimestamp);
              
              // Use UTC methods because we've already adjusted for timezone
              const kstYyyy = kstDate.getUTCFullYear();
              const kstMM = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
              const kstDD = String(kstDate.getUTCDate()).padStart(2, '0');
              const kstHh = String(kstDate.getUTCHours()).padStart(2, '0');
              const kstMm = String(kstDate.getUTCMinutes()).padStart(2, '0');
              const kstSs = String(kstDate.getUTCSeconds()).padStart(2, '0');
              currentStartTime = `${kstYyyy}-${kstMM}-${kstDD} ${kstHh}:${kstMm}:${kstSs}`;
              
              hasMore = true;
              console.log(`[Fetch ${iteration}] ✅ Continuing with new startTime (KST): ${currentStartTime}, original timestamp: ${nextStartTimestamp}`);
            } else {
              // Stop if we got less than limit OR last item is past endTime
              hasMore = false;
              console.log(`[Fetch ${iteration}] 🛑 Stopping: items=${json.items.length}, limit=${limit}, lastTime=${lastItem.time}, endTimestamp=${endTimestamp}`);
            }
          } else {
            // If fetchAll is false, only fetch once
            hasMore = false;
            console.log(`[Fetch ${iteration}] 🛑 fetchAll is false, stopping`);
          }
        } else {
          // No items returned, stop fetching
          hasMore = false;
          console.log(`[Fetch ${iteration}] 🛑 No items returned, stopping. Response:`, json);
        }
      }
      
      console.log(`[Fetch] Complete! Total items before deduplication: ${allItems.length}, Iterations: ${iteration}`);
      
      // Remove duplicates by orderId
      const uniqueItemsMap = new Map<string, TransactionItem>();
      allItems.forEach((item) => {
        if (item.orderId && !uniqueItemsMap.has(item.orderId)) {
          uniqueItemsMap.set(item.orderId, item);
        }
      });
      const uniqueItems = Array.from(uniqueItemsMap.values());
      
      // Sort by time (newest first)
      uniqueItems.sort((a, b) => b.time - a.time);
      
      console.log(`[Fetch] After deduplication: ${uniqueItems.length} unique items`);
      
      setItems(uniqueItems);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startTime && endTime) {
      fetchTransactions();
    }
  }, []); // Initial load only

  const formatTime = (timestamp: number): string => {
    if (!timestamp) return '-';
    // API returns timestamp in UTC+8, convert to KST (UTC+9) for display
    // UTC+8 + 1 hour = KST (UTC+9)
    const date = new Date(timestamp);
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000); // UTC+8 + 1 hour = KST
    const yyyy = kstDate.getUTCFullYear();
    const MM = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
    const DD = String(kstDate.getUTCDate()).padStart(2, '0');
    const hh = String(kstDate.getUTCHours()).padStart(2, '0');
    const mm = String(kstDate.getUTCMinutes()).padStart(2, '0');
    const ss = String(kstDate.getUTCSeconds()).padStart(2, '0');
    return `${yyyy}-${MM}-${DD} ${hh}:${mm}:${ss}`;
  };

  // Export to CSV/Excel
  const exportToExcel = () => {
    if (items.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    // CSV header
    const headers = ['시간', '주문 ID', '심볼', '방향', '가격', '수량', '거래 금액', '수수료', '수수료 자산', 'Maker'];
    const csvRows = [headers.join(',')];

    // CSV data rows
    items.forEach((item) => {
      const row = [
        formatTime(item.time),
        item.orderId,
        item.symbol,
        item.side === 'buy' || item.side === 'BUY' ? '매수' : '매도',
        item.price?.toString() ?? '',
        item.qty?.toString() ?? '',
        item.quoteQty?.toString() ?? '',
        item.fee?.toString() ?? '',
        item.feeAsset || '',
        item.isMaker ? 'Y' : 'N',
      ];
      // Escape commas and quotes in CSV
      const escapedRow = row.map(cell => {
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      csvRows.push(escapedRow.join(','));
    });

    // Create CSV content
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Generate filename with current date/time
    const now = new Date();
    const filename = `거래내역_${symbolMode}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 min-h-[70vh] bg-gray-900 text-gray-100 p-4 md:p-6 rounded-xl">
      <div className="rounded-2xl border border-gray-700 bg-gray-800 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">거래 내역</h3>
          <div className="text-sm text-gray-400 mt-1">LBank 거래 내역 조회</div>
          
          {/* Filters */}
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-sm text-gray-300 block mb-1">심볼</label>
                <select
                  value={symbolMode}
                  onChange={(e) => setSymbolMode(e.target.value)}
                  className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-sm text-gray-100"
                >
                  <option value="swc_usdt">SWC/USDT</option>
                  <option value="trx_usdt">TRX/USDT</option>
                  <option value="INPUT">직접 입력</option>
                </select>
              </div>
              
              {symbolMode === 'INPUT' && (
                <div>
                  <label className="text-sm text-gray-300 block mb-1">심볼 입력</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="예: btc_usdt"
                    className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-sm text-gray-100"
                  />
                </div>
              )}

              <div>
                <label className="text-sm text-gray-300 block mb-1">시작 시간 (KST)</label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="yyyy-MM-dd HH:mm:ss"
                  pattern="\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}"
                  className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-sm text-gray-100 font-mono"
                />
                <div className="text-xs text-gray-500 mt-1">예: 2024-01-15 14:30:00</div>
              </div>

              <div>
                <label className="text-sm text-gray-300 block mb-1">종료 시간 (KST)</label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="yyyy-MM-dd HH:mm:ss"
                  pattern="\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}"
                  className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-sm text-gray-100 font-mono"
                />
                <div className="text-xs text-gray-500 mt-1">예: 2024-01-15 14:30:00</div>
              </div>

              <div>
                <label className="text-sm text-gray-300 block mb-1">조회 개수 (1-100)</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(Math.min(Math.max(Number(e.target.value), 1), 100))}
                  min={1}
                  max={100}
                  className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-sm text-gray-100"
                />
                <div className="text-xs text-gray-500 mt-1">페이지당 조회 개수</div>
              </div>

              <div>
                <label className="text-sm text-gray-300 block mb-1">전체 조회</label>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={fetchAll}
                    onChange={(e) => setFetchAll(e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                  />
                  <span className="text-sm text-gray-300 ml-2">종료시간까지 모든 거래 조회</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchTransactions}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md text-sm font-medium"
              >
                {loading ? '조회 중...' : '조회'}
              </button>
              {items.length > 0 && (
                <button
                  onClick={exportToExcel}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-md text-sm font-medium"
                >
                  엑셀 저장 ({items.length}건)
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="min-w-full text-center align-middle">
            <thead>
              <tr className="bg-gray-900 text-gray-300 text-sm">
                <th className="px-3 py-2">시간</th>
                <th className="px-3 py-2">주문 ID</th>
                <th className="px-3 py-2">심볼</th>
                <th className="px-3 py-2">방향</th>
                <th className="px-3 py-2">가격</th>
                <th className="px-3 py-2">수량</th>
                <th className="px-3 py-2">거래 금액</th>
                <th className="px-3 py-2">수수료</th>
                <th className="px-3 py-2">Maker</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td className="px-3 py-6 text-center text-gray-400" colSpan={9}>
                    조회 중...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-center text-gray-400" colSpan={9}>
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={idx} className="border-t border-gray-700">
                    <td className="px-3 py-2">{formatTime(item.time)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{item.orderId.slice(0, 8)}...</td>
                    <td className="px-3 py-2">{item.symbol}</td>
                    <td className={`px-3 py-2 ${item.side === 'buy' || item.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                      {item.side === 'buy' || item.side === 'BUY' ? '매수' : '매도'}
                    </td>
                    <td className="px-3 py-2">{item.price?.toLocaleString() ?? '-'}</td>
                    <td className="px-3 py-2">{item.qty?.toLocaleString() ?? '-'}</td>
                    <td className="px-3 py-2">{item.quoteQty?.toLocaleString() ?? '-'}</td>
                    <td className="px-3 py-2 text-yellow-400">
                      {item.fee?.toLocaleString() ?? '-'} {item.feeAsset || ''}
                    </td>
                    <td className="px-3 py-2">{item.isMaker ? '✓' : '-'}</td>
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
