'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

const LEAGUE_DETAIL_PATH = '/league/detail';
const LEAGUE_CREATE_PATH = '/league/create';
const LEAGUE_JOIN_PATH = '/league/join';
const LAST_LEAGUE_ID_KEY = 'lastLeagueId';
const SELECTED_LEAGUE_ID_KEY = 'selectedLeagueId';

type LeagueSummary = {
	id: string;
	name: string;
};

function normalizeLeagues(payload: unknown): LeagueSummary[] {
	const data = payload as Record<string, unknown> | null;
	const candidates = [
		Array.isArray(payload) ? payload : null,
		Array.isArray(data?.leagues) ? data?.leagues : null,
		Array.isArray(data?.data) ? data?.data : null,
		Array.isArray((data?.data as Record<string, unknown> | null)?.leagues)
			? (data?.data as Record<string, unknown>).leagues
			: null,
	];

	const raw = candidates.find(Boolean) as unknown[] | undefined;
	if (!raw) return [];

	return raw.map((item, index) => {
		const league = item as Record<string, unknown> | null;
		const id =
			league?.league_id ??
			league?.id ??
			league?.leagueId ??
			league?.idLega ??
			index;
		const name =
			(league?.league_name as string | undefined) ??
			(league?.name as string | undefined) ??
			(league?.nome as string | undefined) ??
			`Lega ${index + 1}`;
		return {
			id: String(id),
			name,
		};
	});
}

export default function Dashboard() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [leagues, setLeagues] = useState<LeagueSummary[]>([]);
	const [lastLeagueId, setLastLeagueId] = useState<string | null>(null);

	useEffect(() => {
		const storedLastLeagueId = localStorage.getItem(LAST_LEAGUE_ID_KEY);
		setLastLeagueId(storedLastLeagueId);

		let isMounted = true;

		const loadLeagues = async () => {
			setIsLoading(true);
			setError('');

			const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
			if (!token) {
				router.replace('/');
				return;
			}

			try {
				const response = await fetch(`${API_BASE}/F1/Users/checkUser2League`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ token }),
				});

				const data = await response.json();
				const normalized = normalizeLeagues(data);

				if (!isMounted) return;
				setLeagues(normalized);
			} catch (err) {
				if (!isMounted) return;
				console.error('Errore durante il controllo delle leghe:', err);
				setError('Non riesco a recuperare le leghe. Riprova.');
			} finally {
				if (!isMounted) return;
				setIsLoading(false);
			}
		};

		void loadLeagues();

		return () => {
			isMounted = false;
		};
	}, [router]);

	const openLeague = (leagueId: string) => {
		localStorage.setItem(LAST_LEAGUE_ID_KEY, leagueId);
		localStorage.setItem(SELECTED_LEAGUE_ID_KEY, leagueId);
		router.push(LEAGUE_DETAIL_PATH);
	};

	useEffect(() => {
		if (leagues.length === 1) {
			const leagueId = leagues[0].id;
			localStorage.setItem(LAST_LEAGUE_ID_KEY, leagueId);
			localStorage.setItem(SELECTED_LEAGUE_ID_KEY, leagueId);
			router.replace(LEAGUE_DETAIL_PATH);
		}
	}, [leagues, router]);

	const sortedLeagues =
		leagues.length > 1 && lastLeagueId
			? [...leagues].sort((a, b) => {
					if (a.id === lastLeagueId) return -1;
					if (b.id === lastLeagueId) return 1;
					return 0;
				})
			: leagues;

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
			<div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-16">
				<header className="mb-10">
					<h1 className="text-4xl font-bold text-red-500 dark:text-red-400">
						Le tue leghe
					</h1>
					<p className="mt-2 text-zinc-600 dark:text-zinc-400">
						Gestisci le tue leghe o creane una nuova.
					</p>
				</header>

				{isLoading && (
					<div className="flex flex-1 items-center justify-center">
						<div className="rounded-lg border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
							Sto controllando le tue leghe...
						</div>
					</div>
				)}

				{!isLoading && error && (
					<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
						{error}
					</div>
				)}

				{!isLoading && !error && leagues.length > 1 && (
					<div className="grid gap-6 md:grid-cols-2">
						{sortedLeagues.map((league) => (
							<div
								key={league.id}
								className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
							>
								<div>
									<p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
										Lega
									</p>
									<h2 className="mt-2 text-2xl font-semibold">
										{league.name}
									</h2>
									{league.id === lastLeagueId && (
										<p className="mt-2 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300">
											Ultima aperta
										</p>
									)}
								</div>
								<button
									onClick={() => openLeague(league.id)}
									className="mt-6 inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
								>
									Entra nella lega
								</button>
							</div>
						))}
					</div>
				)}

				{!isLoading && !error && leagues.length === 0 && (
					<div className="grid gap-6 md:grid-cols-2">
						<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
							<h2 className="text-2xl font-semibold">Crea una lega</h2>
							<p className="mt-2 text-zinc-600 dark:text-zinc-400">
								Inizia la tua competizione invitando amici.
							</p>
							<Link
								href={LEAGUE_CREATE_PATH}
								className="mt-6 inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
							>
								Crea lega
							</Link>
						</div>
						<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
							<h2 className="text-2xl font-semibold">Unisciti a una lega</h2>
							<p className="mt-2 text-zinc-600 dark:text-zinc-400">
								Inserisci il codice di invito che hai ricevuto.
							</p>
							<Link
								href={LEAGUE_JOIN_PATH}
								className="mt-6 inline-flex items-center justify-center rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:text-red-700 dark:border-red-900/60 dark:text-red-300"
							>
								Unisciti
							</Link>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
