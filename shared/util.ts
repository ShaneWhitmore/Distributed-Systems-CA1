import { marshall } from "@aws-sdk/util-dynamodb";
import { Artist} from "./types";

export const generateSongItem = (artist: Artist) => {
  return {
    PutRequest: {
      Item: marshall(artist),
    },
  };
};

export const generateBatch = (data: Artist[]) => {
  return data.map((e) => {
    return generateSongItem(e);
  });
};
