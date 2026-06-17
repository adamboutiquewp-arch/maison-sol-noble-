import { useState, useEffect, useCallback } from "react";

// ─── CONFIG SUPABASE ───────────────────────────────────────────────────────────
// Remplace ces deux valeurs par tes vraies clés Supabase (voir SETUP.md)
const SUPABASE_URL = "https://gwcrschnztnyqvfsjpdd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3Y3JzY2huenRueXF2ZnNqcGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTg5NTMsImV4cCI6MjA5NzI3NDk1M30.WeA47JrClXl0J8MAhbFZ0_o4waIZUT-ioZKSwd5PdVE";


// ─── AUTH SUPABASE ─────────────────────────────────────────────────────────────
async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || "Erreur de connexion");
  return data;
}

async function signOut(token) {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
  });
}

async function getUser(token) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return await res.json();
}

// Helper Supabase REST
async function sb(path, opts = {}, token = null) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token || SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer || "return=representation",
    },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── DONNÉES PAR DÉFAUT ────────────────────────────────────────────────────────
const TARIFS = {
  marbre:    { label: "Marbre",         travaux: ["Polissage simple", "Rénovation complète", "Cristallisation", "Protection imperméabilisante"], prix: [30, 55, 45, 14] },
  travertin: { label: "Travertin",      travaux: ["Bouchage + ponçage", "Rénovation complète", "Protection hydrofuge"], prix: [35, 50, 12] },
  granito:   { label: "Granito",        travaux: ["Ponçage + cristallisation", "Rénovation complète", "Nettoyage professionnel"], prix: [40, 48, 14] },
  parquet:   { label: "Parquet massif", travaux: ["Ponçage + vitrification", "Ponçage + cirage", "Vitrification seule", "Ponçage seul"], prix: [28, 32, 16, 12] },
};
const ETAT_COEFF = { bon: 1, moyen: 1.2, mauvais: 1.5 };
const STATUTS = ["Nouveau", "Contacté", "Devis envoyé", "Gagné", "Perdu"];
const STATUT_COLOR = { "Nouveau": "#3B8BD4", "Contacté": "#EF9F27", "Devis envoyé": "#8B3A8B", "Gagné": "#3B6D11", "Perdu": "#A32D2D" };
const INFO_ENTREPRISE = { nom: "Maison Sol Noble", tel: "05 54 54 28 64", email: "contact@maisonsolnoble.com", siret: "000 000 000 00000", tva: "FR00000000000" };

// ─── GÉNÉRATEUR PDF ────────────────────────────────────────────────────────────
function genererPDF(devis, type = "devis") {
  const titre = type === "devis" ? "DEVIS" : "FACTURE";
  const montantHT = devis.montant_ht || 0;
  const tva = (montantHT * 0.2).toFixed(2);
  const ttc = (montantHT * 1.2).toFixed(2);
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;padding:40px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:20px;border-bottom:2px solid #c9a84c;}
  .logo-zone .logo-maison{font-size:10px;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;}
  .logo-zone .logo-sol{font-size:22px;font-weight:300;color:#1a1a1a;letter-spacing:1px;}
  .doc-type{font-size:28px;font-weight:700;color:#1a1a1a;letter-spacing:4px;}
  .doc-num{font-size:12px;color:#888;margin-top:4px;}
  .bloc-adresses{display:flex;justify-content:space-between;margin:30px 0;}
  .bloc-adresse h3{font-size:10px;letter-spacing:2px;color:#c9a84c;text-transform:uppercase;margin-bottom:8px;}
  .bloc-adresse p{font-size:13px;line-height:1.7;color:#333;}
  table{width:100%;border-collapse:collapse;margin:30px 0;}
  th{background:#1a1a1a;color:#fff;padding:10px 14px;text-align:left;font-size:11px;letter-spacing:1px;}
  td{padding:10px 14px;border-bottom:1px solid #eee;font-size:13px;}
  tr:last-child td{border-bottom:none;}
  .totaux{margin-left:auto;width:280px;margin-top:20px;}
  .totaux-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;}
  .totaux-row.ttc{border-top:2px solid #1a1a1a;font-size:15px;font-weight:700;margin-top:4px;padding-top:10px;}
  .gold{color:#c9a84c;font-weight:700;}
  .footer{margin-top:50px;padding-top:20px;border-top:1px solid #eee;font-size:11px;color:#999;text-align:center;}
  .badge{display:inline-block;background:#c9a84c;color:#111;padding:3px 10px;font-size:10px;font-weight:700;letter-spacing:2px;margin-bottom:4px;}
  .notes{background:#f9f7f3;border-left:3px solid #c9a84c;padding:12px 16px;margin:20px 0;font-size:12px;color:#555;}
</style></head><body>
<div class="header">
  <div class="logo-zone">
    <div class="logo-maison">Maison</div>
    <div class="logo-sol">Sol Noble</div>
    <div style="font-size:11px;color:#888;margin-top:6px;">Rénovation de sols en pierre naturelle & parquet massif</div>
  </div>
  <div style="text-align:right;">
    <div class="doc-type">${titre}</div>
    <div class="doc-num">N° ${devis.numero}</div>
    <div style="font-size:11px;color:#888;margin-top:4px;">Date : ${new Date(devis.created_at || Date.now()).toLocaleDateString("fr-FR")}</div>
    ${type === "devis" ? `<div style="font-size:11px;color:#888;">Valable 30 jours</div>` : `<div style="font-size:11px;color:#888;">Échéance : ${new Date(Date.now() + 30 * 86400000).toLocaleDateString("fr-FR")}</div>`}
  </div>
</div>

<div class="bloc-adresses">
  <div class="bloc-adresse">
    <h3>Émetteur</h3>
    <p><strong>${INFO_ENTREPRISE.nom}</strong><br>
    ${INFO_ENTREPRISE.tel}<br>
    ${INFO_ENTREPRISE.email}<br>
    SIRET : ${INFO_ENTREPRISE.siret}<br>
    TVA : ${INFO_ENTREPRISE.tva}</p>
  </div>
  <div class="bloc-adresse">
    <h3>Client</h3>
    <p><strong>${devis.client_nom}</strong><br>
    ${devis.client_tel || ""}<br>
    ${devis.client_email || ""}<br>
    ${devis.ville || ""}</p>
  </div>
</div>

<table>
  <thead><tr><th>Description</th><th>Type de sol</th><th>Surface</th><th>Prix/m²</th><th>Total HT</th></tr></thead>
  <tbody>
    <tr>
      <td>${devis.travaux}</td>
      <td>${TARIFS[devis.type_sol]?.label || devis.type_sol}</td>
      <td>${devis.surface} m²</td>
      <td>${devis.prix_m2} €</td>
      <td><strong>${montantHT.toFixed(2)} €</strong></td>
    </tr>
    ${devis.description ? `<tr><td colspan="5" style="color:#666;font-size:12px;font-style:italic;">${devis.description}</td></tr>` : ""}
  </tbody>
</table>

<div class="totaux">
  <div class="totaux-row"><span>Montant HT</span><span>${montantHT.toFixed(2)} €</span></div>
  <div class="totaux-row"><span>TVA 20%</span><span>${tva} €</span></div>
  <div class="totaux-row ttc"><span>TOTAL TTC</span><span class="gold">${ttc} €</span></div>
</div>

${type === "devis" ? `
<div class="notes">
  <strong>Conditions :</strong> Devis valable 30 jours. Déplacement inclus. Acompte de 30% à la commande.
  Règlement : virement bancaire ou chèque. Délai d'intervention : selon disponibilités et planning.
</div>` : `
<div class="notes">
  <strong>Modalités de règlement :</strong> Paiement à réception de facture par virement ou chèque.
  Pénalités de retard : 3x le taux légal. Pas d'escompte pour paiement anticipé.
</div>`}

<div class="footer">
  ${INFO_ENTREPRISE.nom} · SIRET ${INFO_ENTREPRISE.siret} · ${INFO_ENTREPRISE.email} · ${INFO_ENTREPRISE.tel}<br>
  Intervention partout en France · maisonsolnoble.com
</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); win.print(); }
}

// ─── COMPOSANT MODAL ───────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 8, width: "100%", maxWidth: 620, maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.2rem 1.5rem", borderBottom: "1px solid #1e1e1e" }}>
          <h2 style={{ fontFamily: "Cormorant Garamond,serif", fontSize: 22, color: "#f0ece4", fontWeight: 400 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: "1.5rem" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── COMPOSANT BADGE STATUT ───────────────────────────────────────────────────
function Badge({ statut }) {
  return (
    <span style={{ background: STATUT_COLOR[statut] + "22", color: STATUT_COLOR[statut], border: `1px solid ${STATUT_COLOR[statut]}44`, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
      {statut}
    </span>
  );
}

// ─── INPUT & SELECT STYLES ────────────────────────────────────────────────────
const inputStyle = { background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#e0d8cc", padding: "0.7rem 0.9rem", fontFamily: "Inter,sans-serif", fontSize: 14, borderRadius: 4, width: "100%", outline: "none" };
const labelStyle = { display: "block", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6a6050", marginBottom: 5, fontWeight: 400 };
const btnPrimary = { background: "#c9a84c", color: "#111", border: "none", padding: "0.7rem 1.4rem", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", cursor: "pointer", borderRadius: 4, textTransform: "uppercase" };
const btnSecondary = { background: "transparent", color: "#a09080", border: "1px solid #2a2a2a", padding: "0.6rem 1.2rem", fontSize: 12, cursor: "pointer", borderRadius: 4 };
const btnDanger = { background: "transparent", color: "#A32D2D", border: "1px solid #A32D2D44", padding: "0.5rem 1rem", fontSize: 12, cursor: "pointer", borderRadius: 4 };

// ─── FORMULAIRE NOUVEAU DEVIS ─────────────────────────────────────────────────
function FormulaireDevis({ onSave, onClose, clientPrefill }) {
  const [form, setForm] = useState({
    client_nom: clientPrefill?.nom || "",
    client_tel: clientPrefill?.tel || "",
    client_email: clientPrefill?.email || "",
    ville: clientPrefill?.ville || "",
    type_sol: "marbre",
    travaux: TARIFS.marbre.travaux[0],
    surface: "",
    etat: "moyen",
    description: "",
    prix_m2: TARIFS.marbre.prix[0],
  });
  const [saving, setSaving] = useState(false);

  const montantHT = form.surface ? Math.round(form.prix_m2 * parseFloat(form.surface) * ETAT_COEFF[form.etat]) : 0;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === "type_sol") {
        next.travaux = TARIFS[value].travaux[0];
        next.prix_m2 = TARIFS[value].prix[0];
      }
      if (name === "travaux") {
        const idx = TARIFS[prev.type_sol].travaux.indexOf(value);
        next.prix_m2 = TARIFS[prev.type_sol].prix[idx] || prev.prix_m2;
      }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const numero = `MSN-${Date.now().toString().slice(-6)}`;
    const payload = { ...form, numero, montant_ht: montantHT, statut: "Devis envoyé", created_at: new Date().toISOString() };
    try {
      await sb("devis", { method: "POST", body: JSON.stringify(payload) });
      onSave(payload);
    } catch {
      onSave(payload); // mode démo sans Supabase
    }
    setSaving(false);
  }

  const tarif = TARIFS[form.type_sol];

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label style={labelStyle}>Nom client *</label>
          <input style={inputStyle} name="client_nom" value={form.client_nom} onChange={handleChange} required placeholder="Jean Dupont" />
        </div>
        <div>
          <label style={labelStyle}>Téléphone</label>
          <input style={inputStyle} name="client_tel" value={form.client_tel} onChange={handleChange} placeholder="06 12 34 56 78" />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} name="client_email" value={form.client_email} onChange={handleChange} placeholder="client@email.com" />
        </div>
        <div>
          <label style={labelStyle}>Ville</label>
          <input style={inputStyle} name="ville" value={form.ville} onChange={handleChange} placeholder="Paris" />
        </div>
      </div>

      <div style={{ height: 1, background: "#1e1e1e", margin: "1rem 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label style={labelStyle}>Type de sol *</label>
          <select style={inputStyle} name="type_sol" value={form.type_sol} onChange={handleChange}>
            {Object.entries(TARIFS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>État du sol</label>
          <select style={inputStyle} name="etat" value={form.etat} onChange={handleChange}>
            <option value="bon">Bon état</option>
            <option value="moyen">État moyen</option>
            <option value="mauvais">Mauvais état</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Travaux *</label>
          <select style={inputStyle} name="travaux" value={form.travaux} onChange={handleChange}>
            {tarif.travaux.map((t, i) => <option key={i} value={t}>{t} — {tarif.prix[i]} €/m²</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Surface (m²) *</label>
          <input style={inputStyle} name="surface" value={form.surface} onChange={handleChange} required placeholder="50" type="number" min="1" />
        </div>
        <div>
          <label style={labelStyle}>Prix au m² (€)</label>
          <input style={inputStyle} name="prix_m2" value={form.prix_m2} onChange={handleChange} type="number" min="1" />
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle}>Notes / description</label>
        <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} name="description" value={form.description} onChange={handleChange} placeholder="Précisions sur le chantier, accès, particularités..." />
      </div>

      {/* Récap prix */}
      {form.surface > 0 && (
        <div style={{ background: "#0a0a0a", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 6, padding: "1rem", marginBottom: "1.2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "#7a7060", fontSize: 13 }}>{form.surface} m² × {form.prix_m2} €/m² × coeff. état ({ETAT_COEFF[form.etat]})</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#a09080", fontSize: 13 }}>Montant HT</span>
            <span style={{ color: "#f0ece4", fontSize: 15, fontWeight: 600 }}>{montantHT.toFixed(2)} €</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ color: "#a09080", fontSize: 13 }}>TTC (TVA 20%)</span>
            <span style={{ color: "#c9a84c", fontSize: 17, fontWeight: 700 }}>{(montantHT * 1.2).toFixed(2)} €</span>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
        <button type="button" style={btnSecondary} onClick={onClose}>Annuler</button>
        <button type="submit" style={btnPrimary} disabled={saving}>{saving ? "Enregistrement..." : "Créer le devis"}</button>
      </div>
    </form>
  );
}

// ─── VUE DEVIS ────────────────────────────────────────────────────────────────
function VueDevis({ devis: initialDevis, onUpdate }) {
  const [devis, setDevis] = useState(initialDevis);
  const [modal, setModal] = useState(null); // "nouveau" | "detail"
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");

  const filtered = devis.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = d.client_nom?.toLowerCase().includes(q) || d.ville?.toLowerCase().includes(q) || d.numero?.includes(q);
    const matchStatut = filterStatut === "Tous" || d.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  function handleSave(d) {
    const updated = [d, ...devis];
    setDevis(updated);
    onUpdate(updated);
    setModal(null);
  }

  async function changerStatut(id, statut) {
    const updated = devis.map(d => d.id === id || d.numero === id ? { ...d, statut } : d);
    setDevis(updated);
    onUpdate(updated);
    try { await sb(`devis?numero=eq.${id}`, { method: "PATCH", body: JSON.stringify({ statut }) }); } catch {}
  }

  async function convertirFacture(d) {
    const facture = { ...d, type: "facture", statut: "Gagné", created_at: new Date().toISOString() };
    const updated = devis.map(x => x.numero === d.numero ? facture : x);
    setDevis(updated);
    onUpdate(updated);
    genererPDF(facture, "facture");
  }

  const ca = devis.filter(d => d.statut === "Gagné").reduce((s, d) => s + (d.montant_ht || 0), 0);
  const enAttente = devis.filter(d => d.statut === "Devis envoyé").length;

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total devis", val: devis.length },
          { label: "En attente", val: enAttente },
          { label: "Gagnés", val: devis.filter(d => d.statut === "Gagné").length },
          { label: "CA HT (gagnés)", val: ca.toFixed(0) + " €" },
        ].map((k, i) => (
          <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: "1rem 1.2rem" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5a5040", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontFamily: "Cormorant Garamond,serif", fontSize: 24, color: i === 3 ? "#c9a84c" : "#f0ece4", fontWeight: 400 }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Barre actions */}
      <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <button style={btnPrimary} onClick={() => setModal("nouveau")}>+ Nouveau devis</button>
        <input style={{ ...inputStyle, maxWidth: 220 }} placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...inputStyle, maxWidth: 160 }} value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
          <option value="Tous">Tous les statuts</option>
          {STATUTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table devis */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e1e" }}>
              {["N°", "Client", "Ville", "Sol", "Travaux", "Montant HT", "Statut", "Actions"].map(h => (
                <th key={h} style={{ padding: "0.8rem 1rem", textAlign: "left", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5a5040", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#4a4030", fontSize: 13 }}>Aucun devis · Clique sur "+ Nouveau devis" pour commencer</td></tr>
            )}
            {filtered.map((d, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #1a1a1a", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "#161616"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                <td style={{ padding: "0.8rem 1rem", fontSize: 12, color: "#c9a84c", fontWeight: 600 }}>{d.numero}</td>
                <td style={{ padding: "0.8rem 1rem", fontSize: 13, color: "#e0d8cc", fontWeight: 500 }}>{d.client_nom}</td>
                <td style={{ padding: "0.8rem 1rem", fontSize: 12, color: "#7a7060" }}>{d.ville}</td>
                <td style={{ padding: "0.8rem 1rem", fontSize: 12, color: "#7a7060" }}>{TARIFS[d.type_sol]?.label}</td>
                <td style={{ padding: "0.8rem 1rem", fontSize: 12, color: "#7a7060", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.travaux}</td>
                <td style={{ padding: "0.8rem 1rem", fontSize: 13, color: "#f0ece4", fontWeight: 600 }}>{(d.montant_ht || 0).toFixed(0)} €</td>
                <td style={{ padding: "0.8rem 1rem" }}><Badge statut={d.statut} /></td>
                <td style={{ padding: "0.8rem 1rem" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ ...btnSecondary, padding: "3px 8px", fontSize: 11 }} onClick={() => { setSelected(d); setModal("detail"); }}>Voir</button>
                    <button style={{ ...btnSecondary, padding: "3px 8px", fontSize: 11 }} onClick={() => genererPDF(d, "devis")}>PDF</button>
                    {d.statut !== "Gagné" && (
                      <button style={{ ...btnSecondary, padding: "3px 8px", fontSize: 11, color: "#3B6D11", borderColor: "#3B6D1144" }} onClick={() => convertirFacture(d)}>→ Facture</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modal === "nouveau" && (
        <Modal title="Nouveau devis" onClose={() => setModal(null)}>
          <FormulaireDevis onSave={handleSave} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === "detail" && selected && (
        <Modal title={`Devis ${selected.numero}`} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gap: "0.8rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
              {[["Client", selected.client_nom], ["Téléphone", selected.client_tel], ["Email", selected.client_email], ["Ville", selected.ville], ["Type de sol", TARIFS[selected.type_sol]?.label], ["Surface", selected.surface + " m²"], ["Travaux", selected.travaux], ["Prix/m²", selected.prix_m2 + " €"]].map(([k, v]) => (
                <div key={k} style={{ background: "#0d0d0d", borderRadius: 4, padding: "0.7rem 1rem" }}>
                  <div style={{ fontSize: 10, color: "#5a5040", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 14, color: "#e0d8cc" }}>{v || "—"}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#0a0a0a", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 6, padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#a09080" }}>Montant TTC</span>
              <span style={{ color: "#c9a84c", fontSize: 22, fontFamily: "Cormorant Garamond,serif" }}>{((selected.montant_ht || 0) * 1.2).toFixed(2)} €</span>
            </div>
            <div>
              <label style={labelStyle}>Changer le statut</label>
              <select style={inputStyle} value={selected.statut} onChange={e => { changerStatut(selected.numero, e.target.value); setSelected({ ...selected, statut: e.target.value }); }}>
                {STATUTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {selected.description && <div style={{ color: "#7a7060", fontSize: 13, fontStyle: "italic", padding: "0.8rem", background: "#0d0d0d", borderRadius: 4 }}>{selected.description}</div>}
            <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
              <button style={btnSecondary} onClick={() => setModal(null)}>Fermer</button>
              <button style={btnPrimary} onClick={() => genererPDF(selected, "devis")}>Imprimer devis PDF</button>
              <button style={{ ...btnPrimary, background: "#3B6D11", color: "#fff" }} onClick={() => convertirFacture(selected)}>Convertir en facture</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── VUE PLANNING ─────────────────────────────────────────────────────────────
function VuePlanning({ devis }) {
  const [vue, setVue] = useState("semaine");
  const today = new Date();
  const [semaine, setSemaine] = useState(0);

  const jours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const debut = new Date(today);
  debut.setDate(today.getDate() - today.getDay() + 1 + semaine * 7);

  const chantiers = devis.filter(d => d.statut === "Devis envoyé" || d.statut === "Gagné");

  return (
    <div>
      <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1.5rem", alignItems: "center" }}>
        <button style={btnSecondary} onClick={() => setSemaine(s => s - 1)}>← Précédente</button>
        <span style={{ color: "#e0d8cc", fontSize: 14, fontWeight: 500 }}>
          Semaine du {debut.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
        </span>
        <button style={btnSecondary} onClick={() => setSemaine(s => s + 1)}>Suivante →</button>
        <button style={{ ...btnSecondary, marginLeft: "auto" }} onClick={() => setSemaine(0)}>Aujourd'hui</button>
      </div>

      {/* Grille semaine */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 4, marginBottom: "2rem" }}>
        {jours.map((jour, i) => {
          const date = new Date(debut);
          date.setDate(debut.getDate() + i);
          const isToday = date.toDateString() === today.toDateString();
          return (
            <div key={i} style={{ background: isToday ? "rgba(201,168,76,0.08)" : "#111", border: `1px solid ${isToday ? "rgba(201,168,76,0.3)" : "#1e1e1e"}`, borderRadius: 8, padding: "0.8rem", minHeight: 120 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: isToday ? "#c9a84c" : "#5a5040", marginBottom: 4 }}>{jour}</div>
              <div style={{ fontSize: 16, color: isToday ? "#c9a84c" : "#7a7060", marginBottom: 8, fontFamily: "Cormorant Garamond,serif" }}>{date.getDate()}</div>
              {i === 1 && chantiers[0] && (
                <div style={{ background: "rgba(59,139,212,0.15)", border: "1px solid rgba(59,139,212,0.3)", borderRadius: 4, padding: "4px 6px", fontSize: 11, color: "#3B8BD4" }}>
                  {chantiers[0].client_nom}<br />
                  <span style={{ color: "#5a7a9a" }}>{TARIFS[chantiers[0].type_sol]?.label}</span>
                </div>
              )}
              {i === 3 && chantiers[1] && (
                <div style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 4, padding: "4px 6px", fontSize: 11, color: "#c9a84c" }}>
                  {chantiers[1].client_nom}<br />
                  <span style={{ color: "#8a7040" }}>{TARIFS[chantiers[1].type_sol]?.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Liste chantiers à planifier */}
      <h3 style={{ fontFamily: "Cormorant Garamond,serif", color: "#f0ece4", fontSize: 18, fontWeight: 400, marginBottom: "1rem" }}>Chantiers à planifier</h3>
      {chantiers.length === 0 && <p style={{ color: "#4a4030", fontSize: 13 }}>Aucun chantier — crée des devis pour les voir apparaître ici.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {chantiers.map((d, i) => (
          <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: "0.9rem 1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <span style={{ color: "#e0d8cc", fontWeight: 500, fontSize: 14 }}>{d.client_nom}</span>
              <span style={{ color: "#5a5040", fontSize: 12, marginLeft: 10 }}>{d.ville}</span>
            </div>
            <div style={{ fontSize: 12, color: "#7a7060" }}>{TARIFS[d.type_sol]?.label} · {d.surface} m²</div>
            <div style={{ fontSize: 13, color: "#c9a84c", fontWeight: 600 }}>{((d.montant_ht || 0) * 1.2).toFixed(0)} € TTC</div>
            <Badge statut={d.statut} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VUE CLIENTS ──────────────────────────────────────────────────────────────
function VueClients({ devis, onNouveauDevis }) {
  const clients = Object.values(
    devis.reduce((acc, d) => {
      if (!acc[d.client_nom]) acc[d.client_nom] = { nom: d.client_nom, tel: d.client_tel, email: d.client_email, ville: d.ville, devis: [], ca: 0 };
      acc[d.client_nom].devis.push(d);
      if (d.statut === "Gagné") acc[d.client_nom].ca += d.montant_ht || 0;
      return acc;
    }, {})
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {clients.length === 0 && <p style={{ color: "#4a4030", fontSize: 13, gridColumn: "1/-1" }}>Aucun client pour l'instant.</p>}
        {clients.map((c, i) => (
          <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: "1.2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.8rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#c9a84c", fontWeight: 600, flexShrink: 0 }}>
                {c.nom.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ color: "#e0d8cc", fontWeight: 500, fontSize: 14 }}>{c.nom}</div>
                <div style={{ color: "#5a5040", fontSize: 11 }}>{c.ville}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#6a6050", marginBottom: 4 }}>{c.tel || "—"}</div>
            <div style={{ fontSize: 12, color: "#6a6050", marginBottom: "0.8rem" }}>{c.email || "—"}</div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderTop: "1px solid #1a1a1a" }}>
              <span style={{ fontSize: 11, color: "#5a5040" }}>{c.devis.length} devis</span>
              <span style={{ fontSize: 13, color: "#c9a84c", fontWeight: 600 }}>{c.ca.toFixed(0)} € CA</span>
            </div>
            <button style={{ ...btnSecondary, width: "100%", marginTop: "0.5rem", fontSize: 11 }} onClick={() => onNouveauDevis(c)}>
              + Nouveau devis
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VUE PARAMÈTRES ───────────────────────────────────────────────────────────
function VueParametres() {
  const [info, setInfo] = useState(INFO_ENTREPRISE);
  const [saved, setSaved] = useState(false);

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  return (
    <div style={{ maxWidth: 600 }}>
      <h3 style={{ fontFamily: "Cormorant Garamond,serif", color: "#f0ece4", fontSize: 20, fontWeight: 400, marginBottom: "1.5rem" }}>Informations entreprise</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        {[["Nom entreprise", "nom"], ["Téléphone", "tel"], ["Email", "email"], ["SIRET", "siret"], ["N° TVA", "tva"]].map(([label, key]) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <input style={inputStyle} value={info[key]} onChange={e => setInfo(p => ({ ...p, [key]: e.target.value }))} />
          </div>
        ))}
      </div>

      <h3 style={{ fontFamily: "Cormorant Garamond,serif", color: "#f0ece4", fontSize: 20, fontWeight: 400, marginBottom: "1.2rem" }}>Tarifs par défaut</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        {Object.entries(TARIFS).map(([key, sol]) => (
          <div key={key} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: "1rem" }}>
            <div style={{ color: "#c9a84c", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.8rem" }}>{sol.label}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.5rem", alignItems: "center" }}>
              {sol.travaux.map((t, i) => (
                <React.Fragment key={i}>
                  <span style={{ fontSize: 13, color: "#8a8070" }}>{t}</span>
                  <span style={{ fontSize: 13, color: "#c9a84c", fontWeight: 600, minWidth: 60, textAlign: "right" }}>{sol.prix[i]} €/m²</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button style={btnPrimary} onClick={handleSave}>{saved ? "✓ Sauvegardé !" : "Sauvegarder"}</button>
    </div>
  );
}

// ─── APP PRINCIPALE ────────────────────────────────────────────────────────────
export default function CRM() {
  const [onglet, setOnglet] = useState("devis");
  const [devis, setDevis] = useState([]);
  const [clientPrefill, setClientPrefill] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("msn_token") || null);
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Vérifier token existant au démarrage
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("msn_token");
      if (token) {
        const u = await getUser(token);
        if (u) { setAuthToken(token); setUser(u); }
        else { localStorage.removeItem("msn_token"); setAuthToken(null); }
      }
      setAuthChecking(false);
    })();
  }, []);

  function handleLogin(token, u) {
    localStorage.setItem("msn_token", token);
    setAuthToken(token);
    setUser(u);
  }

  async function handleLogout() {
    await signOut(authToken);
    localStorage.removeItem("msn_token");
    setAuthToken(null);
    setUser(null);
  }

  // Afficher login si pas connecté
  if (authChecking) return <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", color: "#5a5040", fontFamily: "Inter,sans-serif" }}>Chargement...</div>;
  if (!authToken) return <LoginScreen onLogin={handleLogin} />;

  // Chargement initial
  useEffect(() => {
    (async () => {
      try {
        const data = await sb("devis?order=created_at.desc", {}, authToken);
        setDevis(data || []);
      } catch {
        // Mode démo — données factices
        setDevis([
          { numero: "MSN-001", client_nom: "Sophie L.", client_tel: "06 12 34 56 78", client_email: "sophie@email.com", ville: "Paris 16ème", type_sol: "marbre", travaux: "Rénovation complète", surface: 65, prix_m2: 55, montant_ht: 4290, etat: "mauvais", statut: "Gagné", created_at: "2025-04-15" },
          { numero: "MSN-002", client_nom: "Pierre M.", client_tel: "07 98 76 54 32", client_email: "pierre@email.com", ville: "Cannes", type_sol: "travertin", travaux: "Rénovation complète", surface: 120, prix_m2: 50, montant_ht: 7200, etat: "moyen", statut: "Devis envoyé", created_at: "2025-05-02" },
          { numero: "MSN-003", client_nom: "Marie R.", client_tel: "06 55 44 33 22", client_email: "marie@email.com", ville: "Lyon", type_sol: "parquet", travaux: "Ponçage + vitrification", surface: 80, prix_m2: 28, montant_ht: 2688, etat: "moyen", statut: "Contacté", created_at: "2025-05-18" },
          { numero: "MSN-004", client_nom: "A. Fontaine", client_tel: "06 11 22 33 44", client_email: "", ville: "Monaco", type_sol: "marbre", travaux: "Cristallisation", surface: 200, prix_m2: 45, montant_ht: 10800, etat: "bon", statut: "Devis envoyé", created_at: "2025-06-01" },
        ]);
      }
      setLoading(false);
    })();
  }, []);

  function handleNouveauDevisClient(c) {
    setClientPrefill({ nom: c.nom, tel: c.tel, email: c.email, ville: c.ville });
    setOnglet("devis");
  }

  const navItems = [
    { id: "devis", label: "Devis", icon: "📄" },
    { id: "planning", label: "Planning", icon: "📅" },
    { id: "clients", label: "Clients", icon: "👥" },
    { id: "parametres", label: "Paramètres", icon: "⚙️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#e0d8cc", fontFamily: "Inter,sans-serif", fontWeight: 300 }}>

      {/* SIDEBAR desktop */}
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 220, background: "#090909", borderRight: "1px solid #1a1a1a", display: "flex", flexDirection: "column", zIndex: 100 }}>
        <div style={{ padding: "1.5rem 1.5rem 1rem" }}>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: "#c9a84c", textTransform: "uppercase", marginBottom: 2 }}>Maison</div>
          <div style={{ fontFamily: "Cormorant Garamond,serif", fontSize: "1.3rem", color: "#f0ece4", fontWeight: 400 }}>Sol Noble</div>
          <div style={{ fontSize: 10, color: "#3a3020", marginTop: 4, letterSpacing: "0.1em" }}>CRM</div>
        </div>
        <nav style={{ flex: 1, padding: "0.5rem 0" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setOnglet(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 1.5rem", background: onglet === item.id ? "rgba(201,168,76,0.08)" : "transparent", border: "none", borderLeft: `2px solid ${onglet === item.id ? "#c9a84c" : "transparent"}`, color: onglet === item.id ? "#c9a84c" : "#6a6050", cursor: "pointer", fontSize: 13, fontFamily: "Inter,sans-serif", fontWeight: onglet === item.id ? 500 : 300, textAlign: "left", transition: "all 0.15s" }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 11, color: "#5a5040", marginBottom: 4 }}>{user?.email || "contact@maisonsolnoble.com"}</div>
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#5a5040", cursor: "pointer", fontSize: 11, padding: 0, display: "flex", alignItems: "center", gap: 5 }}>
            <span>⏻</span> Déconnexion
          </button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div style={{ marginLeft: 220, minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <h1 style={{ fontFamily: "Cormorant Garamond,serif", fontSize: 22, color: "#f0ece4", fontWeight: 400 }}>
            {navItems.find(n => n.id === onglet)?.label}
          </h1>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#4a4030" }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>
            <button style={{ ...btnPrimary, padding: "0.5rem 1rem", fontSize: 12 }} onClick={() => { setClientPrefill(null); setOnglet("devis"); }}>+ Devis rapide</button>
            <button style={{ ...btnSecondary, padding: "0.5rem 1rem", fontSize: 12 }} onClick={handleLogout} title="Se déconnecter">⏻</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "2rem" }}>
          {loading && <div style={{ textAlign: "center", color: "#5a5040", padding: "4rem" }}>Chargement...</div>}
          {!loading && onglet === "devis" && <VueDevis devis={devis} onUpdate={setDevis} clientPrefill={clientPrefill} />}
          {!loading && onglet === "planning" && <VuePlanning devis={devis} />}
          {!loading && onglet === "clients" && <VueClients devis={devis} onNouveauDevis={handleNouveauDevisClient} />}
          {!loading && onglet === "parametres" && <VueParametres />}
        </div>
      </div>

      {/* NAV MOBILE (bottom) */}
      <div style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, background: "#090909", borderTop: "1px solid #1a1a1a", zIndex: 200, padding: "0.5rem 0" }} className="mobile-nav">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setOnglet(item.id)} style={{ flex: 1, background: "none", border: "none", color: onglet === item.id ? "#c9a84c" : "#4a4030", cursor: "pointer", padding: "0.4rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 10 }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500&display=swap');
        @media (max-width: 768px) {
          div[style*="marginLeft: 220"] { margin-left: 0 !important; padding-bottom: 70px; }
          div[style*="width: 220"] { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
        input:focus, select:focus, textarea:focus { border-color: #c9a84c !important; }
        button:hover { opacity: 0.9; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0d0d0d; } ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
      `}</style>
    </div>
  );
}
