import { Trophy, Crown, Sparkles, Zap } from 'lucide-react';
import { getInfo, getTop } from '@/lib/endpoints';
import { cookies } from 'next/headers';
import { LeaderboardRow, Podium, StatsOverview } from '@/components/Leaderboard';


// Main Top 10 Component
export default async function Top10Page() {

	const cookieStore = await cookies();
	let topUsers;
	try {
		topUsers = await getTop(cookieStore.get('COOKIE_TOKEN')?.value);
		console.log(topUsers)
	} catch (error: any) {
		console.error(error);
	}
	let info;
	try {
		info = await getInfo(cookieStore.get('COOKIE_TOKEN')?.value);
		console.log(info);
	} catch (error: any) {
		console.error(error);
	}

	if (!topUsers || !info) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-gray-600 text-xl">Načítání dat selhalo. Zkuste to prosím znovu později.</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-6">
			<div className="container mx-auto max-w-6xl">
				{/* Header */}
				<div className="text-center mb-12">
					<div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-full px-10 py-6 shadow-2xl mb-8">
						<Trophy className="text-yellow-500 text-4xl animate-bounce" />
						<h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent">
							TOP 10 Hrdinů
						</h1>
						<Crown className="text-yellow-500 text-4xl animate-pulse" />
					</div>
					<p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
						Nejlepší účastníci našeho tábora! 🌟 Podívejte se, kdo sbírá nejvíce bodů a ocenění!
					</p>
				</div>

				{/* Stats Overview */}
				<StatsOverview users={info?.users} points={info?.points} achievements={info?.achievements} />

				{/* Podium for Top 3 */}
				<div className="mb-16 max-sm:hidden">
					<h2 className="text-3xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center gap-2">
						<Zap className="text-yellow-500" />
						Stupně vítězů
						<Zap className="text-yellow-500" />
					</h2>
					<Podium users={topUsers.slice(0, 3)} />
				</div>

				{/* Full Leaderboard */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center gap-2">
						<Trophy className="text-purple-500" />
						Kompletní žebříček
					</h2>
					<div className="space-y-4">
						{topUsers.map((user, index) => (
							<LeaderboardRow key={user.name} user={user} rank={index + 1} />
						))}
					</div>
				</div>

				{/* Footer Message */}
				<div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
					<div className="flex items-center justify-center gap-2 mb-4">
						<Sparkles className="text-purple-500 animate-spin" style={{ animationDuration: '3s' }} />
						<h3 className="text-2xl font-bold text-gray-800">Skvělá práce všichni! 🎉</h3>
						<Sparkles className="text-pink-500 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
					</div>
					<p className="text-gray-600 text-lg">
						Každý z vás je vítěz! Pokračujte v tom, co děláte, a možná se příště objevíte na vrcholu! 💪
					</p>
				</div>
			</div>
		</div>
	);
}
