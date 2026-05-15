// Shared Fuseki Graph Store Protocol (GSP) helpers for exporter scripts.
// Used by io-taxonomy-export.js, method-export.js, and future per-graph exporters.

export async function putNamedGraph({ endpoint, graphIri, turtle, token }) {
  if (!endpoint) throw new Error("putNamedGraph: missing `endpoint`");
  if (!graphIri) throw new Error("putNamedGraph: missing `graphIri`");
  if (typeof turtle !== "string") throw new Error("putNamedGraph: `turtle` must be a string");

  const url = new URL(endpoint);
  url.searchParams.set("graph", graphIri);

  const headers = {
    "Content-Type": "text/turtle",
    ...(token ? { "X-API-Token": token } : {}),
  };

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
