import { Loop, Note, TimestepSlice, Musician } from "../types";
import * as _ from "lodash";


/**
 * MusiciansManager is responsible for maintaining client side state for all musicians in room
 * as well as providing an API to manipulate this state.
 */
export class MusiciansManager {
  musiciansMap: {[key:string]: Musician};

  constructor() {
    this.musiciansMap = {};
  }

  addMusician(musician: Musician): void {
    this.musiciansMap[musician.musician_id] = musician;
  }

  getMusician(musicianId: string): Musician {
    return this.musiciansMap[musicianId]
  }
}