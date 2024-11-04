// export type Language = 'English' | 'Frenc



export type Artist = {
  id: number,
  artistName: string;
  recordLabel: string;
};
// Used to validate the query string of HTTP Get requests


export type Song =   {
  songId: number,
  genre: string[],
  original_language: string,
  title: string,
  artist: string,
  release_date: string,
};

export type songQueryParams = {
  songId: string;
  artistName?: string;
  recordLabel?: string;
};