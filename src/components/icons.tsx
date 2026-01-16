import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/transcendlogo2.png"
      alt="Transcend Global Network Logo"
      width={358}
      height={98}
      priority
      className={className}
    />
  );
}
