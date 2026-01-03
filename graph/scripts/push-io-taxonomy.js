// run: node scripts/push-io-taxonomy.mjs
// run w/ output to file:
//  OUT_FILE=build/io-taxonomy.ttl node scripts/push-io-taxonomy.mjs
// run w/o writing to Fuseki: 
//   DRY_RUN=1 OUT_FILE=build/io-taxonomy.ttl node scripts/push-io-taxonomy.mjs

import "dotenv/config";
import { createClient } from "@sanity/client";
import { DataFactory, Writer } from "n3";
import fs from "node:fs/promises";

const { namedNode, literal, quad } = DataFactory;

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function ensureHashNamespace(iri) {
  return iri.endsWith("#") ? iri : iri + "#";
}

function schemeIriFromBase(baseIri) {
  // "…/io#" -> "…/io"
  return baseIri.endsWith("#") ? baseIri.slice(0, -1) : baseIri;
}

function iriForConcept({ baseIri, conceptId }, defaultBaseIri) {
  const ns = ensureHashNamespace(baseIri || defaultBaseIri);
  if (!conceptId) throw new Error(`Missing conceptId for concept in base ${ns}`);
  return ns + encodeURIComponent(conceptId);
}

const SANITY_PROJECT_ID = mustEnv("SANITY_PROJECT_ID");
const SANITY_DATASET = mustEnv("SANITY_DATASET");
// const SANITY_TOKEN = mustEnv("SANITY_TOKEN");
const SANITY_API_VERSION = process.env.SANITY_API_VERSION || "2025-06-10";

const TAXONOMY_BASE_IRI = mustEnv("TAXONOMY_BASE_IRI"); // https://uxmethods.org/taxonomies/io#
const LANG = process.env.LANG_TAG || "en";

const FUSEKI_GSP_ENDPOINT = mustEnv("FUSEKI_GSP_ENDPOINT"); // https://fuseki.uxmethods.org/ds/data
const GRAPH_IRI = mustEnv("FUSEKI_GRAPH_IRI");             // https://uxmethods.org/taxonomies/io
const FUSEKI_API_TOKEN = process.env.FUSEKI_API_TOKEN;
const FUSEKI_USER = process.env.FUSEKI_USER;
const FUSEKI_PASSWORD = process.env.FUSEKI_PASSWORD;

const DRY_RUN = process.env.DRY_RUN === "1";
const OUT_FILE = process.env.OUT_FILE;

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  // token: SANITY_TOKEN,
  useCdn: false,
});

const groq = `
*[
  _type == "skosConceptScheme"
  && baseIri == $baseIri
  && !(_id in path("drafts.**") || _id in path("versions.**"))
]{
  _id,
  schemeId,
  baseIri,
  title,
  description,

  topConcepts[]->{
    _id,
    conceptId,
    baseIri,
    prefLabel
  },

  concepts[]->{
    _id,
    conceptId,
    baseIri,

    prefLabel,
    definition,
    example,
    scopeNote,

    altLabel,
    hiddenLabel,

    historyNote,
    editorialNote,
    changeNote,

    broader[]->{
      _id,
      conceptId,
      baseIri
    },

    related[]->{
      _id,
      conceptId,
      baseIri
    }
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

function addLangLiterals(writer, s, p, arr) {
  if (!Array.isArray(arr)) return;
  const seen = new Set();
  for (const v of arr) {
    const str = (v ?? "").toString().trim();
    if (!str || seen.has(str)) continue;
    seen.add(str);
    writer.addQuad(quad(s, p, literal(str, LANG)));
  }
}

async function buildTurtle() {
  const schemes = await client.fetch(groq, { baseIri: TAXONOMY_BASE_IRI });

  if (!Array.isArray(schemes) || schemes.length === 0) {
    throw new Error(`No skosConceptScheme found with baseIri == ${TAXONOMY_BASE_IRI}`);
  }
  if (schemes.length > 1) {
    throw new Error(`Found multiple skosConceptScheme docs for baseIri == ${TAXONOMY_BASE_IRI}`);
  }

  const schemeDoc = schemes[0];
  const baseIri = schemeDoc.baseIri || TAXONOMY_BASE_IRI;

  const schemeIri = schemeIriFromBase(baseIri);
  if (schemeIri !== GRAPH_IRI) {
    // Not fatal, but a helpful guardrail.
    console.warn(
      `Warning: schemeIri (${schemeIri}) != GRAPH_IRI (${GRAPH_IRI}). ` +
      `This is ok, but you probably want them to match.`
    );
  }

  const writer = new Writer({
    prefixes: {
      skos: "http://www.w3.org/2004/02/skos/core#",
      dcterms: "http://purl.org/dc/terms/",
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    },
  });

  const SKOS = {
    ConceptScheme: namedNode("http://www.w3.org/2004/02/skos/core#ConceptScheme"),
    Concept: namedNode("http://www.w3.org/2004/02/skos/core#Concept"),
    prefLabel: namedNode("http://www.w3.org/2004/02/skos/core#prefLabel"),
    definition: namedNode("http://www.w3.org/2004/02/skos/core#definition"),
    example: namedNode("http://www.w3.org/2004/02/skos/core#example"),
    scopeNote: namedNode("http://www.w3.org/2004/02/skos/core#scopeNote"),
    altLabel: namedNode("http://www.w3.org/2004/02/skos/core#altLabel"),
    hiddenLabel: namedNode("http://www.w3.org/2004/02/skos/core#hiddenLabel"),
    historyNote: namedNode("http://www.w3.org/2004/02/skos/core#historyNote"),
    editorialNote: namedNode("http://www.w3.org/2004/02/skos/core#editorialNote"),
    changeNote: namedNode("http://www.w3.org/2004/02/skos/core#changeNote"),
    broader: namedNode("http://www.w3.org/2004/02/skos/core#broader"),
    narrower: namedNode("http://www.w3.org/2004/02/skos/core#narrower"),
    related: namedNode("http://www.w3.org/2004/02/skos/core#related"),
    inScheme: namedNode("http://www.w3.org/2004/02/skos/core#inScheme"),
    hasTopConcept: namedNode("http://www.w3.org/2004/02/skos/core#hasTopConcept"),
    topConceptOf: namedNode("http://www.w3.org/2004/02/skos/core#topConceptOf"),
    notation: namedNode("http://www.w3.org/2004/02/skos/core#notation"),
  };

  const RDF_TYPE = namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  const DCT = {
    description: namedNode("http://purl.org/dc/terms/description"),
    identifier: namedNode("http://purl.org/dc/terms/identifier"),
  };

  const scheme = namedNode(schemeIri);

  // Scheme triples
  writer.addQuad(quad(scheme, RDF_TYPE, SKOS.ConceptScheme));
  addLangLiteral(writer, scheme, SKOS.prefLabel, schemeDoc.title || "UX Methods IO Taxonomy");
  addLangLiteral(writer, scheme, DCT.description, schemeDoc.description);
  addPlainLiteral(writer, scheme, DCT.identifier, schemeDoc.schemeId);

  const concepts = Array.isArray(schemeDoc.concepts) ? schemeDoc.concepts : [];
  const topConcepts = Array.isArray(schemeDoc.topConcepts) ? schemeDoc.topConcepts : [];

  // Union + dedupe by Sanity _id
  const conceptById = new Map();
  for (const c of concepts) conceptById.set(c._id, c);
  for (const c of topConcepts) conceptById.set(c._id, c);

  const relatedPairs = new Set();
  const narrowerPairs = new Set();

  function conceptNode(c) {
    return namedNode(iriForConcept({ baseIri: c?.baseIri, conceptId: c?.conceptId }, baseIri));
  }

  // Emit concepts
  for (const c of conceptById.values()) {
    if (!c?.conceptId) throw new Error(`Concept missing conceptId (_id=${c?._id})`);
    if (!c?.prefLabel) throw new Error(`Concept missing prefLabel (conceptId=${c?.conceptId})`);

    const cn = conceptNode(c);

    writer.addQuad(quad(cn, RDF_TYPE, SKOS.Concept));
    writer.addQuad(quad(cn, SKOS.inScheme, scheme));

    addLangLiteral(writer, cn, SKOS.prefLabel, c.prefLabel);
    addPlainLiteral(writer, cn, DCT.identifier, c.conceptId);
    addPlainLiteral(writer, cn, SKOS.notation, c.conceptId);

    addLangLiteral(writer, cn, SKOS.definition, c.definition);
    addLangLiteral(writer, cn, SKOS.example, c.example);
    addLangLiteral(writer, cn, SKOS.scopeNote, c.scopeNote);

    addLangLiteral(writer, cn, SKOS.historyNote, c.historyNote);
    addLangLiteral(writer, cn, SKOS.editorialNote, c.editorialNote);
    addLangLiteral(writer, cn, SKOS.changeNote, c.changeNote);

    addLangLiterals(writer, cn, SKOS.altLabel, c.altLabel);
    addLangLiterals(writer, cn, SKOS.hiddenLabel, c.hiddenLabel);

    // broader/narrower
    if (Array.isArray(c.broader)) {
      for (const b of c.broader) {
        if (!b?.conceptId) continue;
        const bn = conceptNode(b);
        writer.addQuad(quad(cn, SKOS.broader, bn));

        const invKey = `${bn.value}||${cn.value}`;
        if (!narrowerPairs.has(invKey)) {
          narrowerPairs.add(invKey);
          writer.addQuad(quad(bn, SKOS.narrower, cn));
        }
      }
    }

    // related (materialize symmetric edge)
    if (Array.isArray(c.related)) {
      for (const r of c.related) {
        if (!r?.conceptId) continue;
        const rn = conceptNode(r);

        const a = cn.value, b = rn.value;
        const k1 = `${a}||${b}`;
        const k2 = `${b}||${a}`;

        if (!relatedPairs.has(k1)) {
          relatedPairs.add(k1);
          writer.addQuad(quad(cn, SKOS.related, rn));
        }
        if (!relatedPairs.has(k2)) {
          relatedPairs.add(k2);
          writer.addQuad(quad(rn, SKOS.related, cn));
        }
      }
    }
  }

  // Top concepts
  for (const tc of topConcepts) {
    if (!tc?.conceptId) continue;
    const tcn = conceptNode(tc);
    writer.addQuad(quad(scheme, SKOS.hasTopConcept, tcn));
    writer.addQuad(quad(tcn, SKOS.topConceptOf, scheme));
  }

  const turtle = await new Promise((resolve, reject) => {
    writer.end((err, res) => (err ? reject(err) : resolve(res)));
  });

  return { turtle };
}

async function putToFuseki(turtle) {
  const url = new URL(FUSEKI_GSP_ENDPOINT);
  url.searchParams.set("graph", GRAPH_IRI);

  const headers = { 
    "Content-Type": "text/turtle" ,
    ...(FUSEKI_API_TOKEN ? { "X-API-Token": FUSEKI_API_TOKEN } : {}),
  };
  // if (FUSEKI_USER && FUSEKI_PASSWORD) {
  //   const token = Buffer.from(`${FUSEKI_USER}:${FUSEKI_PASSWORD}`).toString("base64");
  //   headers["Authorization"] = `Basic ${token}`;
  // }

  const res = await fetch(url.toString(), { method: "PUT", headers, body: turtle });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const hint =
      res.status === 403
        ? "\nHint: nginx is enforcing X-API-Token. Confirm FUSEKI_API_TOKEN is set and correct."
        : "";
    throw new Error(`Fuseki PUT failed: ${res.status} ${res.statusText}\n${text}${hint}`);
  }
}

const { turtle } = await buildTurtle();

if (OUT_FILE) {
  await fs.mkdir("build", { recursive: true });
  await fs.writeFile(OUT_FILE, turtle, "utf8");
  console.log(`Wrote Turtle to ${OUT_FILE}`);
}

if (DRY_RUN) {
  console.log("DRY_RUN=1 — not pushing to Fuseki");
  console.log(`Would PUT to: ${FUSEKI_GSP_ENDPOINT}?graph=${GRAPH_IRI}`);
  process.exit(0);
}

await putToFuseki(turtle);
console.log(`Loaded IO taxonomy into named graph: ${GRAPH_IRI}`);