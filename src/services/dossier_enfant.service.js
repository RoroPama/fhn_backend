class DossierEnfantService {
  /**
   * Calcule une note pour chaque dossier basée sur le niveau de désavantage de l'enfant
   * Plus la note est élevée, plus l'enfant a besoin d'aide
   * @param {Object} dossier - Le dossier formatté d'un enfant
   * @returns {number} - Note entre 0 et 100
   */
  calculNote(dossier) {
    let note = 0;

    // === CRITÈRES DE SANTÉ (Priorité maximale) ===

    // Critères liés au parcours médical WiSi (déficience visuelle)
    if (dossier.parcoursMedical?.type === "WiSi") {
      const parcours = dossier.parcoursMedical.data;

      if (parcours.est_aveugle) {
        note += 30; // Cécité = priorité maximale
      }

      if (!parcours.a_perception_visuelle) {
        note += 20; // Pas de perception visuelle
      }

      if (!parcours.a_consulte_ophtalmo) {
        note += 15; // N'a pas consulté d'ophtalmologue
      }

      if (!parcours.a_autre_suivi_medical && parcours.details_suivi_medical) {
        note += 10; // Besoin de suivi médical non satisfait
      }
    }

    // Critères liés au parcours médical TARII
    if (dossier.parcoursMedical?.type === "TARII") {
      const parcours = dossier.parcoursMedical.data;

      // Absence de suivis nécessaires
      if (!parcours.suivi_orthophonique) note += 10;
      if (!parcours.suivi_psychologique) note += 10;
      if (!parcours.psychomotricien) note += 8;

      // Recours uniquement au tradipraticien (manque de soins modernes)
      if (
        parcours.tradipracticien &&
        !parcours.suivi_orthophonique &&
        !parcours.suivi_psychologique
      ) {
        note += 15;
      }
    }

    // === CRITÈRES SCOLAIRES ===

    // Non scolarisation = priorité élevée
    if (!dossier.est_scolarise) {
      note += 25; // Enfant non scolarisé

      // Aggravation si pas d'activités quotidiennes structurées
      if (
        !dossier.activites_quotidiennes ||
        dossier.activites_quotidiennes.toLowerCase().includes("aucun") ||
        dossier.activites_quotidiennes.toLowerCase().includes("rien")
      ) {
        note += 10;
      }
    } else {
      // Enfant scolarisé mais niveau inadapté
      if (dossier.niveau_scolaire) {
        const niveauLower = dossier.niveau_scolaire.toLowerCase();
        if (
          niveauLower.includes("retard") ||
          niveauLower.includes("difficultés") ||
          niveauLower.includes("adapté")
        ) {
          note += 15;
        }
      }
    }

    // === CRITÈRES D'ÉTABLISSEMENT ===

    // Pas encore inscrit dans un établissement spécialisé
    if (!dossier.etablissement || !dossier.etablissement.libelle) {
      note += 20;
    } else {
      // Vérifier si l'établissement actuel est adapté
      const etablissementLibelle = dossier.etablissement.libelle.toLowerCase();
      if (
        etablissementLibelle.includes("temporaire") ||
        etablissementLibelle.includes("attente")
      ) {
        note += 10;
      }
    }

    // Pas d'ancien établissement (nouveau dans le système)
    if (!dossier.ancien_etablissement) {
      note += 5;
    }

    // === CRITÈRES SOCIO-DÉMOGRAPHIQUES (existants) ===

    // Critères liés à l'âge
    const dateNaissance = new Date(dossier.dateNaissance);
    const age = this.calculerAge(dateNaissance);
    if (age < 3) note += 15;
    else if (age < 6) note += 12;
    else if (age < 10) note += 8;
    else if (age < 15) note += 5;

    // Critères liés au sexe
    if (dossier.sexe === "F") note += 3;

    // === CRITÈRES ADMINISTRATIFS ===

    // Critères liés au statut du dossier
    switch (dossier.statutDossier) {
      case "Nouveau":
        note += 15;
        break;
      case "En_cours":
        note += 10;
        break;
      case "Incomplet":
        note += 20;
        break;
      case "Rejete":
        note += 25;
        break;
    }

    // === CRITÈRES DOCUMENTAIRES ===

    // Moins de documents = plus de points
    if (!dossier.documents || dossier.documents.length === 0) {
      note += 12;
    } else if (dossier.documents.length < 3) {
      note += 8;
    }

    // === CRITÈRES TEMPORELS ===

    // Ancienneté du dossier
    const dateCreation = new Date(dossier.dateCreation);
    const joursDepuisCreation = this.calculerJoursDepuis(dateCreation);
    if (joursDepuisCreation > 180) note += 12;
    else if (joursDepuisCreation > 90) note += 8;
    else if (joursDepuisCreation > 30) note += 4;

    // Normaliser la note sur 100 avec une formule qui favorise les scores élevés
    const noteFinale = Math.min(100, note);

    // Appliquer une courbe pour accentuer les différences
    return Math.round(Math.pow(noteFinale / 100, 0.8) * 100);
  }

  /**
   * Calcule l'âge en années à partir de la date de naissance
   */
  calculerAge(dateNaissance) {
    const aujourdhui = new Date();
    let age = aujourdhui.getFullYear() - dateNaissance.getFullYear();
    const mois = aujourdhui.getMonth() - dateNaissance.getMonth();

    if (
      mois < 0 ||
      (mois === 0 && aujourdhui.getDate() < dateNaissance.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Calcule le nombre de jours écoulés depuis une date
   */
  calculerJoursDepuis(date) {
    const aujourdhui = new Date();
    const diffTime = Math.abs(aujourdhui - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

const dossierEnfantService = new DossierEnfantService();
export default dossierEnfantService;
