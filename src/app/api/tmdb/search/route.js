import {
  enrichArgentineMovieTitles,
  mergeMultiLocaleSearchResults,
} from "@/helpers/tmdbHelpers";

const TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie";

const SEARCH_LOCALES = [
  { language: "es-AR", region: "AR" },
  { language: "es-MX", region: "MX" },
  { language: "en-US", region: "US" },
];

async function fetchSearchForLocale(query, locale, token) {
  const url = new URL(TMDB_SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("language", locale.language);
  url.searchParams.set("page", "1");
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("region", locale.region);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return { locale: locale.language, results: [], ok: false };
  }

  const data = await response.json();
  return {
    locale: locale.language,
    results: data.results ?? [],
    ok: true,
  };
}

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

  try {
    const localeResults = await Promise.all(
      SEARCH_LOCALES.map((locale) => fetchSearchForLocale(query, locale, token))
    );

    const anyOk = localeResults.some((entry) => entry.ok);

    if (!anyOk) {
      return Response.json(
        { error: "No pudimos buscar películas en este momento." },
        { status: 502 }
      );
    }

    const merged = mergeMultiLocaleSearchResults(localeResults);

    const results = await enrichArgentineMovieTitles(merged, async (movieId) => {
      const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}`);
      url.searchParams.set("language", "es-AR");

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      });

      if (!response.ok) return null;
      return response.json();
    });

    return Response.json({ results });
  } catch {
    return Response.json(
      { error: "No pudimos buscar películas en este momento." },
      { status: 500 }
    );
  }
}
