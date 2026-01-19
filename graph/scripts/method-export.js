// run: node scripts/method-export.js
// change this to uxmethods-data
// prefix: uxmd

import "dotenv/config";
import { createClient } from "@sanity/client";
import { DataFactory, Writer } from "n3";
import fs from "node:fs/promises";

const { namedNode, literal, quad } = DataFactory;

// Utility functions
function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function ensureHashNamespace(iri) {
  return iri.endsWith("#") ? iri : iri + "#";
}

function mintConceptIri(concept, taxonomyBaseIri) {
  const base = ensureHashNamespace(concept?.baseIri || taxonomyBaseIri);
  const id = concept?.conceptId;
  if (!id) throw new Error(`Missing conceptId for concept (prefLabel=${concept?.prefLabel ?? "?"})`);
  return base + encodeURIComponent(id);
}

// Environment variables
const SANITY_PROJECT_ID = mustEnv("SANITY_PROJECT_ID");
const SANITY_DATASET = mustEnv("SANITY_DATASET");
const SANITY_API_VERSION = process.env.SANITY_API_VERSION || "2025-06-10";
// const SANITY_TOKEN = mustEnv("SANITY_TOKEN"); // not needed for read operations

const TAXONOMY_BASE_IRI = mustEnv("TAXONOMY_BASE_IRI");     // https://uxmethods.org/taxonomies/io#
const UXM_TERMS_NS = mustEnv("UXM_TERMS_NS");               // e.g. https://uxmethods.org/ontology/uxm/
                                                            // or: https://uxmethods.org/ontologies/uxmethods-core
const LANG = process.env.LANG_TAG || "en";
const OUT_FILE = process.env.OUT_FILE || "build/methods-data.ttl";

const METHODS_ONTOLOGY_IRI = mustEnv("METHODS_ONTOLOGY_IRI");
const UXM_CORE_ONTOLOGY_IRI = mustEnv("UXM_CORE_ONTOLOGY_IRI"); 

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  // token: SANITY_TOKEN,
  useCdn: false,
});

const groq = `
*[
  _type == "method"
  && defined(uri.current)
  && defined(slug.current)
  && !(_id in path("drafts.**") || _id in path("versions.**"))
] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  "uri": uri.current,
  metaDescription,

  input[]->{
    _id,
    conceptId,
    baseIri,
    prefLabel
  },

  output[]->{
    _id,
    conceptId,
    baseIri,
    prefLabel
  }
}
`;

function addLangLiteral(writer, s, p, v) {
  if (!v) return;
  writer.addQuad(quad(s, p, literal(String(v), LANG)));
}

function addPlainLiteral(writer, s, p, v) {
  if (!v) return;
  writer.addQuad(quad(s, p, literal(String(v))));
}

async function main() {
  const methods = await client.fetch(groq);

  const writer = new Writer({
    prefixes: {
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      owl: "http://www.w3.org/2002/07/owl#",
      dcterms: "http://purl.org/dc/terms/",
      skos: "http://www.w3.org/2004/02/skos/core#",
      uxm: UXM_TERMS_NS,
    },
  });

  const RDF_TYPE = namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  const RDFS_LABEL = namedNode("http://www.w3.org/2000/01/rdf-schema#label");
  const DCT_IDENTIFIER = namedNode("http://purl.org/dc/terms/identifier");
  const DCT_DESCRIPTION = namedNode("http://purl.org/dc/terms/description");

  const OWL_ONTOLOGY = namedNode("http://www.w3.org/2002/07/owl#Ontology");
  const OWL_IMPORTS = namedNode("http://www.w3.org/2002/07/owl#imports");

  // Terms from the UXM ontology
  const UXM_Method = namedNode(`${UXM_TERMS_NS}Method`);
  const UXM_usesInput = namedNode(`${UXM_TERMS_NS}usesInput`);
  const UXM_producesOutput = namedNode(`${UXM_TERMS_NS}producesOutput`);
  const UXM_slug = namedNode(`${UXM_TERMS_NS}slug`);


   // Ontology header so Protégé can import by logical IRI
  const ont = namedNode(METHODS_ONTOLOGY_IRI);
  writer.addQuad(quad(ont, RDF_TYPE, OWL_ONTOLOGY));
  writer.addQuad(quad(ont, OWL_IMPORTS, namedNode(UXM_CORE_ONTOLOGY_IRI)));
  addLangLiteral(writer, ont, RDFS_LABEL, "UX Methods – Methods data export");

  for (const m of methods) {
    const uri = m?.uri;
    if (!uri) continue;

    const subj = namedNode(uri);

    writer.addQuad(quad(subj, RDF_TYPE, UXM_Method));
    addLangLiteral(writer, subj, RDFS_LABEL, m.title);
    addLangLiteral(writer, subj, DCT_DESCRIPTION, m.metaDescription);
    addPlainLiteral(writer, subj, DCT_IDENTIFIER, m._id);
    addPlainLiteral(writer, subj, UXM_slug, m.slug);

    if (Array.isArray(m.input)) {
      for (const c of m.input) {
        const cIri = mintConceptIri(c, TAXONOMY_BASE_IRI);
        writer.addQuad(quad(subj, UXM_usesInput, namedNode(cIri)));
      }
    }

    if (Array.isArray(m.output)) {
      for (const c of m.output) {
        const cIri = mintConceptIri(c, TAXONOMY_BASE_IRI);
        writer.addQuad(quad(subj, UXM_producesOutput, namedNode(cIri)));
      }
    }
  }

  const turtle = await new Promise((resolve, reject) => {
    writer.end((err, res) => (err ? reject(err) : resolve(res)));
  });

  await fs.mkdir("build", { recursive: true });
  await fs.writeFile(OUT_FILE, turtle, "utf8");
  console.log(`Wrote methods RDF to ${OUT_FILE} (${methods.length} methods)`);
}

await main();