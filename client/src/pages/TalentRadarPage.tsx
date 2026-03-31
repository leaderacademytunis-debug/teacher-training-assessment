import { TalentRadar } from '@/components/TalentRadar';
import UnifiedNavbar from '@/components/UnifiedNavbar';

export default function TalentRadarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <UnifiedNavbar />
      <div className="w-full">
        <TalentRadar />
      </div>
    </div>
  );
}
