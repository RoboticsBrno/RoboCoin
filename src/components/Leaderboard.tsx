import { UserInfo } from '@/types/user';
import { Trophy, Medal, Crown, Star, Coins, Users, Sparkles, Award } from 'lucide-react';


// Get rank styling
function getRankStyling(rank) {
	switch (rank) {
		case 1:
			return {
				gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
				bg: 'from-yellow-50 to-orange-50',
				border: 'border-yellow-300',
				icon: Crown,
				iconColor: 'text-yellow-600',
				shadow: 'shadow-yellow-500/25'
			};
		case 2:
			return {
				gradient: 'from-gray-300 via-gray-400 to-gray-500',
				bg: 'from-gray-50 to-slate-50',
				border: 'border-gray-300',
				icon: Medal,
				iconColor: 'text-gray-600',
				shadow: 'shadow-gray-500/25'
			};
		case 3:
			return {
				gradient: 'from-amber-600 via-amber-700 to-amber-800',
				bg: 'from-amber-50 to-orange-50',
				border: 'border-amber-300',
				icon: Award,
				iconColor: 'text-amber-700',
				shadow: 'shadow-amber-500/25'
			};
		default:
			return {
				gradient: 'from-purple-500 to-blue-600',
				bg: 'from-purple-50 to-blue-50',
				border: 'border-purple-200',
				icon: Star,
				iconColor: 'text-purple-600',
				shadow: 'shadow-purple-500/25'
			};
	}
}

type UserLeaderboard = {
	name: string;
	cnt_items: number;
	score: number;
};

// Podium Component for Top 3
export function Podium({ users }: { users: UserLeaderboard[] }) {
	let [first, second, third] = users;
	if( !first ) {
		first = { name: 'N/A', cnt_items: 0, score: 0 };
	}
	if (!second) {
		second = { name: 'N/A', cnt_items: 0, score: 0 };
	}
	if (!third) {
		third = { name: 'N/A', cnt_items: 0, score: 0 };
	}

	return (
		<div className="flex items-end justify-center gap-8 mb-12">
			{/* Second Place */}
			<div className="text-center transform hover:scale-105 transition-all duration-300">
				<div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 mb-4">
					<div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-xl">
						{second.name.charAt(0)}
					</div>
					<Medal className="text-gray-500 text-3xl mx-auto mb-2 animate-bounce" style={{ animationDelay: '0.5s' }} />
					<h3 className="font-bold text-lg text-gray-800">{second.name}</h3>
					<div className="flex items-center justify-center gap-1 text-gray-600 mt-2">
						<Coins className="text-sm" />
						<span className="font-semibold">{second.score}</span>
					</div>
				</div>
				<div className="w-full h-24 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-2xl shadow-xl"></div>
				<div className="text-white font-bold text-xl bg-gray-400 py-2 rounded-b-xl">2.</div>
			</div>

			{/* First Place */}
			<div className="text-center transform hover:scale-105 transition-all duration-300">
				<div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 mb-4 relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"></div>
					<div className="relative">
						<div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-xl animate-pulse">
							{first.name.charAt(0)}
						</div>
						<Crown className="text-yellow-500 text-4xl mx-auto mb-2 animate-bounce" />
						<h3 className="font-bold text-xl text-gray-800">{first.name}</h3>
						<div className="flex items-center justify-center gap-2 text-yellow-600 mt-2">
							<Coins className="text-lg" />
							<span className="font-bold text-xl">{first.score}</span>
						</div>
						<Sparkles className="absolute top-2 right-2 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
					</div>
				</div>
				<div className="w-full h-32 bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-2xl shadow-xl"></div>
				<div className="text-white font-bold text-2xl bg-yellow-500 py-2 rounded-b-xl">1.</div>
			</div>

			{/* Third Place */}
			<div className="text-center transform hover:scale-105 transition-all duration-300">
				<div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 mb-4">
					<div className="w-20 h-20 bg-gradient-to-r from-amber-600 to-amber-800 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-xl">
						{third.name.charAt(0)}
					</div>
					<Award className="text-amber-700 text-3xl mx-auto mb-2 animate-bounce" style={{ animationDelay: '1s' }} />
					<h3 className="font-bold text-lg text-gray-800">{third.name}</h3>
					<div className="flex items-center justify-center gap-1 text-amber-700 mt-2">
						<Coins className="text-sm" />
						<span className="font-semibold">{third.score}</span>
					</div>
				</div>
				<div className="w-full h-20 bg-gradient-to-t from-amber-600 to-amber-700 rounded-t-2xl shadow-xl"></div>
				<div className="text-white font-bold text-xl bg-amber-700 py-2 rounded-b-xl">3.</div>
			</div>
		</div>
	);
}

// Leaderboard Row Component
export function LeaderboardRow({ user, rank }: { user: UserLeaderboard, rank: number }) {
	const styling = getRankStyling(rank);
	const IconComponent = styling.icon;

	return (
		<div className={`group bg-gradient-to-r ${styling.bg} rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border-2 ${styling.border} ${styling.shadow}`}>
			<div className="flex items-center gap-6">
				{/* Rank Number */}
				<div className={`w-12 h-12 bg-gradient-to-r ${styling.gradient} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300 max-sm:hidden`}>
					{rank}
				</div>

				{/* User Avatar */}
				<div className={`w-16 h-16 bg-gradient-to-r ${styling.gradient} rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg max-sm:hidden`}>
					{user.name.charAt(0)}
				</div>

				{/* User Info */}
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-2">
						<h3 className="text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
							{user.name}
						</h3>
						<IconComponent className={`${styling.iconColor} text-xl max-sm:hidden`} />
					</div>
					<div className="flex items-center gap-4 text-gray-600">
						<div className="flex items-center gap-1">
							<Trophy className="text-sm" />
							<span className="font-semibold">{user.cnt_items} ocenění</span>
						</div>
					</div>
				</div>

				{/* Points */}
				<div className="text-right">
					<div className={`flex items-center gap-2 ${styling.iconColor} text-3xl font-bold`}>
						<Coins className="text-2xl" />
						<span>{user.score}</span>
					</div>
					<p className="text-gray-500 text-sm mt-1">bodů celkem</p>
				</div>

				{/* Rank Icon */}
				<div className="ml-4 max-sm:hidden">
					<IconComponent className={`${styling.iconColor} text-4xl group-hover:animate-bounce`} />
				</div>
			</div>
		</div>
	);
}

// Stats Component
export function StatsOverview({ users, points, achievements }: { users: number, points: number, achievements: number }) {

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
			<div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 text-center">
				<div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
					<Users className="text-white text-2xl" />
				</div>
				<h3 className="text-3xl font-bold text-gray-800 mb-2">{users}</h3>
				<p className="text-gray-600 font-semibold">Aktivních hráčů</p>
			</div>

			<div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 text-center">
				<div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
					<Coins className="text-white text-2xl" />
				</div>
				<h3 className="text-3xl font-bold text-gray-800 mb-2">{points}</h3>
				<p className="text-gray-600 font-semibold">Celkem bodů</p>
			</div>

			<div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 text-center">
				<div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
					<Trophy className="text-white text-2xl" />
				</div>
				<h3 className="text-3xl font-bold text-gray-800 mb-2">{achievements}</h3>
				<p className="text-gray-600 font-semibold">Udělených ocenění</p>
			</div>
		</div>
	);
}

