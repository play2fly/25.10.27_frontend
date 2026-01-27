// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-[70vh] bg-gradient-to-b from-white to-blue-50">
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          환영합니다 👋
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          구글 로그인 → 휴대폰 인증 → 관리자 승인 후 서비스를 이용할 수 있습니다.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/auth/login"
            className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold shadow hover:bg-blue-700"
          >
            시작하기
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm border">
          <div className="text-3xl">🔐</div>
          <h3 className="mt-3 text-xl font-bold">구글 로그인</h3>
          <p className="mt-2 text-gray-600">Google 계정으로 간편하게 시작하세요.</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border">
          <div className="text-3xl">📱</div>
          <h3 className="mt-3 text-xl font-bold">휴대폰 인증</h3>
          <p className="mt-2 text-gray-600">안전한 이용을 위해 휴대폰 번호를 등록합니다.</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border">
          <div className="text-3xl">✅</div>
          <h3 className="mt-3 text-xl font-bold">관리자 승인</h3>
          <p className="mt-2 text-gray-600">승인 완료 후 모든 기능을 사용할 수 있습니다.</p>
        </div>
      </section>
    </main>
  );
}
