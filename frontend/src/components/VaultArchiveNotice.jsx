/**
 * VaultArchiveNotice — Inspiration Vault permanent archive notice.
 *
 * Museum-plate presentation shown directly beneath the Add to Cart section
 * on every Inspiration Vault product page. Reuse this single component so
 * every current and future Vault piece inherits the exact same treatment.
 *
 * Constraints (per PHILEON constitution / BLUEPRINT.md):
 *   • Cinzel uppercase heading "ARCHIVE PIECE"
 *   • Body copy in Cormorant Garamond (existing editorial serif)
 *   • Warm gold text at reduced opacity, thin gold border, subtle dark plate
 *   • No icons · No animation · No countdowns · No urgency styling
 *   • Applies ONLY to Inspiration Vault; never referenced by Fine Jewelry,
 *     Ladies First, Gentleman's Club, Collective, Bamburgh Circle, or
 *     Sacred Collection pages.
 */
export default function VaultArchiveNotice() {
  return (
    <>
      <style>{`
        .van-wrap {
          max-width:720px;
          margin:0 auto;
          padding:clamp(48px,5vw,72px) clamp(20px,4vw,60px);
        }
        .van-plate {
          border:1px solid rgba(200,162,74,.34);
          background:linear-gradient(180deg,rgba(10,10,10,.72) 0%,rgba(5,5,5,.82) 100%);
          padding:clamp(30px,3.4vw,44px) clamp(28px,3.4vw,48px);
          text-align:center;
        }
        .van-heading {
          font-family:'Cinzel', serif;
          font-weight:500;
          font-size:12px;
          letter-spacing:.48em;
          text-transform:uppercase;
          color:#c8a24a;
          opacity:.9;
          margin:0 0 22px;
        }
        .van-rule {
          width:36px;
          height:1px;
          background:rgba(200,162,74,.5);
          margin:0 auto 22px;
          border:0;
        }
        .van-body {
          font-family:'Cormorant Garamond', serif;
          font-size:clamp(16px,1.35vw,19px);
          line-height:1.75;
          color:#c8a24a;
          opacity:.78;
          margin:0;
        }
        .van-body .van-line { display:block; }
      `}</style>
      <section
        className="van-wrap"
        data-testid="vault-archive-notice"
        aria-label="Archive piece — Inspiration Vault terms"
      >
        <div className="van-plate">
          <p className="van-heading">Archive Piece</p>
          <hr className="van-rule" aria-hidden="true" />
          <p className="van-body">
            <span className="van-line">Sold exactly as presented.</span>
            <span className="van-line">No modifications. No custom sizing.</span>
            <span className="van-line">Once the Vault closes, this piece will not return.</span>
          </p>
        </div>
      </section>
    </>
  );
}
