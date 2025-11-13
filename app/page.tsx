'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');


	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		let emailErr: string = '';
		if (!email) {
			emailErr = 'Inserisci il tuo indirizzo email';
		} else {
			const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				emailErr = 'Inserisci un indirizzo email valido';
			}
		}

		let passwordErr: string = '';
		if (!password) {
			passwordErr = 'Inserisci la tua password';
		} else if (password.length < 6) {
			passwordErr = 'La password deve essere di almeno 6 caratteri';
		}

		setEmailError(emailErr);
		setPasswordError(passwordErr);

		if (!emailErr && !passwordErr) {
			// Qui puoi aggiungere la logica di autenticazione

		}
	};

	useEffect(() => {
		if (emailError) {
			const timer = setTimeout(() => {
				setEmailError('');
			}, 2500);
			return () => clearTimeout(timer);
		}
	}, [emailError]);

	useEffect(() => {
		if (passwordError) {
			const timer = setTimeout(() => {
				setPasswordError('');
			}, 2500);
			return () => clearTimeout(timer);
		}
	}, [passwordError]);
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<div className="text-center mb-8">
				<h1 className="text-5xl font-bold text-red-500 dark:text-red-400 mb-2">
					Fanta Formula uno
				</h1>
			</div>
			<main className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-semibold text-black dark:text-zinc-50 mb-2">
						Accedi
					</h2>
					<p className="text-zinc-600 dark:text-zinc-400">
						Inserisci le tue credenziali per accedere
					</p>
				</div>

				<form className="space-y-6" onSubmit={handleSubmit} noValidate>
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
							Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								if (emailError) setEmailError(''); // Pulisce l'errore quando l'utente inizia a digitare
							}}
							className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 ${emailError ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-600'
								}`}
							placeholder="mario.rossi@gmail.com"
						/>
						{emailError && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{emailError}</p>
						)}
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
							Password
						</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								id="password"
								name="password"
								value={password}
								onChange={(e) => {
									setPassword(e.target.value);
									if (passwordError) setPasswordError(''); // Pulisce l'errore quando l'utente inizia a digitare
								}}
								className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 ${passwordError ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-600'
									}`}
								placeholder="••••••••"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 focus:outline-none"
							>
								{showPassword ? (
									<EyeOff className="h-5 w-5" />
								) : (
									<Eye className="h-5 w-5" />
								)}
							</button>
						</div>
						{passwordError && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
						)}
					</div>

					<div className="flex items-center justify-between">
						<label className="flex items-center">
							<input
								type="checkbox"
								className="h-4 w-4 text-red-600 focus:ring-red-500 border-zinc-300 dark:border-zinc-600 rounded"
							/>
							<span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
								Ricordami
							</span>
						</label>
						<a href="#" className="text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300">
							Password dimenticata?
						</a>
					</div>

					<button
						type="submit"
						className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:cursor-pointer"
					>
						Accedi
					</button>
				</form>

				<div className="mt-8 text-center">
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Non hai un account?{" "}
						<a href="#" className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 font-medium">
							Registrati
						</a>
					</p>
				</div>
			</main>
		</div>
	);
}