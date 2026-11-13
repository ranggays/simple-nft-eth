'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWriteContract, useAccount, useReadContracts } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config';
import Link from 'next/link';
import { useState } from 'react';

export type Ticket = {
  id: number;
  name: string;
  price: string;
  features: string[];
  sold?: number;
  supply?: number;
};

export type EventType = {
  id: number;
  name: string;
  category: string;
  date: string;
  venue: string;
  image: string;
  sold: number;
  total: number;
  featured: boolean;
  tickets: Ticket[];
};

type EventCardProps = {
  event: EventType;
  onBuy: (eventId: number, price: string) => void;
  isPending: boolean;
  address?: string;
};

// marque style
function DualMarquee() {
  const artists = ['Coldplay', 'Taylor Swift', 'Chase Atlantic'];
  const repeated = Array(8).fill(artists).flat();

  return (
    <div className="w-full bg-black py-12 space-y-4 border-y border-white/10">
      <style>{`
        @keyframes marquee-right {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-left {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .marquee-right { animation: marquee-right 40s linear infinite; }
        .marquee-left { animation: marquee-left 40s linear infinite; }
      `}</style>
      
      {/* Top Row - Right */}
      <div className="overflow-hidden">
        <div className="marquee-right flex gap-8">
          {repeated.map((artist, idx) => (
            <span key={idx} className="text-5xl font-black text-white/10 tracking-tight whitespace-nowrap">
              {artist}
            </span>
            
          ))}
        </div>
      </div>

      {/* Bottom Row - Left */}
      <div className="overflow-hidden">
        <div className="marquee-left flex gap-8">
          {repeated.map((artist, idx) => (
            <span key={idx} className="text-5xl font-black text-white tracking-tight whitespace-nowrap">
              {artist}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Event Categories
const CATEGORIES = ['All', 'Concert', 'Festival', 'Show'];

const EVENTS: EventType[] = [
  {
    id: 1, 
    name: 'Coldplay',
    category: 'Concert',
    date: 'March 15, 2026',
    venue: 'Gelora Bung Karno Stadium',
    image: '/banners/CP.jpg',
    sold: 0, // Placeholder, will be replaced by blockchain data
    total: 0, // Placeholder
    featured: true,
    tickets: [
      { id: 1, name: 'VIP', price: '0.05', features: ['Front Row', 'Meet & Greet', 'Merchandise'] },
      { id: 2, name: 'Festival', price: '0.02', features: ['Standing Area', 'Merchandise'] },
      { id: 3, name: 'Common', price: '0.01', features: ['General Admission'] }
    ]
  },
  {
    id: 2, 
    name: 'Taylor Swift',
    category: 'Concert',
    date: 'April 22, 2026',
    venue: 'Jakarta International Stadium',
    image: '/banners/TS.jpg',
    sold: 0,
    total: 0,
    featured: true,
    tickets: [
      { id: 4, name: 'VIP', price: '0.05', features: ['Premium Seat', 'Exclusive Access'] },
      { id: 5, name: 'Festival', price: '0.02', features: ['Standing Zone'] },
      { id: 6, name: 'Common', price: '0.01', features: ['General Entry'] }
    ]
  },
  {
    id: 3, 
    name: 'Chase Atlantic',
    category: 'Show',
    date: 'May 10, 2026',
    venue: 'ICE BSD City',
    image: '/banners/CA.jpg',
    sold: 0,
    total: 0,
    featured: false,
    tickets: [
      { id: 7, name: 'VIP', price: '0.05', features: ['VIP Lounge', 'Priority Entry'] },
      { id: 8, name: 'Festival', price: '0.02', features: ['Standing Area'] },
      { id: 9, name: 'Common', price: '0.01', features: ['General Seat'] }
    ]
  }
];

// Event Card Component
function EventCard({ event, onBuy, isPending, address }: EventCardProps) {
  const [expandedTickets, setExpandedTickets] = useState<number | null>(null);
  
  // Safety check to avoid NaN if total is 0
  const percentageSold = event.total > 0 ? Math.round((event.sold / event.total) * 100) : 0;

  return (
    <div className="group border border-white/10 bg-linear-to-br from-white/2 to-transparent rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/5 py-4">
      {/* Event Header with Image */}
      <div className="relative h-68 w-full overflow-hidden">
        {/* Render Gambar menggunakan tag img */}
        <img 
            src={event.image} 
            alt={event.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay Gradasi Hitam supaya teks kebaca */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent"></div>

        {/* Badge Kategori & Trending di atas gambar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
             <div className="px-3 py-1.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-md">
                 <span className="text-xs font-semibold text-white uppercase tracking-wide">{event.category}</span>
             </div>
             {/* {event.featured && (
                <div className="px-3 py-1.5 rounded-full bg-purple-600/90 border border-white/20 backdrop-blur-md shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  <span className="text-xs font-bold text-white">🔥 Trending</span>
                </div>
             )} */}
        </div>

        {/* Judul Event dipindah ke atas gambar (bagian bawah) */}
        <div className="absolute bottom-4 left-4 right-4">
             <h3 className="text-2xl font-bold text-white drop-shadow-md mb-1">{event.name}</h3>
             <div className="flex items-center gap-2 text-sm text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>{event.venue}</span>
             </div>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="px-4 space-y-3 bg-white/1">
        <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{event.date}</span>
        </div>
        <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Availability</span>
              <span className="text-white font-semibold">{percentageSold}% Sold</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-linear-to-r from-white/60 to-white/40 transition-all duration-500"
                style={{ width: `${percentageSold}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              {event.total - event.sold} of {event.total} tickets left
            </div>
          </div>
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider px-1">Ticket Tiers
        </h4>
        {event.tickets.map((ticket) => (
          <div 
            key={ticket.id}
            className="group/ticket border border-white/10 rounded-lg overflow-hidden bg-linear-to-r from-white/2 to-transparent hover:from-white/5 transition-all duration-300"
          >
            <button
              onClick={() => setExpandedTickets(expandedTickets === ticket.id ? null : ticket.id)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/2 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-white">{ticket.name}</h4>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                    {ticket.price} ETH
                  </span>
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedTickets === ticket.id ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Expanded Content */}
            {expandedTickets === ticket.id && (
              <div className="px-4 pb-4 border-t border-white/5 space-y-4 bg-white/1">
                <div className="space-y-2 pt-4">
                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Included Benefits</h5>
                  {ticket.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-sm">
                      <svg className="w-4 h-4 text-green-400/80 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => onBuy(ticket.id, ticket.price)}
                  disabled={isPending || !address}
                  className="w-full mt-4 px-4 py-3 bg-white text-black font-semibold rounded-lg text-sm hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  {!address ? 'Connect Wallet' : isPending ? 'Processing...' : 'Purchase Ticket'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Stats Component
function TicketStats({ events }: any) {
  const totalAvailable = events.reduce((sum: number, e: any) => sum + (e.total - e.sold), 0);
  const totalEvents = events.length;

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-12">
      <div className="border border-white/10 rounded-lg p-6 bg-linear-to-br from-white/2 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">Active Events</p>
            <p className="text-3xl font-bold text-white">{totalEvents}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="border border-white/10 rounded-lg p-6 bg-linear-to-br from-white/2 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">Tickets Available</p>
            <p className="text-3xl font-bold text-white">{totalAvailable}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m-4 4v2m4 4v2M5 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="border border-white/10 rounded-lg p-6 bg-linear-to-br from-white/2 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">Platform Status</p>
            <p className="text-3xl font-bold text-white">Live</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { writeContract, isPending, isSuccess } = useWriteContract();
  const { address } = useAccount();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const ALL_TICKET_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  const { data: ticketData } = useReadContracts({
    contracts: ALL_TICKET_IDS.map((id) => ({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'tickets', // Struct: [price, maxSupply, sold, isActive]
      args: [BigInt(id)],
    })),
    query: {
      refetchInterval: 3000, // Update tiap 3 detik
    }
  });

  const dynamicEvents = EVENTS.map((event) => {
    let eventSold = 0;
    let eventTotal = 0;

    // Loop setiap tiket di event ini untuk cek data blockchainnya
    event.tickets.forEach((ticket) => {
      // Data blockchain berupa array, indexnya [id - 1]
      // ticket id 1 -> index 0, dst.
      const blockchainData = ticketData?.[ticket.id - 1]?.result as any;
      
      if (blockchainData) {
        // Struct: 0:price, 1:maxSupply, 2:sold, 3:isActive
        const supply = Number(blockchainData[1]);
        const sold = Number(blockchainData[2]);
        
        eventTotal += supply;
        eventSold += sold;
      } else {
        // Fallback jika loading (pakai data static/0)
        eventTotal += event.total; // atau 0
        eventSold += event.sold;   // atau 0
      }
    });

    return {
      ...event,
      sold: eventSold,
      total: eventTotal > 0 ? eventTotal : 100 // Default 100 agar UI bar tidak error saat loading
    };
  });

  const handleBuy = (ticketId: number, price: string) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'mintTicket',
      args: [BigInt(ticketId), BigInt(1)],
      value: parseEther(price)
    });
  };

  const filteredEvents = selectedCategory === 'All' 
    ? dynamicEvents 
    : dynamicEvents.filter(e => e.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black">
      {/* Subtle grid overlay */}
      {/* <div className="fixed inset-0 opacity-[0.015] pointer-events-none" 
           style={{backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 80px)'}}>
      </div> */}

      {/* Header/Nav */}
      {/* <header className="w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className='flex items-center justify-between'>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-white tracking-tight">
                LOCKETIN
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <a href="#events" className="text-gray-400 hover:text-white transition-colors duration-200">Events</a>
              <Link href="/my-tickets" className="text-gray-400 hover:text-white transition-colors duration-200">
                My Tickets
              </Link>
              <Link href="/validator" className="text-gray-400 hover:text-white transition-colors duration-200">
                Validator
              </Link>
            </nav>
            
            <ConnectButton />
          </div>
        </div>
      </header> */}
      <header className="w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 items-center gap-4">
            {/* Left - Logo */}
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-white tracking-tight">
                LOCKETING
              </div>
            </div>
            
            {/* Center - Navigation */}
            <nav className="hidden md:flex items-center justify-center gap-8 text-sm">
              <a href="#events" className="text-gray-400 hover:text-white transition-colors duration-200">
                Events
              </a>
              <Link href="/my-tickets" className="text-gray-400 hover:text-white transition-colors duration-200">
                My Tickets
              </Link>
              <Link href="/validator" className="text-gray-400 hover:text-white transition-colors duration-200">
                Validator
              </Link>
            </nav>
            
            {/* Right - Connect Button */}
            <div className="flex items-center justify-end">
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      <div className="relative pt-32 overflow-hidden">
        {/* Hero Section */}
        {/* <div 
            className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none"
            style={{
                backgroundImage: `
                    linear-gradient(to right, #808080 1px, transparent 1px),
                    linear-gradient(to bottom, #808080 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px',
                backgroundAttachment: 'fixed' 
            }}
        /> */}

        {/* <div className="absolute top-130 left-0 w-full h-48 z-10 bg-linear-to-b from-transparent via-white/80 to-white pointer-events-none"></div> */}
        {/* <div className="absolute top-10 left-0 w-full h-px bg-linear-to-r from-transparent via-white-500/50 to-transparent z-20"></div> */}
        <div className='relative z-20 container mx-auto px-6 max-w-7xl'>
          <div className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-linear-to-r from-white/10 to-white/5 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400 font-medium">Live on Sepolia Testnet</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 leading-tight">
              Web3 Ticketing <span className="bg-linear-to-r from-white via-gray-300 to-white/70 bg-clip-text text-transparent">Platform</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Secure, transparent, and decentralized ticket marketplace powered by blockchain technology. Own your tickets, control your experience.
            </p>
          </div>
          {/* Status Messages */}
          {isSuccess && (
            <div className="max-w-2xl mx-auto mb-12 border border-green-500/30 bg-green-500/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-green-300 text-center font-medium">
                Purchase successful! Check "My Tickets" to view your NFT ticket.
              </p>
            </div>
          )}
          {isPending && (
            <div className="max-w-2xl mx-auto mb-12 border border-yellow-500/30 bg-yellow-500/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-yellow-300 text-center font-medium">
                Processing transaction... Please confirm in your wallet.
              </p>
            </div>
          )}

          {/* Quick Stats - Using dynamicEvents now */}
          <TicketStats events={dynamicEvents} />

          {/* Infinite Marquee Section - Choose one style below */}
          {/* Style 1: Dark/Modern (matching your black theme aesthetic) */}
          {/* <div className="mt-24 mb-24">
            <InfiniteMarqueeDark />
          </div> */}

          {/* Style 2: White Style (pure white text - uncomment to use instead) */}
          {/* <div className="mt-25 mb-24">
            <InfiniteMarqueeWhite />
          </div> */}

          <div className='mt-25 mb-24'>
            <DualMarquee />
          </div>
          {/* <div className='mt-25 mb-24'>
            <GradientMarquee />
          </div> */}
          {/* <div className='mt-25 mb-24'>
            <OutlineMarquee />
          </div> */}
          {/* <div className='mt-25 mb-24'>
            <GlitchMarquee />
          </div> */}
          {/* <div className='mt-25 mb-24'>
            <PerspectiveMarquee />
          </div> */}
          {/* <div className='mt-25 mb-24'>
            <NeonMarquee />
          </div> */}
          {/* <div className='mt-25 mb-24'>
            <MinimalDotsMarquee />
          </div> */}
          {/* <div className='mt-25 mb-24'>
            <NewspaperMarquee />
          </div> */}
          {/* <div className='mt-25 mb-24'>
            <BlurredMarquee />
          </div> */}
        </div>

        <div id='events' className='relative z-10 bg-black pt-12 pb-24'>
          {/* Events Section */}
          <div className="container mx-auto px-6 max-w-7xl">
            {/* Section Header with Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">Upcoming Events</h2>
                <p className="text-gray-400 text-sm">Discover and reserve your tickets to exclusive events</p>
              </div>
              
              {/* Category Filter */}
              <div className="flex gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      selectedCategory === cat
                        ? 'bg-white text-black border-white'
                        : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Events Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  onBuy={handleBuy}
                  isPending={isPending}
                  address={address}
                />
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="container mt-24 mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-2">Why Choose LOCKETING</h2>
              <p className="text-gray-400">The most secure and transparent ticketing platform</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="group border border-white/10 bg-linear-to-br from-white/2 to-transparent p-8 rounded-xl hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
                <div className="w-14 h-14 rounded-lg border border-white/10 flex items-center justify-center mb-6 group-hover:border-white/20 transition-colors">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Secure & Transparent</h3>
                <p className="text-sm text-gray-400 leading-relaxed">All tickets are minted as NFTs on blockchain, ensuring authenticity and preventing fraud with immutable records.</p>
              </div>

              <div className="group border border-white/10 bg-linear-to-br from-white/2 to-transparent p-8 rounded-xl hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
                <div className="w-14 h-14 rounded-lg border border-white/10 flex items-center justify-center mb-6 group-hover:border-white/20 transition-colors">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Instant Delivery</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Receive your NFT ticket immediately after purchase confirmation on the blockchain, no waiting required.</p>
              </div>

              <div className="group border border-white/10 bg-linear-to-br from-white/2 to-transparent p-8 rounded-xl hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
                <div className="w-14 h-14 rounded-lg border border-white/10 flex items-center justify-center mb-6 group-hover:border-white/20 transition-colors">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Easy Check-in</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Simple QR code verification system for seamless event entry management and real-time attendance tracking.</p>
              </div>
            </div>
          </div>

        </div>
        {/* Footer */}
        <div className="bg-black relative mt-24 py-12 border-t border-white/10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-400 mb-4">
              <span>Powered by</span>
              <span className="text-white font-semibold">Ethereum Smart Contracts</span>
            </div>
            <p className="text-xs text-gray-500">© 2026 LOCKETING. Web3 Ticketing Platform on Sepolia Testnet</p>
          </div>
        </div>
      </div>
    </div>
  );
}