// Ensure the correct path or create the Movie type if missing
import { Movie } from "../types/movies"; // Verify this path exists or create the file

export const toMovie = (movie: any): Movie => ({
  showId: movie.showId,
  type: movie.type || "Movie", // fallback
  title: movie.title,
  genre: movie.genre,
  description: movie.description || "",
  imageUrl: movie.imageUrl
    ? encodeURI(movie.imageUrl)
    : `/images/${movie.showId}.jpg`,
  releaseYear: movie.releaseYear || movie.year,
  director: movie.director || "Unknown",
  cast: movie.cast || "Unknown",
  duration: movie.duration || "Unknown",
  averageRating: movie.averageRating ?? 0,
  rating: movie.rating || "",

  // Genre flags (default to false if not present)
  Action: movie.Action ?? false,
  Adventure: movie.Adventure ?? false,
  AnimeSeriesInternationalTVShows:
    movie.AnimeSeriesInternationalTVShows ?? false,
  BritishTVShowsDocuseriesInternationalTVShows:
    movie.BritishTVShowsDocuseriesInternationalTVShows ?? false,
  Children: movie.Children ?? false,
  Comedy: movie.Comedy ?? false,
  ComedyDramasInternationalMovies:
    movie.ComedyDramasInternationalMovies ?? false,
  ComedyRomanticMovies: movie.ComedyRomanticMovies ?? false,
  CrimeTVShowsDocuseries: movie.CrimeTVShowsDocuseries ?? false,
  Dcoumentaries: movie.Dcoumentaries ?? false,
  DocumentariesInternationalMoves:
    movie.DocumentariesInternationalMoves ?? false,
  Docuseries: movie.Docuseries ?? false,
  Drama: movie.Drama ?? false,
  DramaInternationalMovies: movie.DramaInternationalMovies ?? false,
  DramaRomanticMovies: movie.DramaRomanticMovies ?? false,
  FamilyMovies: movie.FamilyMovies ?? false,
  Fantasy: movie.Fantasy ?? false,
  Horror: movie.Horror ?? false,
  InternationalMoviesThrillers: movie.InternationalMoviesThrillers ?? false,
  InternationalTVShowsRomanticTVShowsTVDramas:
    movie.InternationalTVShowsRomanticTVShowsTVDramas ?? false,
  KidsTV: movie.KidsTV ?? false,
  LanguageTVShows: movie.LanguageTVShows ?? false,
  Musicals: movie.Musicals ?? false,
  NatureTV: movie.NatureTV ?? false,
  RealityTV: movie.RealityTV ?? false,
  Spirituality: movie.Spirituality ?? false,
  TVAction: movie.TVAction ?? false,
  TVComedies: movie.TVComedies ?? false,
  TVDramas: movie.TVDramas ?? false,
  TalkShowsTVComedies: movie.TalkShowsTVComedies ?? false,
  Thriller: movie.Thriller ?? false,
});
