import Image from 'next/image';

export default function AppLogo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <Image
        src="https://i.postimg.cc/htqrt1Dn/Screenshot-2025-11-06-192038-removebg-preview-(1).png"
        alt="TransitPro Logo"
        width={180}
        height={40}
        priority
      />
    </div>
  );
}
