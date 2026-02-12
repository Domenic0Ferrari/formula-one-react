'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';
const SELECTED_LEAGUE_ID_KEY = 'selectedLeagueId';

type LeagueDetail = {
	id: string;
	name: string;
	description: string;
	isSuperUser: boolean;
	createdAt: number | null;
	updatedAt: number | null;
};

function normalizeLeagueDetail(payload: unknown): LeagueDetail | null {
	const data = payload as Record<string, unknown> | null;
	const sourceCandidates = [
		Array.isArray(payload) ? payload[0] : null,
		Array.isArray(data?.data) ? (data?.data as unknown[])[0] : null,
		(data?.data as Record<string, unknown> | undefined) ?? null,
		data,
	];
	const source = sourceCandidates.find(Boolean) as Record<string, unknown> | null;

	if (!source) return null;

	const id = source.league_id ?? source.id ?? source.leagueId ?? source.idLega;
	if (id === undefined || id === null) return null;

	const createdAtRaw = source.created_at ?? source.createdAt;
	const updatedAtRaw = source.updated_at ?? source.updatedAt;
	const createdAt =
		typeof createdAtRaw === 'number' ? createdAtRaw : createdAtRaw ? Number(createdAtRaw) : null;
	const updatedAt =
		typeof updatedAtRaw === 'number' ? updatedAtRaw : updatedAtRaw ? Number(updatedAtRaw) : null;

	return {
		id: String(id),
		name:
			(source.league_name as string | undefined) ??
			(source.name as string | undefined) ??
			(source.nome as string | undefined) ??
			'Lega',
		description:
			(source.league_description as string | undefined) ??
			(source.description as string | undefined) ??
			(source.descrizione as string | undefined) ??
			'Nessuna descrizione disponibile.',
		isSuperUser: Number(source.super_user ?? source.is_super_user ?? 0) === 1,
		createdAt: Number.isNaN(createdAt) ? null : createdAt,
		updatedAt: Number.isNaN(updatedAt) ? null : updatedAt,
	};
}

function formatUnixTimestamp(timestamp: number | null): string {
	if (!timestamp) return '-';
	const date = new Date(timestamp * 1000);
	if (Number.isNaN(date.getTime())) return '-';
	return date.toLocaleString('it-IT');
}

export default function LeagueDetailPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [league, setLeague] = useState<LeagueDetail | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadLeagueDetail = async () => {
			setIsLoading(true);
			setError('');

			const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
			if (!token) {
				router.replace('/');
				return;
			}

			const selectedLeagueId = localStorage.getItem(SELECTED_LEAGUE_ID_KEY);
			if (!selectedLeagueId) {
				router.replace('/dashboard');
				return;
			}

			try {
				const response = await fetch(`${API_BASE}/F1/League/getActiveLeagueDetails`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						token,
						jsonData: JSON.stringify({
							league_id: selectedLeagueId,
						}),
					}),
				});

				const data = await response.json();

				if (!response.ok || data?.status === 'error') {
					if (!isMounted) return;
					setError(data?.message || 'Non riesco a caricare i dettagli della lega.');
					return;
				}

				const normalized = normalizeLeagueDetail(data);
				if (!isMounted) return;

				if (!normalized) {
					setError('Dettagli lega non validi.');
					return;
				}

				setLeague(normalized);
			} catch (err) {
				if (!isMounted) return;
				console.error('Errore durante il caricamento dettagli lega:', err);
				setError('Errore di rete. Riprova.');
			} finally {
				if (!isMounted) return;
				setIsLoading(false);
			}
		};

		void loadLeagueDetail();

		return () => {
			isMounted = false;
		};
	}, [router]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-black dark:text-zinc-50">
				<div className="rounded-lg border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
					Sto caricando i dettagli della lega...
				</div>
			</div>
		);
	}

	if (!league) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-black dark:text-zinc-50">
				<div className="rounded-lg border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
					Dettagli lega non disponibili.
				</div>
			</div>
		);
	}

	return (
		<SidebarProvider>
			<AppSidebar leagueName={league.name} isSuperUser={league.isSuperUser} />

			<SidebarInset>
				<div className="min-h-screen bg-zinc-50 px-6 py-8 text-zinc-900 dark:bg-black dark:text-zinc-50">
					<div className="mx-auto w-full max-w-4xl">
						<div className="mb-6 flex items-center gap-3">
							<SidebarTrigger />
							<p className="text-sm text-zinc-500 dark:text-zinc-400">Area lega</p>
						</div>

						{error && (
							<div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
								{error}
							</div>
						)}

						<div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
						<h1 className="text-3xl font-semibold">{league.name}</h1>
						<p className="mt-3 text-zinc-600 dark:text-zinc-400">{league.description}</p>
						<div className="mt-4 space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
							<p>ID lega: {league.id}</p>
							<p>Ruolo: {league.isSuperUser ? 'Super utente' : 'Partecipante'}</p>
							<p>Creata il: {formatUnixTimestamp(league.createdAt)}</p>
							<p>Ultima modifica: {formatUnixTimestamp(league.updatedAt)}</p>
						</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
