'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Register() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [fullNameError, setFullNameError] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [confirmPasswordError, setConfirmPasswordError] = useState('');
	const [registrationError, setRegistrationError] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validazione nome completo
		let fullNameErr: string = '';
		if (!fullName.trim()) {
			fullNameErr = 'Inserisci il tuo nome completo';
		} else if (fullName.trim().length < 2) {
			fullNameErr = 'Il nome deve essere di almeno 2 caratteri';
		}

		// Validazione email
		let emailErr: string = '';
		if (!email) {
			emailErr = 'Inserisci il tuo indirizzo email';
		} else {
			const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				emailErr = 'Inserisci un indirizzo email valido';
			}
		}

		// Validazione password
		let passwordErr: string = '';
		if (!password) {
			passwordErr = 'Inserisci la tua password';
		} else if (password.length < 6) {
			passwordErr = 'La password deve essere di almeno 6 caratteri';
		}

		// Validazione conferma password
		let confirmPasswordErr: string = '';
		if (!confirmPassword) {
			confirmPasswordErr = 'Conferma la tua password';
		} else if (confirmPassword !== password) {
			confirmPasswordErr = 'Le password non coincidono';
		}

		setFullNameError(fullNameErr);
		setEmailError(emailErr);
		setPasswordError(passwordErr);
		setConfirmPasswordError(confirmPasswordErr);

		if (!fullNameErr && !emailErr && !passwordErr && !confirmPasswordErr) {
			// Invia i dati al backend per la registrazione
			try {
				setIsLoading(true);
				setRegistrationError('');

				const userData = {
					fullName: fullName.trim(),
					email: email.trim(),
					password: password
				};

				// Nota: Adatta l'URL del backend secondo le tue esigenze
				// Nel codice originale era 'F1/Users/loginUser', per registrazione userò 'registerUser'
				axios.post(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001' + '/F1/Users/registerUser', {
					jsonData: JSON.stringify(userData)
				}).then(response => {
					setIsLoading(false);
					if (!response.data) {
						setRegistrationError('Errore durante la registrazione');
						return;
					}

					// Sucesso - salva token e reindirizza
					localStorage.setItem('token', response.data);
					router.push('/home');
				}).catch(error => {
					setIsLoading(false);
					setRegistrationError('Errore di connessione o email già esistente');
					console.error(error);
				});
			} catch (error) {
				setIsLoading(false);
				setRegistrationError('Errore imprevisto');
				console.error(error);
			}
		}
	};

	useEffect(() => {
		if (fullNameError) {
			const timer = setTimeout(() => {
				setFullNameError('');
			}, 2500);
			return () => clearTimeout(timer);
		}
	}, [fullNameError]);

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

	useEffect(() => {
		if (confirmPasswordError) {
			const timer = setTimeout(() => {
				setConfirmPasswordError('');
			}, 2500);
			return () => clearTimeout(timer);
		}
	}, [confirmPasswordError]);

	useEffect(() => {
		if (registrationError) {
			const timer = setTimeout(() => {
				setRegistrationError('');
			}, 2500);
			return () => clearTimeout(timer);
		}
	}, [registrationError]);

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
						Registrati
					</h2>
					<p className="text-zinc-600 dark:text-zinc-400">
						Crea il tuo account per iniziare
					</p>
				</div>

				{registrationError && (
					<div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
						<p className="text-sm text-red-600 dark:text-red-400">{registrationError}</p>
					</div>
				)}

				<form className="space-y-6" onSubmit={handleSubmit} noValidate>
					<div>
						<label htmlFor="fullName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
							Nome completo
						</label>
						<input
							type="text"
							id="fullName"
							name="fullName"
							value={fullName}
							onChange={(e) => {
								setFullName(e.target.value);
								if (fullNameError) setFullNameError('');
							}}
							className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 ${fullNameError ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-600'
								}`}
							placeholder="Mario Rossi"
						/>
						{fullNameError && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{fullNameError}</p>
						)}
					</div>

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
								if (emailError) setEmailError('');
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
									if (passwordError) setPasswordError('');
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

					<div>
						<label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
							Conferma password
						</label>
						<div className="relative">
							<input
								type={showConfirmPassword ? "text" : "password"}
								id="confirmPassword"
								name="confirmPassword"
								value={confirmPassword}
								onChange={(e) => {
									setConfirmPassword(e.target.value);
									if (confirmPasswordError) setConfirmPasswordError('');
								}}
								className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 ${confirmPasswordError ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-600'
									}`}
								placeholder="••••••••"
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 focus:outline-none"
							>
								{showConfirmPassword ? (
									<EyeOff className="h-5 w-5" />
								) : (
									<Eye className="h-5 w-5" />
								)}
							</button>
						</div>
						{confirmPasswordError && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{confirmPasswordError}</p>
						)}
					</div>

					<div className="flex items-center">
						<input
							type="checkbox"
							id="terms"
							name="terms"
							className="h-4 w-4 text-red-600 focus:ring-red-500 border-zinc-300 dark:border-zinc-600 rounded"
							required
						/>
						<label htmlFor="terms" className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
							Accetto i <a href="#" className="text-red-600 hover:text-red-500">termini e condizioni</a>
						</label>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:cursor-pointer flex items-center justify-center"
					>
						{isLoading ? (
							<>
								<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Registrazione in corso...
							</>
						) : (
							'Registrati'
						)}
					</button>
				</form>

				<div className="mt-8 text-center">
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Hai già un account?{" "}
						<Link href="/" className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 font-medium">
							Accedi
						</Link>
					</p>
				</div>
			</main>
		</div>
	);
}
