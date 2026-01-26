import { redirect } from 'next/navigation';

export default function NotFound() {
  redirect('/');
}

// export default function NotFound() {
//   return (
//     <div className="flex items-center justify-center min-h-screen flex-col">
//       <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
//       <p className="text-lg">죄송합니다. 찾으려는 페이지가 존재하지 않습니다.</p>
//     </div>
//   );
// }
