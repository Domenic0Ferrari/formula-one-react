'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';
const SELECTED_LEAGUE_ID_KEY = 'selectedLeagueId';

type LeagueDetail = {
	id: string;
	name: string;
	isSuperUser: boolean;
};

type Driver = {
	id: string;
	name: string;
	team: string;
	number: string;
};

const FALLBACK_DRIVERS: Driver[] = [
	{ id: '44', name: 'Lewis Hamilton', team: 'Ferrari', number: '44' },
	{ id: '16', name: 'Charles Leclerc', team: 'Ferrari', number: '16' },
	{ id: '1', name: 'Max Verstappen', team: 'Red Bull', number: '1' },
	{ id: '11', name: 'Sergio Perez', team: 'Red Bull', number: '11' },
	{ id: '4', name: 'Lando Norris', team: 'McLaren', number: '4' },
	{ id: '81', name: 'Oscar Piastri', team: 'McLaren', number: '81' },
	{ id: '63', name: 'George Russell', team: 'Mercedes', number: '63' },
	{ id: '12', name: 'Kimi Antonelli', team: 'Mercedes', number: '12' },
];

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

	return {
		id: String(id),
		name:
			(source.league_name as string | undefined) ??
			(source.name as string | undefined) ??
			(source.nome as string | undefined) ??
			'Lega',
		isSuperUser: Number(source.super_user ?? source.is_super_user ?? 0) === 1,
	};
}

function normalizeDrivers(payload: unknown): Driver[] {
	const data = payload as Record<string, unknown> | null;
	const candidates = [
		Array.isArray(payload) ? payload : null,
		Array.isArray(data?.drivers) ? data?.drivers : null,
		Array.isArray(data?.data) ? data?.data : null,
		Array.isArray((data?.data as Record<string, unknown> | null)?.drivers)
			? (data?.data as Record<string, unknown>).drivers
			: null,
	];

	const raw = candidates.find(Boolean) as unknown[] | undefined;
	if (!raw) return [];

	return raw.map((item, index) => {
		const driver = item as Record<string, unknown> | null;
		const id =
			driver?.driver_id ?? driver?.id ?? driver?.driverId ?? driver?.numero ?? driver?.number ?? index;

		return {
			id: String(id),
			name:
				(driver?.driver_name as string | undefined) ??
				(driver?.name as string | undefined) ??
				(driver?.nome as string | undefined) ??
				`Pilota ${index + 1}`,
			team:
				(driver?.team_name as string | undefined) ??
				(driver?.team as string | undefined) ??
				(driver?.scuderia as string | undefined) ??
				'N/D',
			number: String(
				driver?.driver_number ?? driver?.number ?? driver?.numero ?? driver?.id ?? ''
			),
		};
	});
}

export default function LeagueDriversPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [league, setLeague] = useState<LeagueDetail | null>(null);
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);

	useEffect(() => {
		let isMounted = true;

		const loadPageData = async () => {
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
				const [leagueResponse, driversResponse] = await Promise.all([
					fetch(`${API_BASE}/F1/League/getActiveLeagueDetails`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							token,
							jsonData: JSON.stringify({ league_id: selectedLeagueId }),
						}),
					}),
					fetch(`${API_BASE}/F1/Drivers/getAllDrivers`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ token }),
					}),
				]);

				const [leagueData, driversData] = await Promise.all([
					leagueResponse.json(),
					driversResponse.json(),
				]);

				if (!isMounted) return;

				if (!leagueResponse.ok || leagueData?.status === 'error') {
					setError(leagueData?.message || 'Non riesco a caricare i dettagli della lega.');
					return;
				}

				const normalizedLeague = normalizeLeagueDetail(leagueData);
				if (!normalizedLeague) {
					setError('Dettagli lega non validi.');
					return;
				}
				setLeague(normalizedLeague);

				const normalizedDrivers = driversResponse.ok
					? normalizeDrivers(driversData)
					: [];
				setDrivers(normalizedDrivers.length > 0 ? normalizedDrivers : FALLBACK_DRIVERS);
			} catch (err) {
				if (!isMounted) return;
				console.error('Errore durante il caricamento piloti:', err);
				setLeague((current) => current);
				setDrivers(FALLBACK_DRIVERS);
			} finally {
				if (!isMounted) return;
				setIsLoading(false);
			}
		};

		void loadPageData();

		return () => {
			isMounted = false;
		};
	}, [router]);

	useEffect(() => {
		if (!league) return;

		const storageKey = `selectedDrivers:${league.id}`;
		const stored = localStorage.getItem(storageKey);
		if (!stored) return;

		try {
			const parsed = JSON.parse(stored);
			if (Array.isArray(parsed)) {
				setSelectedDriverIds(parsed.map((id) => String(id)));
			}
		} catch {
			setSelectedDriverIds([]);
		}
	}, [league]);

	const selectedCount = useMemo(() => selectedDriverIds.length, [selectedDriverIds]);

	const toggleDriver = (driverId: string) => {
		if (!league?.isSuperUser) return;

		setSelectedDriverIds((current) => {
			const next = current.includes(driverId)
				? current.filter((id) => id !== driverId)
				: [...current, driverId];

			localStorage.setItem(`selectedDrivers:${league.id}`, JSON.stringify(next));
			return next;
		});
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-black dark:text-zinc-50">
				<div className="rounded-lg border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
					Sto caricando i piloti...
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
					<div className="mx-auto w-full max-w-5xl">
						<div className="mb-6 flex items-center gap-3">
							<SidebarTrigger />
							<p className="text-sm text-zinc-500 dark:text-zinc-400">Gestione piloti</p>
						</div>

						{error && (
							<div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
								{error}
							</div>
						)}

						<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
							<div className="mb-4 flex flex-wrap items-end justify-between gap-3">
								<div>
									<h1 className="text-2xl font-semibold">Piloti disponibili</h1>
									<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
										{league.isSuperUser
											? 'Seleziona i piloti da assegnare alla tua squadra.'
											: 'Solo il super utente puo modificare le selezioni dei piloti.'}
									</p>
								</div>
								<p className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300">
									Selezionati: {selectedCount}
								</p>
							</div>

							<Table>
								<TableCaption>Elenco piloti Formula 1</TableCaption>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[60px]">#</TableHead>
										<TableHead>Pilota</TableHead>
										<TableHead>Team</TableHead>
										<TableHead className="text-right">Seleziona</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{drivers.map((driver) => {
										const isChecked = selectedDriverIds.includes(driver.id);
										return (
											<TableRow key={driver.id} data-state={isChecked ? 'selected' : undefined}>
												<TableCell className="font-medium">{driver.number}</TableCell>
												<TableCell>{driver.name}</TableCell>
												<TableCell>{driver.team}</TableCell>
												<TableCell className="text-right">
													<input
														type="checkbox"
														checked={isChecked}
														disabled={!league.isSuperUser}
														onChange={() => toggleDriver(driver.id)}
														className="h-4 w-4 accent-red-600 disabled:cursor-not-allowed"
													/>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
