import Link from "next/link"
import Image from "next/image"

export default function PaymentCancelPage() {
  return (
 
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[#F5F5F5] w-full max-w-md p-7 md:p-10 rounded-3xl">
          <div className="text-left space-y-1">
          <Image src="/aulonaflows-logo-dark.svg" alt="aulona-flows-logo" width={40} height={40} className="aspect-auto object-contain" />
           <h3 className="text-2xl font-medium text-red-400 tracking-tighter">Payment Cancelled</h3>
           <p className="text-xs text-black/50" > Your payment was cancelled. No charges have been made to your account. </p>
          </div>
  
          <div className="w-full pt-5 flex flex-wrap gap-2">
            <button className="bg-[#E3C9A3] hover:bg-opacity-50 transition-all ease-linear duration-300 rounded-lg px-2 h-12 flex-1 font-medium text-sm whitespace-nowrap">
                <Link href="/book">Try Again</Link>
            </button>
            <button className="flex-1 rounded-lg px-2 h-12 bg-[#F7BA4C] hover:bg-opacity-50 transition-all ease-linear duration-300 font-medium text-sm whitespace-nowrap">
                <Link href="/">Home</Link>
            </button>
          </div>
      </div>
    </main>

    
 
  )
}
