'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

export default function CreateLeaguePage() {
	const router = useRouter();
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [nameError, setNameError] = useState('');
	const [descriptionError, setDescriptionError] = useState('');
	const [serverError, setServerError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
		if (!token) {
			router.replace('/');
		}
	}, [router]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setServerError('');

		let nameErr = '';
		if (!name.trim()) {
			nameErr = 'Inserisci il nome della lega';
		}

		let descriptionErr = '';
		if (!description.trim()) {
			descriptionErr = 'Inserisci una descrizione';
		}

		setNameError(nameErr);
		setDescriptionError(descriptionErr);

		if (nameErr || descriptionErr) return;

		const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
		if (!token) {
			router.replace('/');
			return;
		}

		try {
			setIsLoading(true);
			const response = await fetch(`${API_BASE}/F1/League/createLeague`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					token,
					name: name.trim(),
					description: description.trim(),
				}),
			});

			const data = await response.json();

			if (!response.ok || data?.status === 'error') {
				setServerError(data?.message || 'Creazione non riuscita. Riprova.');
				return;
			}

			router.push('/dashboard');
		} catch (error) {
			console.error('Errore durante la creazione lega:', error);
			setServerError('Errore di rete. Riprova.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
			<main className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-900">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-semibold text-black dark:text-zinc-50">Crea una lega</h1>
					<p className="mt-2 text-zinc-600 dark:text-zinc-400">
						Dai un nome e una descrizione alla tua nuova competizione.
					</p>
				</div>

				{serverError && (
					<div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
						{serverError}
					</div>
				)}

				<form className="space-y-6" onSubmit={handleSubmit} noValidate>
					<div>
						<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="name">
							Nome lega
						</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(event) => {
								setName(event.target.value);
								if (nameError) setNameError('');
								if (serverError) setServerError('');
							}}
							className={`w-full rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-400 dark:bg-zinc-800 dark:text-zinc-50 ${
								nameError ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-600'
							}`}
							placeholder="Inserisci un nome"
						/>
						{nameError && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{nameError}</p>
						)}
					</div>

					<div>
						<label
							className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
							htmlFor="description"
						>
							Descrizione
						</label>
						<textarea
							id="description"
							value={description}
							onChange={(event) => {
								setDescription(event.target.value);
								if (descriptionError) setDescriptionError('');
								if (serverError) setServerError('');
							}}
							rows={4}
							className={`w-full rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-400 dark:bg-zinc-800 dark:text-zinc-50 ${
								descriptionError ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-600'
							}`}
							placeholder="Scrivi una breve descrizione"
						/>
						{descriptionError && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{descriptionError}</p>
						)}
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isLoading ? 'Creazione in corso...' : 'Crea lega'}
					</button>
				</form>
			</main>
		</div>
	);
}
