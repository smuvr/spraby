import {Link, Head} from '@inertiajs/react';
import {PageProps} from '@/types'; // Импортируем типы, созданные Breeze

export default function Home({auth}: PageProps) {
    return (
        <>
            <Head title="Welcome"/>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <h1 className="text-4xl font-bold text-green-600">Frontend (React + TS)</h1>
                <p className="mt-4 text-red-600">Это публичная часть сайта.</p>

                <div className="mt-6">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="text-sm text-gray-700 underline">
                            Go to Admin Dashboard
                        </Link>
                    ) : (
                        <Link href={route('login')} className="text-sm text-gray-700 underline">
                            Log in to Admin
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
