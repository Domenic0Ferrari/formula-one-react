'use client';

import { Flag, Gauge, Settings, ShieldCheck, Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar';

type AppSidebarProps = {
	leagueName: string;
	isSuperUser: boolean;
};

export function AppSidebar({ leagueName, isSuperUser }: AppSidebarProps) {
	const { isDesktop, isCollapsed } = useSidebar();
	const router = useRouter();
	const pathname = usePathname();
	const showLabels = !isDesktop || !isCollapsed;

	return (
		<Sidebar>
			<SidebarHeader className={showLabels ? '' : 'px-2'}>
				{showLabels ? (
					<>
						<p className="text-xs uppercase tracking-wide text-muted-foreground">Lega attiva</p>
						<h2 className="mt-1 text-base font-semibold">{leagueName}</h2>
					</>
				) : (
					<p className="text-center text-xs font-semibold">F1</p>
				)}
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					{showLabels && <SidebarGroupLabel>Navigazione</SidebarGroupLabel>}
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								onClick={() => router.push('/league/detail')}
								isActive={pathname === '/league/detail'}
							>
								<Gauge className="h-4 w-4" />
								{showLabels && <span>La mia squadra</span>}
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								onClick={() => router.push('/league/drivers')}
								isActive={pathname === '/league/drivers'}
							>
								<Users className="h-4 w-4" />
								{showLabels && <span>Piloti</span>}
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton>
								<Flag className="h-4 w-4" />
								{showLabels && <span>Classifica</span>}
							</SidebarMenuButton>
						</SidebarMenuItem>
						{isSuperUser && (
							<SidebarMenuItem>
								<SidebarMenuButton>
									<ShieldCheck className="h-4 w-4" />
									{showLabels && <span>Amministrazione</span>}
								</SidebarMenuButton>
							</SidebarMenuItem>
						)}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton>
							<Settings className="h-4 w-4" />
							{showLabels && <span>Impostazioni</span>}
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
