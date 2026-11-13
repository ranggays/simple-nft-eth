'use client';
import { useState } from 'react';
import { useWriteContract, useReadContract } from 'wagmi';
import { Scanner } from '@yudiel/react-qr-scanner';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config';
import Link from 'next/link';

const TICKET_INFO = {
  1: { event: 'Coldplay', location: 'Jakarta', type: 'VIP' },
  2: { event: 'Coldplay', location: 'Jakarta', type: 'Festival' },
  3: { event: 'Coldplay', location: 'Jakarta', type: 'Regular' },
  4: { event: 'Taylor Swift', location: 'Jakarta', type: 'VIP' },
  5: { event: 'Taylor Swift', location: 'Jakarta', type: 'Festival' },
  6: { event: 'Taylor Swift', location: 'Jakarta', type: 'Regular' },
  7: { event: 'Chase Atlantic', location: 'Jakarta', type: 'VIP' },
  8: { event: 'Chase Atlantic', location: 'Jakarta', type: 'Festival' },
  9: { event: 'Chase Atlantic', location: 'Jakarta', type: 'Regular' },
};

export default function ValidatorPage() {
  const [scanResult, setScanResult] = useState<{user: string, id: number} | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: scanResult ? [scanResult.user as `0x${string}`, BigInt(scanResult.id)] : undefined,
    query: { enabled: !!scanResult }
  });

  const { data: usedCount } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'entriesUsed',
    args: scanResult ? [scanResult.user as `0x${string}`, BigInt(scanResult.id)] : undefined,
    query: { enabled: !!scanResult }
  });

  const { writeContract, isSuccess, isPending, error, reset } = useWriteContract();

  const handleCheckIn = () => {
    if(!scanResult) return;
    writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'checkIn',
        args: [scanResult.user as `0x${string}`, BigInt(scanResult.id)]
    });
  };

  const handleScan = (result: any) => {
    if (result) {
        try {
            const rawData = result[0].rawValue;
            const parsedData = JSON.parse(rawData);
            
            if (parsedData.user && parsedData.id) {
                setScanResult({ user: parsedData.user, id: Number(parsedData.id) });
                setIsScanning(false);
                reset();
            }
        } catch (err) {
            console.error("Invalid QR format");
        }
    }
  };

  const userHasTicket = Number(balance) > 0;
  const alreadyUsed = Number(usedCount) >= Number(balance);
  const canEnter = userHasTicket && !alreadyUsed;

  const handleReset = () => {
    setScanResult(null);
    setIsScanning(true);
    reset();
  };

  const ticketInfo = scanResult ? TICKET_INFO[scanResult.id as keyof typeof TICKET_INFO] : null;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-white">VALIDATOR</Link>
            <span className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400">Admin</span>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Exit
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-2xl">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Entry Validation</h1>
          <p className="text-gray-400">Scan attendee QR code for check-in</p>
        </div>

        {/* Scanner */}
        <div className="border border-white/10 rounded-lg overflow-hidden mb-6">
          <div className="aspect-video bg-black relative">
            {isScanning ? (
              <Scanner 
                onScan={handleScan}
                // components={{ audio: false }}
                styles={{
                  container: { width: '100%', height: '100%' }
                }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/5">
                <svg className="w-16 h-16 text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-white text-lg font-semibold mb-4">Scan Complete</p>
                <button 
                  onClick={handleReset}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Scan Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        {scanResult && (
          <div className="space-y-6">
            {/* Ticket Info */}
            {ticketInfo && (
              <div className="border border-white/10 rounded-lg p-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Scanned Ticket</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{ticketInfo.event}</h3>
                    <p className="text-sm text-gray-400">{ticketInfo.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{ticketInfo.type}</p>
                    <p className="text-xs text-gray-600 font-mono">#{scanResult.id}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                  <p className="text-xs font-mono text-white/60 break-all">{scanResult.user}</p>
                </div>
              </div>
            )}

            {/* Validation Status */}
            <div className="border border-white/10 rounded-lg p-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Validation</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 mb-2">Ownership</p>
                  <p className="text-lg font-bold text-white">
                    {userHasTicket ? 'Valid' : 'Invalid'}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 mb-2">Usage</p>
                  <p className="text-lg font-bold text-white">
                    {Number(usedCount)}/{Number(balance)}
                  </p>
                </div>
              </div>

              {/* Decision */}
              <div className={`p-6 rounded-lg text-center mb-4 ${
                canEnter ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-white/10'
              }`}>
                <p className="text-3xl font-bold text-white mb-2">
                  {canEnter ? '✓ Approved' : '✗ Denied'}
                </p>
                <p className="text-sm text-gray-400">
                  {canEnter ? 'Attendee may enter' : 
                   !userHasTicket ? 'No valid ticket found' :
                   'Entry quota exhausted'}
                </p>
              </div>

              {/* Check-in Button */}
              <button
                onClick={handleCheckIn}
                disabled={!canEnter || isPending || isSuccess}
                className={`w-full py-4 rounded-lg font-semibold transition-colors ${
                  canEnter && !isPending && !isSuccess
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isPending ? 'Processing...' : 
                 isSuccess ? 'Check-in Complete ✓' : 
                 'Confirm Check-in'}
              </button>

              {error && (
                <p className="mt-4 text-sm text-gray-400 text-center">{error.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!scanResult && (
          <div className="text-center text-gray-500 text-sm">
            <p>Position QR code within frame to scan</p>
          </div>
        )}
      </div>
    </div>
  );
}