'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SELECTED_LEAGUE_ID_KEY = 'selectedLeagueId';

export default function LeagueDetailPage() {
	const router = useRouter();

	useEffect(() => {
		const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
		if (!token) {
			router.replace('/');
			return;
		}

		const selectedLeagueId = localStorage.getItem(SELECTED_LEAGUE_ID_KEY);
		if (!selectedLeagueId) {
			router.replace('/dashboard');
		}
	}, [router]);

	return (
		<div className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-black dark:text-zinc-50">
			<div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
				<h1 className="text-3xl font-semibold">Dettaglio lega</h1>
				<p className="mt-3 text-zinc-600 dark:text-zinc-400">
					Pagina pronta: qui puoi caricare i dati della lega usando l&apos;id salvato in
					<code className="mx-1 rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">selectedLeagueId</code>
					nel localStorage.
				</p>
			</div>
		</div>
	);
}
