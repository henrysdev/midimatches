import { Loop, Note, TimestepSlice, Musician } from "../types";
import * as _ from "lodash";


export class LoopTimestepQueue {
  actionsQueue: Function[];
  musiciansMap: {[key:string]: Musician};
  orderedTimestepSlices: TimestepSlice[];
  loopRestartDeadlines: {[key:number]: string[]};
  liveLoopMap: {[key:string]: Loop};
  constructor() {
    this.actionsQueue = [];
    this.musiciansMap = {};
    this.orderedTimestepSlices = [];
    this.loopRestartDeadlines = {};
    this.liveLoopMap = {};
  }

  // Queue action to add a new musician next timestep
  addMusician(musician: Musician): void {
    const action = (timestep: number) => {
      this.musiciansMap[musician.musician_id] = musician;
      this.liveLoopMap[musician.musician_id] = _.cloneDeep(musician.loop);
      this._restartMusicianLoop(musician.musician_id, timestep);
    }
    this.actionsQueue.push(action);
  }

  // Queue action to update the incumbent loop for an existing musician next timestep
  updateMusicianLoop(loop: Loop, musicianId: string): void {
    const action = (timestep: number) => {
      if (musicianId in this.musiciansMap) {
        this.musiciansMap[musicianId].loop = loop;
        this.liveLoopMap[musicianId] = _.cloneDeep(loop);
        this._restartMusicianLoop(musicianId, timestep);
      }
    }
    this.actionsQueue.push(action);
  }

  // Return timestep slices due for the given timestep and update deadlines where necessary
  getDueTimestepSlices(currTimestep: number): TimestepSlice[] {
    // execute action queue
    this.actionsQueue.forEach((action: Function) => action(currTimestep));
    this.actionsQueue = [];

    // restart any loops that have reached their timestep deadline
    this._handleDueRestartDeadlines(currTimestep);

    // split array into due timestep slices and remaining timestep slices
    let splitIdx = 0;
    while (splitIdx < this.orderedTimestepSlices.length &&
      this.orderedTimestepSlices[splitIdx].timestep <= currTimestep) splitIdx++;
    const dueTimestepSlices = this.orderedTimestepSlices.splice(0, splitIdx);

    return dueTimestepSlices;
  }

  // Find any/all due restart deadlines and restart appropriate loops
  _handleDueRestartDeadlines(timestep: number): void {
    const musicianIdsRequiringLoopRestart = timestep in this.loopRestartDeadlines ?
      this.loopRestartDeadlines[timestep] :
      [];
    musicianIdsRequiringLoopRestart.forEach((musicianId) => this._restartMusicianLoop(musicianId, timestep));
    delete this.loopRestartDeadlines[timestep];
  }

  // Wrap loop timesteps and set next deadline
  _restartMusicianLoop(musicianId: string, timestep: number): void {
    const liveLoop = this.liveLoopMap[musicianId];
    const origLoop = this.musiciansMap[musicianId].loop;
    liveLoop.start_timestep = timestep;

    // adjust position to be correct timestep for each timestep
    liveLoop.timestep_slices = origLoop.timestep_slices.map((timestepSlice) => {
      // TODO cleaner way to copy and just change one field?
      return {
        timestep: timestepSlice.timestep + liveLoop.start_timestep,
        notes: timestepSlice.notes
      } as TimestepSlice
    });

    // add timestep to restart loop to loop restart deadlines
    const deadline = liveLoop.start_timestep + liveLoop.length;
    deadline in this.loopRestartDeadlines ?
      this.loopRestartDeadlines[deadline].push(musicianId) :
      this.loopRestartDeadlines[deadline] = [musicianId];

    // copy loop into timeslices and sort
    this.orderedTimestepSlices = this.orderedTimestepSlices
      .concat(liveLoop.timestep_slices)
      .sort((sliceA, sliceB) => sliceA.timestep - sliceB.timestep);
  }
}