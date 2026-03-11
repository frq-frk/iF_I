'use client'

import Link from 'next/link';
import { useActionState } from 'react';
import { login } from '../actions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const initialState = {
  message: null,
  user: null,
};

const LoginPage = () => {
  const [state, formAction] = useActionState(login, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.user) {
      router.push('/');
    }
  }, [state.user, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center">Login</h1>
        <form action={formAction} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full px-4 py-2 mt-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full px-4 py-2 mt-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
          {state.message && <p className="text-red-500 text-sm mt-2">{state.message}</p>}
        </form>
        <p className="text-center">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
