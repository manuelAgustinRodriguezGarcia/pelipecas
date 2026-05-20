import { mapTmdbMovie } from "@/helpers/tmdbHelpers";

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

  const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}`);
  url.searchParams.set("language", "es-AR");

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
        { error: "No pudimos cargar los detalles de la película." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json({ movie: mapTmdbMovie(data) });
  } catch {
    return Response.json(
      { error: "No pudimos cargar los detalles de la película." },
      { status: 500 }
    );
  }
}
