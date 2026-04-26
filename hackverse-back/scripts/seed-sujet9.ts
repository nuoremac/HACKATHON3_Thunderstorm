import fs from "fs";
import path from "path";
import { supabase } from "../lib/supabase";
import { parse } from "csv-parse/sync";

async function seed() {
  console.log("🚀 Starting data seeding for Sujet 9...");

  const dataDir = path.join(__dirname, "../../hackverse-front/data/sujet9");

  // 1. Seed Associations
  const jsonContent = JSON.parse(fs.readFileSync(path.join(dataDir, "associations_evenements.json"), "utf-8"));
  const assocMap = new Map<string, string>();

  console.log(`📦 Seeding ${jsonContent.associations.length} associations...`);
  for (const assoc of jsonContent.associations) {
    const { data, error } = await supabase.from("associations").upsert({
      name: assoc.nom,
      description: `Association pour la filière ${assoc.filiere_cible}`,
      mission: `Recruter des membres actifs (${assoc.membres} membres actuels)`,
      tags: [assoc.filiere_cible],
      contact: assoc.contact || "contact@univ.cm",
    }, { onConflict: 'name' }).select("id").single();

    if (error) {
      console.error(`❌ Error seeding association ${assoc.nom}:`, error.message);
    } else {
      assocMap.set(assoc.id, data.id);
    }
  }

  // 2. Seed Events
  console.log(`📅 Seeding ${jsonContent.evenements.length} events...`);
  for (const evt of jsonContent.evenements) {
    const assocId = assocMap.get(evt.organisateur_id);
    const date = new Date(evt.date);
    const startTime = new Date(`${evt.date}T${evt.heure_debut}:00Z`);
    const endTime = new Date(startTime.getTime() + (evt.duree_heures || 1) * 60 * 60 * 1000);

    const { error } = await supabase.from("events").upsert({
      title: evt.titre,
      association_id: assocId,
      description: evt.description || "",
      tags: (evt.tags || "").split("|").filter(Boolean),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      location: evt.lieu || "Campus",
      capacity: evt.places_max,
      source: "sujet9_import",
      verification_status: evt.info_complete === "oui" ? "verified" : "pending",
    }, { onConflict: 'title,start_time' });

    if (error) console.error(`❌ Error seeding event ${evt.titre}:`, error.message);
  }

  // 3. Seed Students
  const csvContent = fs.readFileSync(path.join(dataDir, "etudiants.csv"), "utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`🎓 Seeding ${records.length} students...`);
  for (const rec of records.slice(0, 50)) { // Limit to 50 for now to avoid timeout
    const { error } = await supabase.from("students").upsert({
      name: `Étudiant ${rec.student_id}`,
      email: `${rec.student_id.toLowerCase()}@univ.cm`,
      department: rec.filiere,
      academic_year: rec.annee,
      interests: (rec.interets || "").split("|").filter(Boolean),
      profile_completeness: rec.inscription_complete === "oui" ? 0.8 : 0.2,
      availability: (rec.disponibilites_libres || "").split("|").map((d: string) => {
        const [day, time] = d.split("_");
        return { day, start: time === "aprem" ? "13:00" : "08:00", end: time === "aprem" ? "17:00" : "12:00" };
      }),
    }, { onConflict: 'email' });

    if (error) console.error(`❌ Error seeding student ${rec.student_id}:`, error.message);
  }

  console.log("✅ Seeding complete!");
}

seed().catch(console.error);
