import { mapTmdbMovieDetails } from "@/helpers/tmdbHelpers";

const TMDB_FETCH_OPTIONS = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
  next: { revalidate: 3600 },
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get("movieId");

  if (!movieId || Number.isNaN(Number(movieId))) {
    return Response.json({ error: "Película no encontrada." }, { status: 400 });
  }

  const token = process.env.TMDB_READ_ACCESS_TOKEN;

  if (!token) {
    return Response.json(
      { error: "TMDB no está configurado." },
      { status: 500 }
    );
  }

  const movieUrl = new URL(`https://api.themoviedb.org/3/movie/${movieId}`);
  movieUrl.searchParams.set("language", "es-AR");
  movieUrl.searchParams.set("append_to_response", "images");

  const watchProvidersUrl = new URL(
    `https://api.themoviedb.org/3/movie/${movieId}/watch/providers`
  );

  try {
    const [movieResponse, watchProvidersResponse] = await Promise.all([
      fetch(movieUrl.toString(), TMDB_FETCH_OPTIONS(token)),
      fetch(watchProvidersUrl.toString(), TMDB_FETCH_OPTIONS(token)),
    ]);

    if (!movieResponse.ok) {
      return Response.json(
        { error: "No pudimos cargar los detalles de la película." },
        { status: movieResponse.status }
      );
    }

    const movieData = await movieResponse.json();
    let watchProvidersPayload = null;

    if (watchProvidersResponse.ok) {
      watchProvidersPayload = await watchProvidersResponse.json();
    }

    const imagesPayload = movieData.images ?? { posters: [] };
    const movie = mapTmdbMovieDetails(
      movieData,
      imagesPayload,
      watchProvidersPayload
    );

    return Response.json({ movie });
  } catch {
    return Response.json(
      { error: "No pudimos cargar los detalles de la película." },
      { status: 500 }
    );
  }
}
