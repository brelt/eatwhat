import Link from 'next/link';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color?: string;
}

export default function FeatureCard({
  title,
  description,
  icon,
  href,
  color = 'bg-primary',
}: FeatureCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-center h-full">
        <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <div className="text-white text-3xl">{icon}</div>
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-text">{description}</p>
      </div>
    </Link>
  );
}
