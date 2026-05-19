import { mapTmdbMovie } from "@/helpers/tmdbHelpers";

const TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";

  if (query.length < 2) {
    return Response.json({ results: [] });
  }

  const token = process.env.TMDB_READ_ACCESS_TOKEN;

  if (!token) {
    return Response.json(
      { error: "TMDB no está configurado." },
      { status: 500 }
    );
  }

  const url = new URL(TMDB_SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("language", "es-AR");
  url.searchParams.set("page", "1");
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("region", "AR");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return Response.json(
        { error: "No pudimos buscar películas en este momento." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const results = (data.results ?? [])
      .slice(0, 5)
      .map(mapTmdbMovie);

    return Response.json({ results });
  } catch {
    return Response.json(
      { error: "No pudimos buscar películas en este momento." },
      { status: 500 }
    );
  }
}
