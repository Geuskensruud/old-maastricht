// app/page.tsx
import OldMaastrichtInfo from '@/components/OldMaastrichtInfo';
import WaarTeKoop from '@/components/WaarTeKoop';

export default function Page() {
  return (
    <>
      {/* OVER / Old Maastricht info */}
      <OldMaastrichtInfo />

      {/* WAAR TE KOOP */}
      <WaarTeKoop />
    </>
  );
}
