'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../_providers/AuthContext';
import { API_BASE_URL } from '../../_config/env';

export default function PendingApprovalPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const onRefresh = () => {
    // 전역 로그아웃 처리 후 구글 로그인 재시작
    // logout();
    window.location.href = `${API_BASE_URL}/v1/a03-auth/google`;
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white/80 backdrop-blur-md border border-gray-100 shadow-xl rounded-3xl p-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
            <span className="text-3xl">⏳</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">관리자 승인 대기 중</h1>
          <p className="text-gray-600 leading-relaxed">
            가입과 휴대폰 인증이 완료되었습니다. 관리자 승인 후 서비스 이용이 가능합니다.
            승인에는 다소 시간이 소요될 수 있습니다.
          </p>

          <div className="w-full mt-2 grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-gray-200 p-4 text-left">
              <p className="text-sm text-gray-700">
                상태: <span className="font-semibold text-indigo-600">승인 대기</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-white font-semibold shadow hover:bg-indigo-700"
            >
              새로고침
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace('/');
              }}
              className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-gray-800 font-semibold hover:bg-gray-50"
            >
              메인으로
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            문의가 필요하신가요? 관리자에게 연락해 승인을 요청하세요.
          </p>
        </div>
      </div>
    </div>
  );
}


