export default function UserMainPage() {
  return (
    <div className="space-y-7">
      {/* 상단 요약 테이블 */}
      {/* <div className="rounded-2xl border border-gray-700 bg-gray-800 shadow-sm overflow-hidden">
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
                <td className="px-3 py-2">gate_liy_1</td>
                <td className="px-3 py-2">Market Name</td>
                <td className="px-3 py-2">Token value</td>
                <td className="px-3 py-2">Frozen value</td>
                <td className="px-3 py-2"><span className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300">가동중</span></td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="px-3 py-2">gate_liy_2</td>
                <td className="px-3 py-2">Market Name</td>
                <td className="px-3 py-2">Token value</td>
                <td className="px-3 py-2">Frozen value</td>
                <td className="px-3 py-2"><span className="px-2 py-0.5 rounded bg-rose-900/40 text-rose-300">중지중</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div> */}

      {/* 탭 컨텐츠: bot01 - 메인 표 섹션 */}
      <div className="rounded-2xl border border-gray-700 bg-gray-800 shadow-sm overflow-hidden p-6">
        {/* 매수 테이블 */}
        <div className="rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-center align-middle table-fixed">
              <thead>
                <tr className="text-gray-100 bg-gray-900">
                  <th className="px-2 py-2">가격</th>
                  <th className="px-2 py-2">수량</th>
                  <th className="px-2 py-2">합계(USDT)</th>
                  <th className="px-2 py-2">퀵 매수/매도</th>
                  <th className="px-2 py-2">누적수량</th>
                  <th className="px-2 py-2">누적금액</th>
                  <th className="px-2 py-2">나의수량</th>
                  <th className="px-2 py-2">거래</th>
                  <th className="px-2 py-2">단일취소</th>
                  <th className="px-2 py-2">범위취소</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="border-t border-gray-700 text-red-200">
                    <td className="px-2 py-1">0.001312</td>
                    <td className="px-2 py-1">6,509.76</td>
                    <td className="px-2 py-1">8.540805</td>
                    <td className="px-2 py-1">
                      <div className="flex gap-1 justify-center flex-wrap">
                        {['만','십만','백만','오백만','천만'].map((l) => (
                          <button key={l} className="px-1.5 py-0.5 rounded bg-rose-700 hover:bg-rose-600 text-white text-[11px]">{l}</button>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-1">6,509.76</td>
                    <td className="px-2 py-1">1,550.371397</td>
                    <td className="px-2 py-1 text-red-300">0</td>
                    <td className="px-2 py-1 text-red-300">매수</td>
                    <td className="px-2 py-1"></td>
                    <td className="px-2 py-1"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <hr className="my-6 border-gray-700" />

        {/* 범위설정호가 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          <div className="md:col-auto text-gray-100 font-semibold text-sm">범위설정호가</div>
          <div className="md:col-span-11">
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
              <input type="number" placeholder="가격최소" className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100" />
              <input type="number" placeholder="가격최대" className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100" />
              <div className="flex gap-2">
                <input type="number" placeholder="총 수량" className="flex-1 rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100" />
                <button type="button" className="px-3 py-2 rounded-md bg-gray-700 text-gray-100">변환</button>
              </div>
              <input type="number" placeholder="호가수량" className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100" />
              <select className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100">
                <option>선택</option>
                <option>옵션 1</option>
                <option>옵션 2</option>
              </select>
              <button type="submit" className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white">호가생성</button>
            </form>
          </div>
        </div>

        <hr className="my-6 border-gray-700" />

        {/* 매수/매도 설정 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between text-gray-100">
              <div>매수주문</div>
              <button className="px-2 py-1 rounded-md bg-gray-700 text-gray-100 text-sm">전체삭제</button>
            </div>
            <div className="mt-3 overflow-x-auto rounded-md border border-gray-700">
              <table className="min-w-full text-center align-middle">
                <thead className="bg-gray-900 text-gray-300">
                  <tr>
                    <th className="px-2 py-1">가격</th>
                    <th className="px-2 py-1">수량</th>
                    <th className="px-2 py-1">취소</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-200">
                  <tr className="border-t border-gray-700"><td className="px-2 py-1">5,000,000</td><td className="px-2 py-1">1.54894</td><td className="px-2 py-1">-</td></tr>
                  <tr className="border-t border-gray-700"><td className="px-2 py-1">5,000,000</td><td className="px-2 py-1">1.54894</td><td className="px-2 py-1">-</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="grid grid-cols-12 items-end gap-2 text-gray-100">
              <div className="col-auto"><button className="px-3 py-1 rounded-md bg-gray-700">매수 취소</button></div>
              <div className="col-span-6 text-center text-xl">현재가 : 0.001318</div>
              <div className="col-auto"><button className="px-3 py-1 rounded-md bg-gray-700">매도 취소</button></div>
              <div className="col-span-2">
                <label className="block text-sm mb-1">가격</label>
                <input type="number" className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm mb-1">수량</label>
                <input type="number" className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100" />
              </div>
            </div>
            <div className="mt-2 flex gap-1 overflow-auto">
              {[1,3,5,10,30,50,100,110,150,200].map((n) => (
                <button key={n} className="px-2 py-1 rounded-md bg-rose-700 text-white text-sm whitespace-nowrap">{n}</button>
              ))}
              <button className="px-3 py-1 rounded-md bg-rose-700 text-white text-sm whitespace-nowrap">매수</button>
              <button className="px-3 py-1 rounded-md bg-rose-700 text-white text-sm whitespace-nowrap">매도</button>
            </div>
            <div className="mt-2 flex gap-1 overflow-auto">
              {[1,3,5,10,30,50,100,110,150,200].map((n) => (
                <button key={n} className="px-2 py-1 rounded-md bg-indigo-700 text-white text-sm whitespace-nowrap">{n}</button>
              ))}
              <button className="px-3 py-1 rounded-md bg-indigo-700 text-white text-sm whitespace-nowrap">시장가 매수</button>
              <button className="px-3 py-1 rounded-md bg-indigo-700 text-white text-sm whitespace-nowrap">시장가 매도</button>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="flex items-center justify-between text-gray-100">
              <div>매도주문</div>
              <button className="px-2 py-1 rounded-md bg-gray-700 text-gray-100 text-sm">전체삭제</button>
            </div>
            <div className="mt-3 overflow-x-auto rounded-md border border-gray-700">
              <table className="min-w-full text-center align-middle">
                <thead className="bg-gray-900 text-gray-300">
                  <tr>
                    <th className="px-2 py-1">가격</th>
                    <th className="px-2 py-1">수량</th>
                    <th className="px-2 py-1">취소</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-200">
                  <tr className="border-t border-gray-700"><td className="px-2 py-2" colSpan={3}>주문 내역이 없습니다.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 매도 테이블 */}
        <hr className="my-6 border-gray-700" />
        <div className="rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-center align-middle table-fixed">
              <thead>
                <tr className="text-gray-100 bg-gray-900">
                  <th className="px-2 py-2">가격</th>
                  <th className="px-2 py-2">수량</th>
                  <th className="px-2 py-2">합계(USDT)</th>
                  <th className="px-2 py-2">퀵 매수/매도</th>
                  <th className="px-2 py-2">누적수량</th>
                  <th className="px-2 py-2">누적금액</th>
                  <th className="px-2 py-2">나의수량</th>
                  <th className="px-2 py-2">거래</th>
                  <th className="px-2 py-2">단일취소</th>
                  <th className="px-2 py-2">범위취소</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="border-t border-gray-700 text-blue-200">
                    <td className="px-2 py-1">0.001312</td>
                    <td className="px-2 py-1">6,509.76</td>
                    <td className="px-2 py-1">8.540805</td>
                    <td className="px-2 py-1">
                      <div className="flex gap-1 justify-center flex-wrap">
                        {['만','십만','백만','오백만','천만'].map((l) => (
                          <button key={l} className="px-1.5 py-0.5 rounded bg-indigo-700 hover:bg-indigo-600 text-white text-[11px]">{l}</button>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-1">6,509.76</td>
                    <td className="px-2 py-1">1,550.371397</td>
                    <td className="px-2 py-1 text-blue-300">0</td>
                    <td className="px-2 py-1 text-blue-300">매도</td>
                    <td className="px-2 py-1"></td>
                    <td className="px-2 py-1"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
