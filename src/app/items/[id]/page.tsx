import { BackBtn } from '@/components/BackBtn';
import { DragDrop2ColForItem } from '@/components/DragDrop2Col';
import Link from 'next/link';
import { Item } from '@/types/item';
import Button from '@/components/ui/Button';
import { Gift, Coins, Sparkles, Edit, Trash2 } from 'lucide-react';
import { cookies } from 'next/headers';
import { getItem } from '@/lib/endpoints';
import { COOKIE_TOKEN } from '@/config';
import { deleteItemAction } from '@/actions/item-actions';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	let item: Item;
	const cookieStore = await cookies();
	try {
		item = await getItem(id, cookieStore.get(COOKIE_TOKEN)?.value || '');
	} catch (error) {
		console.error('Error fetching item:', error);
		return <div className="text-red-500">Chyba při načítání předmětu.</div>;
	}

	const handleDelete = async () => {
		"use server";
		await deleteItemAction(id);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-6">
			<div className="container mx-auto max-w-6xl">
				<BackBtn />

				<div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 mb-8">
					<div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl"></div>
					<div className="relative">
						<div className="flex items-start gap-6 mb-8">
							<div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 shadow-lg max-md:hidden">
								<Gift className="text-white text-3xl" />
							</div>
							<div className="flex-1">
								<div className="flex flex-col items-start mb-3">
									<h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
										{item.name}
										<Sparkles className="text-yellow-500 animate-pulse" />
									</h1>
									<div className="text-gray-400 text-lg leading-relaxed">
										ID: {item.id}
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
										<h3 className="font-semibold text-gray-700 mb-2">Popis</h3>
										<p className="text-gray-600 leading-relaxed">{item.description}</p>
									</div>
									<div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
										<h3 className="font-semibold text-gray-700 mb-2">Hodnota</h3>
										<div className="flex items-center gap-2 text-2xl font-bold text-yellow-600">
											<Coins className="text-yellow-500" />
											{item.price} bodů
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className='flex justify-start items-center gap-3'>
							<Button variant="primary" size="lg" className="group">
								<Link href={`/items/${item.id}/edit`} className="flex items-center gap-2">
									<Edit className="text-lg group-hover:rotate-12 transition-transform duration-300" />
									Upravit předmět
								</Link>
							</Button>
							<Button variant="danger" size="lg" className="group flex items-center gap-2" onClick={handleDelete}>
								<Trash2 className="text-lg group-hover:rotate-12 transition-transform duration-300" />
								Smazat předmět
							</Button>

						</div>
					</div>
				</div>

				<DragDrop2ColForItem item={item} acquiredTitle="Držitelé odměny" availableTitle="Nabídka uživatelů" />
			</div>
		</div>
	);
}
