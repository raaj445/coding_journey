import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function posterUrl(path: string | null) {
  return path ? `https://image.tmdb.org/t/p/w342${path}` : null;
}

function normalize(movie: any) {
  const releaseDate = movie.release_date || "";
  return {
    id: movie.id,
    title: movie.title || movie.original_title || "Untitled",
    originalTitle: movie.original_title || movie.title || "",
    releaseDate,
    year: releaseDate ? releaseDate.slice(0, 4) : "",
    language: movie.original_language || "",
    posterPath: movie.poster_path || null,
    posterUrl: posterUrl(movie.poster_path || null),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const token = Deno.env.get("TMDB_ACCESS_TOKEN");
  if (!token) return json({ error: "TMDB_ACCESS_TOKEN is not configured" }, 503);

  try {
    const body = await req.json().catch(() => ({}));
    const query = String(body.query || "").trim();
    const mode = body.mode === "recent" ? "recent" : "search";

    const url = new URL(
      mode === "recent"
        ? "https://api.themoviedb.org/3/discover/movie"
        : "https://api.themoviedb.org/3/search/movie",
    );
    url.searchParams.set("language", "en-IN");
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("page", "1");
    url.searchParams.set("region", "IN");

    if (mode === "recent") {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 45);
      url.searchParams.set("primary_release_date.gte", start.toISOString().slice(0, 10));
      url.searchParams.set("primary_release_date.lte", today.toISOString().slice(0, 10));
      url.searchParams.set("sort_by", "primary_release_date.desc");
      url.searchParams.set("with_release_type", "2|3");
    } else {
      if (!query) return json({ results: [] });
      url.searchParams.set("query", query);
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("TMDB error", response.status, detail);
      return json({ error: "Movie service unavailable" }, 502);
    }

    const data = await response.json();
    const results = (data.results || [])
      .filter((movie: any) => movie.poster_path || movie.title || movie.original_title)
      .slice(0, 8)
      .map(normalize);

    return json({ results });
  } catch (error) {
    console.error(error);
    return json({ error: "Unable to search movies" }, 500);
  }
});
