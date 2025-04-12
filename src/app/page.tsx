import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center p-6">
      <h1 className="text-4xl font-bold mb-4">Welcome to SpoilSports!</h1>
      <p className="text-xl text-gray-700 mb-8">
        Ready to test your knowledge of iconic sports moments?
      </p>
      <Link href="/dashboard" className="bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-indigo-700 transition duration-300">
          Get Started
      </Link>
      <p className="mt-4 text-sm text-gray-500">(
        You'll be asked to log in or sign up if you haven't already
      )</p>
    </div>
  );
}
