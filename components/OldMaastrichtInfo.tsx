import Image from 'next/image';
import './OldMaastrichtInfo.css';

export default function OldMaastrichtInfo() {
  return (
    <section id="over" className="oldmaastricht-info">
      {/* Linkerkolom */}
      <div className="column left">
        <p className="overline">De meest rebelse kaas van Nederland</p>
        <h2>Old Maastricht</h2>
        <p>
          Old Maastricht heeft een volle, pittige smaak en is rijk aan eiwitten en mineralen.
          Old Maastricht is een veelzijdige kaas die zowel als snack, op brood of als ingrediënt
          in gerechten kan worden genoten. Ontdek deze lokale delicatesse tijdens een bezoek aan
          de prachtige stad Maastricht en geniet van de unieke smaak van Old Maastricht kaas!
        </p>
      </div>

      {/* Rechterkolom met 4 features */}
      <div className="column right features-grid">
        <div className="feature-item">
          <Image
            src="/icons/cheese.png"
            alt="Kaas icoon"
            width={40}
            height={40}
            className="feature-icon"
          />
          <div className="feature-text">
            <h3>Nagerijpt in Zuid-Limburg</h3>
            <p>
              Old Maastricht is een natuurgerijpte oude kaas. Gerijpt op ouderwetse grenen planken.
            </p>
          </div>
        </div>

        <div className="feature-item">
          <Image
            src="/icons/shop.png"
            alt="Winkel icoon"
            width={40}
            height={40}
            className="feature-icon"
          />
          <div className="feature-text">
            <h3>Verkrijgbaar bij</h3>
            <p>
              Old Maastricht is verkrijgbaar op de markt in Maastricht en Sittard.
            </p>
          </div>
        </div>

        <div className="feature-item">
          <Image
            src="/icons/cow.png"
            alt="Koe icoon"
            width={40}
            height={40}
            className="feature-icon"
          />
          <div className="feature-text">
            <h3>100% weidegangmelk</h3>
            <p>
              Onze koeien grazen minimaal 120 dagen per jaar en minimaal 6 uur per dag. Hierdoor
              krijgen we de specifieke smaak van Old Maastricht.
            </p>
          </div>
        </div>

        <div className="feature-item">
          <Image
            src="/icons/crafting.png"
            alt="Ambacht icoon"
            width={40}
            height={40}
            className="feature-icon"
          />
          <div className="feature-text">
            <h3>Volgens traditioneel proces</h3>
            <p>
              Volgens een eeuwenoud proces wordt Old Maastricht bereid en dat proef je.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
