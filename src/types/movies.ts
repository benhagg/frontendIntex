export interface Movie {
  showId: number;
  type: string;
  title: string;
  genre: string;
  description: string;
  imageUrl: string;
  releaseYear: number;
  director: string;
  cast: string;
  duration: string;
  country: string;
  averageRating: number;
  

  // Genre flags
  Action?: boolean;
  Adventure?: boolean;
  AnimeSeriesInternationalTVShows?: boolean;
  BritishTVShowsDocuseriesInternationalTVShows?: boolean;
  Children?: boolean;
  Comedy?: boolean;
  ComedyDramasInternationalMovies?: boolean;
  ComedyRomanticMovies?: boolean;
  CrimeTVShowsDocuseries?: boolean;
  Dcoumentaries?: boolean;
  DocumentariesInternationalMoves?: boolean;
  Docuseries?: boolean;
  Drama?: boolean;
  DramaInternationalMovies?: boolean;
  DramaRomanticMovies?: boolean;
  FamilyMovies?: boolean;
  Fantasy?: boolean;
  Horror?: boolean;
  InternationalMoviesThrillers?: boolean;
  InternationalTVShowsRomanticTVShowsTVDramas?: boolean;
  KidsTV?: boolean;
  LanguageTVShows?: boolean;
  Musicals?: boolean;
  NatureTV?: boolean;
  RealityTV?: boolean;
  Spirituality?: boolean;
  TVAction?: boolean;
  TVComedies?: boolean;
  TVDramas?: boolean;
  TalkShowsTVComedies?: boolean;
  Thriller?: boolean;
}
