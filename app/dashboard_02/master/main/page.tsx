export default function MasterMainPage() {
  return (
    <div className="space-y-7">
      {/* 상단 요약 테이블 */}
      <div className="rounded-2xl border border-gray-700 bg-gray-800 shadow-sm overflow-hidden">
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full text-center align-middle">
            <thead>
              <tr className="bg-gray-900 text-gray-300">
                <th className="px-3 py-2">Account</th>
                <th className="px-3 py-2">Total Market</th>
                <th className="px-3 py-2">Total Token</th>
                <th className="px-3 py-2">Frozen</th>
                <th className="px-3 py-2">Available</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-200">
              <tr className="border-t border-gray-700">
                <td className="px-3 py-2">1</td>
                <td className="px-3 py-2">Market Name</td>
                <td className="px-3 py-2">Token value</td>
                <td className="px-3 py-2">Frozen value</td>
                <td className="px-3 py-2"><span className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300">가동중</span></td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="px-3 py-2">2</td>
                <td className="px-3 py-2">Market Name</td>
                <td className="px-3 py-2">Token value</td>
                <td className="px-3 py-2">Frozen value</td>
                <td className="px-3 py-2"><span className="px-2 py-0.5 rounded bg-rose-900/40 text-rose-300">중지중</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Group 1 카드 */}
      <div className="rounded-2xl border border-gray-700 bg-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-gray-100">
              <h3 className="text-lg font-semibold inline-block">Group 1</h3>
              <small className="inline-block ml-2 text-gray-400 align-middle">SWC</small>
              <span className="ml-2 align-middle px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 text-xs">가동중</span>
            </div>
            <div>
              <button className="text-indigo-300 hover:text-indigo-200 text-sm">그룹수정</button>
            </div>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full text-center align-middle">
            <thead>
              <tr className="bg-gray-900 text-gray-300">
                <th className="px-3 py-2">Account</th>
                <th className="px-3 py-2">Total Market</th>
                <th className="px-3 py-2">Total Token</th>
                <th className="px-3 py-2">Frozen</th>
                <th className="px-3 py-2">Available</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-200">
              <tr className="border-t border-gray-700">
                <td className="px-3 py-2">LBANK_1</td>
                <td className="px-3 py-2">Market Name</td>
                <td className="px-3 py-2">Token value</td>
                <td className="px-3 py-2">Frozen value</td>
                <td className="px-3 py-2"><span className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300">가동중</span></td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="px-3 py-2">LBANK_2</td>
                <td className="px-3 py-2">Market Name</td>
                <td className="px-3 py-2">Token value</td>
                <td className="px-3 py-2">Frozen value</td>
                <td className="px-3 py-2"><span className="px-2 py-0.5 rounded bg-rose-900/40 text-rose-300">중지중</span></td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-gray-900 text-gray-300">
                <th className="px-3 py-2">Total</th>
                <td className="px-3 py-2">500,000원</td>
                <td className="px-3 py-2">500,000원</td>
                <td className="px-3 py-2">500,000원</td>
                <td className="px-3 py-2">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Group 2 카드 */}
      <div className="rounded-2xl border border-gray-700 bg-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-gray-100">
              <h3 className="text-lg font-semibold inline-block">Group 2</h3>
              <small className="inline-block ml-2 text-gray-400 align-middle">아비트리지</small>
              <span className="ml-2 align-middle px-2 py-0.5 rounded bg-rose-900/40 text-rose-300 text-xs">중지중</span>
            </div>
            <div>
              <button className="text-indigo-300 hover:text-indigo-200 text-sm">그룹수정</button>
            </div>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full text-center align-middle">
            <thead>
              <tr className="bg-gray-900 text-gray-300">
                <th className="px-3 py-2">Account</th>
                <th className="px-3 py-2">Total Market</th>
                <th className="px-3 py-2">Total Token</th>
                <th className="px-3 py-2">Frozen</th>
                <th className="px-3 py-2">Available</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-200">
              <tr className="border-t border-gray-700">
                <td className="px-3 py-2">LBANK_1</td>
                <td className="px-3 py-2">Market Name</td>
                <td className="px-3 py-2">Token value</td>
                <td className="px-3 py-2">Frozen value</td>
                <td className="px-3 py-2"><span className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300">가동중</span></td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="px-3 py-2">LBANK_2</td>
                <td className="px-3 py-2">Market Name</td>
                <td className="px-3 py-2">Token value</td>
                <td className="px-3 py-2">Frozen value</td>
                <td className="px-3 py-2"><span className="px-2 py-0.5 rounded bg-rose-900/40 text-rose-300">중지중</span></td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-gray-900 text-gray-300">
                <th className="px-3 py-2">Total</th>
                <td className="px-3 py-2">500,000원</td>
                <td className="px-3 py-2">500,000원</td>
                <td className="px-3 py-2">500,000원</td>
                <td className="px-3 py-2">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}


