export default function ResultsPage() {
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
            <h3 className="text-lg font-semibold text-white">Group 3</h3>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full text-center align-middle">
            <thead>
              <tr className="bg-gray-900 text-gray-300 text-sm">
                <th colSpan={3} className="py-2 text-indigo-400">TAVA_BYBIT</th>
                <th className="py-2 text-red-400">0.01518</th>
                <th colSpan={3} className="py-2">2025.03.03 10:00</th>
                <th colSpan={3} className="py-2">각 계정별 사용 내역</th>
              </tr>
              <tr className="text-gray-300">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">전체 USDT</th>
                <th className="px-3 py-2">전체 TAVA</th>
                <th className="px-3 py-2">사용 가능 USDT</th>
                <th className="px-3 py-2">사용 가능 TAVA</th>
                <th className="px-3 py-2">사용 중인 USDT</th>
                <th className="px-3 py-2">사용 중인 TAVA</th>
                <th className="px-3 py-2">사용한 USDT</th>
                <th className="px-3 py-2">사용한 TAVA</th>
                <th className="px-3 py-2">개별 평단</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-t border-gray-700">
                <td className="px-3 py-2">1.TABA_BYBIT_01</td>
                <td className="px-3 py-2">15,137.52</td>
                <td className="px-3 py-2">246,040</td>
                <td className="px-3 py-2">5,158.51</td>
                <td className="px-3 py-2">160,016</td>
                <td className="px-3 py-2">9,979.02</td>
                <td className="px-3 py-2">86,024</td>
                <td className="px-3 py-2 text-indigo-400">-780</td>
                <td className="px-3 py-2 text-red-400">51,145</td>
                <td className="px-3 py-2 text-gray-400">-0,01525</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="px-3 py-2">2.TABA_BYBIT_02</td>
                <td className="px-3 py-2">15,137.52</td>
                <td className="px-3 py-2">246,040</td>
                <td className="px-3 py-2">5,158.51</td>
                <td className="px-3 py-2">160,016</td>
                <td className="px-3 py-2">9,979.02</td>
                <td className="px-3 py-2">86,024</td>
                <td className="px-3 py-2 text-indigo-400">-780</td>
                <td className="px-3 py-2 text-red-400">51,145</td>
                <td className="px-3 py-2 text-gray-400">-0,01525</td>
              </tr>
              <tr className="border-t border-gray-700 bg-gray-900">
                <td className="px-3 py-2 font-semibold">합계</td>
                <td className="px-3 py-2">32,748</td>
                <td className="px-3 py-2">784,690</td>
                <td className="px-3 py-2">22,473</td>
                <td className="px-3 py-2">625,070</td>
                <td className="px-3 py-2">10,274</td>
                <td className="px-3 py-2">159,620</td>
                <td className="px-3 py-2 text-indigo-400" rowSpan={2}>-780</td>
                <td className="px-3 py-2 text-red-400" rowSpan={2}>51,145</td>
                <td className="px-3 py-2 text-gray-400" rowSpan={2}>-0,01525</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="px-3 py-2">작전대비</td>
                <td className="px-3 py-2 text-indigo-400">-709</td>
                <td className="px-3 py-2 text-red-400">34,553</td>
                <td className="px-3 py-2 text-gray-400">평단</td>
                <td className="px-3 py-2 text-gray-400">-0.02052</td>
                <td className="px-3 py-2 bg-red-900/30">USDT 총합</td>
                <td className="px-3 py-2 bg-red-900/30">44,659</td>
              </tr>
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


