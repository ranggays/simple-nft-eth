'use client';
import { useAccount, useReadContracts } from 'wagmi';
import { QRCodeSVG } from 'qrcode.react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config';
import Link from 'next/link';
import { useState } from 'react';

const TICKET_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const TICKET_INFO = {
  1: { event: 'Coldplay', location: 'Jakarta', type: 'VIP', date: 'Mar 15, 2026', venue: 'GBK Stadium', image: '/banners/CP.jpg' },
  2: { event: 'Coldplay', location: 'Jakarta', type: 'Festival', date: 'Mar 15, 2026', venue: 'GBK Stadium', image: '/banners/CP.jpg' },
  3: { event: 'Coldplay', location: 'Jakarta', type: 'Regular', date: 'Mar 15, 2026', venue: 'GBK Stadium', image: '/banners/CP.jpg' },
  4: { event: 'Taylor Swift', location: 'Jakarta', type: 'VIP', date: 'Apr 22, 2026', venue: 'JIS', image: '/banners/TS.jpg' },
  5: { event: 'Taylor Swift', location: 'Jakarta', type: 'Festival', date: 'Apr 22, 2026', venue: 'JIS', image: '/banners/TS.jpg' },
  6: { event: 'Taylor Swift', location: 'Jakarta', type: 'Regular', date: 'Apr 22, 2026', venue: 'JIS', image: '/banners/TS.jpg' },
  7: { event: 'Chase Atlantic', location: 'Jakarta', type: 'VIP', date: 'May 10, 2026', venue: 'ICE BSD', image: '/banners/CA.jpg' },
  8: { event: 'Chase Atlantic', location: 'Jakarta', type: 'Festival', date: 'May 10, 2026', venue: 'ICE BSD', image: '/banners/CA.jpg' },
  9: { event: 'Chase Atlantic', location: 'Jakarta', type: 'Regular', date: 'May 10, 2026', venue: 'ICE BSD', image: '/banners/CA.jpg' },
};

function QRModal({ isOpen, onClose, address, ticketId }: { isOpen: boolean; onClose: () => void; address: string; ticketId: number | null }) {
  if (!isOpen || ticketId === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      <div className="relative bg-black border border-white/10 rounded-2xl p-8 max-w-sm w-full animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-6">Entry Pass #{ticketId}</h3>
          <div className="bg-white p-6 rounded-xl mb-6 inline-block shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <QRCodeSVG value={JSON.stringify({ user: address, id: ticketId })} size={200} />
          </div>
          <p className="text-xs text-gray-500 font-mono break-all">{address}</p>
          <p className="mt-4 text-xs text-red-500 font-bold animate-pulse">DO NOT SHARE THIS QR</p>
        </div>
      </div>
    </div>
  );
}

export default function MyTickets() {
  const { address } = useAccount();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'used'>('all');

  const { data: balances, isLoading: loadingBalances } = useReadContracts({
    contracts: TICKET_IDS.map((id) => ({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'balanceOf',
      args: [address, BigInt(id)],
    })),
  });

  const { data: usedCounts, isLoading: loadingUsed } = useReadContracts({
    contracts: TICKET_IDS.map((id) => ({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'entriesUsed',
      args: [address, BigInt(id)],
    })),
  });

  if (!address) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h3 className="text-2xl font-bold text-white mb-3">Connect Wallet</h3>
          <p className="text-gray-400 mb-8">View your NFT tickets</p>
          <Link href="/" className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">Home</Link>
        </div>
      </div>
    );
  }

  if (loadingBalances || loadingUsed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  const individualTickets: any[] = [];
  balances?.forEach((b, index) => {
    const id = index + 1;
    const totalOwned = Number(b.result);
    const totalUsed = Number(usedCounts?.[index]?.result || 0);
    const info = TICKET_INFO[id as keyof typeof TICKET_INFO];

    if (totalOwned > 0) {
      for (let i = 0; i < totalOwned; i++) {
        const isUsed = i < totalUsed;
        individualTickets.push({
          id: id,
          uniqueRef: `${id}-${i}`,
          info: info,
          isUsed: isUsed,
          instanceNumber: i + 1 
        });
      }
    }
  });

  const filteredTickets = individualTickets.filter(ticket => {
    if (filter === 'available') return !ticket.isUsed;
    if (filter === 'used') return ticket.isUsed;
    return true; 
  });

  if (individualTickets.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <header className="border-b border-white/10">
            <div className="container mx-auto px-6 py-4">
            <Link href="/" className="text-xl font-bold text-white">LOCKETING</Link>
            </div>
        </header>
        <div className="flex items-center justify-center p-6 min-h-[80vh]">
            <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🎫</div>
            <h3 className="text-2xl font-bold text-white mb-3">No Tickets</h3>
            <p className="text-gray-400 mb-8">Purchase tickets to get started</p>
            <Link href="/" className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">Browse Events</Link>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <QRModal 
        isOpen={selectedTicketId !== null} 
        onClose={() => setSelectedTicketId(null)} 
        address={address} 
        ticketId={selectedTicketId}
      />

      <header className="border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">LOCKETING</Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← Back</Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">My Tickets</h1>
          <p className="text-gray-400">{individualTickets.length} ticket{individualTickets.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex gap-3 mb-8">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>All</button>
          <button onClick={() => setFilter('available')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'available' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>Available</button>
          <button onClick={() => setFilter('used')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'used' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>Used</button>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No tickets in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.uniqueRef}
                className={`group border border-white/10 rounded-lg p-4 transition-all ${
                  ticket.isUsed ? 'opacity-40 grayscale bg-white/5' : 'hover:border-white/20 bg-linear-to-r from-white/5 to-transparent hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-6">
                  
                  <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                    <img 
                        src={ticket.info.image} 
                        alt="Event" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{ticket.info.event}</h3>
                        <p className="text-sm text-gray-400">{ticket.info.location}</p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-2 py-1 rounded text-xs font-bold mb-1 ${
                            ticket.info.type === 'VIP' ? 'bg-yellow-500/20 text-yellow-400' : 
                            ticket.info.type === 'Festival' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                            {ticket.info.type}
                        </div>
                        <p className="text-xs text-gray-600 font-mono">#{ticket.id}-{ticket.instanceNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm mb-3">
                        <div className="flex items-center gap-2 text-gray-400">
                            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {ticket.info.date}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> 
                            {ticket.info.venue}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className={`text-sm font-mono tracking-tight ${ticket.isUsed ? 'text-red-400' : 'text-green-800'}`}>
                          {ticket.isUsed ? '● USED' : '● ACTIVE'}
                        </p>

                        {!ticket.isUsed && (
                        <button
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className="px-4 py-2 bg-white text-black rounded text-xs font-bold hover:bg-gray-200 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        >
                            SHOW QR
                        </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-gray-500 text-center">Click "Show QR" on available tickets to display your entry pass</p>
        </div>
      </div>
    </div>
  );
}