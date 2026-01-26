'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PhoneRegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/auth/login');
    }
  }, [router]);

  const formatPhone = (value: string) => {
    // 숫자만 남기고 010-1234-5678 형태로 포맷
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length < 4) return digits;
    if (digits.length < 8) return `${digits.slice(0,3)}-${digits.slice(3)}`;
    return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const raw = phone.replace(/\D/g, '');
    if (raw.length < 10) {
      setError('유효한 휴대폰 번호를 입력하세요.');
      return;
    }
    setSubmitting(true);
    try {
      // TODO: 백엔드 연동 시 아래 요청으로 교체하세요.
      // const token = localStorage.getItem('accessToken');
      // await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/users/phone`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      //   body: JSON.stringify({ phoneNumber: raw })
      // });
      // 임시 성공 플로우
      localStorage.setItem('pendingPhone', raw);
      router.replace('/dashboard_02');
    } catch (e) {
      setError('등록 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-2">휴대폰 번호 등록</h1>
        <p className="text-gray-500 mb-6">서비스 이용을 위해 휴대폰 번호를 등록해 주세요.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">휴대폰 번호</label>
            <div className="relative">
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={onChange}
                placeholder="010-1234-5678"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">KR</span>
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? '등록 중...' : '휴대폰 번호 등록'}
          </button>
        </form>
      </div>
    </div>
  );
}


