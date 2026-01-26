"use client";
import Image from "next/image";
import { API_BASE_URL } from "../../_config/env";

export default function LoginPage() {
  const googleAuthUrl = `${API_BASE_URL}/v1/a03-auth/google`;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold">로그인</h1>
        <a href={googleAuthUrl} className="inline-flex items-center gap-3 px-6 py-3 rounded-md border hover:bg-gray-50">
          <Image src="/globe.svg" alt="Google" width={24} height={24} />
          <span className="font-medium">Google로 로그인</span>
        </a>
      </div>
    </div>
  );
}