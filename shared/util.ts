import { marshall } from "@aws-sdk/util-dynamodb";
import { Artist , Song} from "./types";


type Entity = Artist | Song;

export const generateSongItem = (entity: Entity) => {
  return {
    PutRequest: {
      Item: marshall(entity),
    },
  };
};

export const generateBatch = (data: Entity[]) => {
  return data.map((e) => {
    return generateSongItem(e);
  });
};
