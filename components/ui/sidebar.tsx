'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type SidebarContextValue = {
	isDesktop: boolean;
	isCollapsed: boolean;
	isMobileOpen: boolean;
	setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
	setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
	toggle: () => void;
	closeMobile: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
	const context = React.useContext(SidebarContext);
	if (!context) {
		throw new Error('useSidebar must be used inside SidebarProvider');
	}
	return context;
}

function SidebarProvider({
	defaultOpen = true,
	children,
}: {
	defaultOpen?: boolean;
	children: React.ReactNode;
}) {
	const [isDesktop, setIsDesktop] = React.useState(false);
	const [isCollapsed, setIsCollapsed] = React.useState(!defaultOpen);
	const [isMobileOpen, setIsMobileOpen] = React.useState(false);

	React.useEffect(() => {
		const mediaQuery = window.matchMedia('(min-width: 768px)');
		const update = () => setIsDesktop(mediaQuery.matches);
		update();
		mediaQuery.addEventListener('change', update);
		return () => mediaQuery.removeEventListener('change', update);
	}, []);

	const toggle = React.useCallback(() => {
		if (isDesktop) {
			setIsCollapsed((current) => !current);
			return;
		}
		setIsMobileOpen((current) => !current);
	}, [isDesktop]);

	const closeMobile = React.useCallback(() => setIsMobileOpen(false), []);

	return (
		<SidebarContext.Provider
			value={{
				isDesktop,
				isCollapsed,
				isMobileOpen,
				setIsCollapsed,
				setIsMobileOpen,
				toggle,
				closeMobile,
			}}
		>
			<div className="flex min-h-screen w-full">{children}</div>
		</SidebarContext.Provider>
	);
}

function Sidebar({
	className,
	children,
}: React.ComponentProps<'aside'>) {
	const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();
	return (
		<>
			{isMobileOpen && (
				<button
					type="button"
					onClick={closeMobile}
					className="fixed inset-0 z-40 bg-black/45 md:hidden"
					aria-label="Chiudi sidebar"
				/>
			)}

			<aside
				className={cn(
					'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200',
					isMobileOpen ? 'translate-x-0' : '-translate-x-full',
					'md:static md:translate-x-0',
					isCollapsed ? 'md:w-20' : 'md:w-72',
					className
				)}
			>
				{children}
			</aside>
		</>
	);
}

function SidebarInset({
	className,
	children,
}: React.ComponentProps<'main'>) {
	return <main className={cn('min-w-0 flex-1 bg-background', className)}>{children}</main>;
}

function SidebarTrigger({
	className,
	...props
}: React.ComponentProps<'button'>) {
	const { toggle } = useSidebar();
	return (
		<button
			type="button"
			onClick={toggle}
			className={cn(
				'inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-accent',
				className
			)}
			{...props}
		>
			<span className="sr-only">Apri/chiudi sidebar</span>
			<svg
				viewBox="0 0 24 24"
				className="h-4 w-4"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<line x1="3" y1="12" x2="21" y2="12" />
				<line x1="3" y1="6" x2="21" y2="6" />
				<line x1="3" y1="18" x2="21" y2="18" />
			</svg>
		</button>
	);
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return <div className={cn('border-b border-sidebar-border p-4', className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
	return <div className={cn('flex-1 overflow-y-auto p-3', className)} {...props} />;
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return <div className={cn('border-t border-sidebar-border p-3', className)} {...props} />;
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
	return <div className={cn('mb-4', className)} {...props} />;
}

function SidebarGroupLabel({ className, ...props }: React.ComponentProps<'p'>) {
	return (
		<p
			className={cn('px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground', className)}
			{...props}
		/>
	);
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
	return <ul className={cn('space-y-1', className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
	return <li className={cn(className)} {...props} />;
}

function SidebarMenuButton({
	className,
	isActive,
	...props
}: React.ComponentProps<'button'> & { isActive?: boolean }) {
	const { isDesktop, isCollapsed } = useSidebar();
	return (
		<button
			type="button"
			className={cn(
				'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors',
				isDesktop && isCollapsed && 'justify-center',
				isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/70',
				className
			)}
			{...props}
		/>
	);
}

export {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
	useSidebar,
};
