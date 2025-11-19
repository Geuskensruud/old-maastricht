import OldMaastrichtInfo from '@/components/OldMaastrichtInfo';

export default function Page() {
  return (
    <main>
      {/* Sectie met twee kolommen direct onder de header */}
      <OldMaastrichtInfo />

      {/* Jouw bestaande content */}
      <section>
        <h1
          style={{
            fontSize: '2rem',
            marginBottom: '1rem',
            color: '#c28b00',
          }}
        >
          Welkom bij onze Kaashandel
        </h1>
        <p>
          Proef het verschil met onze selectie van ambachtelijke kazen uit binnen- en buitenland.
        </p>
      </section>
    </main>
  );
}
