// export type Language = 'English' | 'Frenc



export type Artist = {
  id: number,
  artistName: string;
  recordLabel: string;
};
// Used to validate the query string of HTTP Get requests


export type Song =   {
  artistId: number,
  genre: string[],
  original_language: string,
  title: string,
  artist: string,
  release_date: string,
  recordLabel: string,
};

export type songQueryParams = {
  artistId: string;
  artist?: string;
  recordLabel?: string;
};