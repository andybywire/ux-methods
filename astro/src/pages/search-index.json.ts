import {sanityClient} from "sanity:client";

export const prerender = true;

type RawItem = {
  title: string;
  metaDescription: string;
  slug: { current: string } | string;
};

type QueryResult = {
  disciplines: RawItem[];
  methods: RawItem[];
};

type SearchDoc = {
  title: string;
  description: string;
  slug: string;
  type: "discipline" | "method";
};

const query = /* groq */ `{
  "disciplines": *[_type == "discipline"]{
    title,
    metaDescription,
    "slug": slug.current
  },
  "methods": *[_type == "method"]{
    title,
    metaDescription,
    "slug": slug.current
  }
}`;

export async function GET() {
  const data = await sanityClient.fetch<QueryResult>(query)

  const items: SearchDoc[] = [
    ...data.disciplines.map((d) => ({
      title: d.title,
      description: d.metaDescription,
      slug: typeof d.slug === "string" ? d.slug : d.slug.current,
      type: "discipline" as const,
    })),
    ...data.methods.map((m) => ({
      title: m.title,
      description: m.metaDescription,
      slug: typeof m.slug === "string" ? m.slug : m.slug.current,
      type: "method" as const,
    })),
  ];

  return new Response(JSON.stringify(items), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}