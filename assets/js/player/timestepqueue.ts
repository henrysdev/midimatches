import { Loop, Note, TimestepSlice, Musician } from "../types";


export class LoopTimestepQueue {
  actionsQueue: Function[];
  musiciansMap: {[key:string]: Musician};
  orderedTimestepSlices: TimestepSlice[];
  loopRestartDeadlines: {[key:number]: string[]};
  constructor() {
    this.actionsQueue = [];
    this.musiciansMap = {};
    this.orderedTimestepSlices = [];
    this.loopRestartDeadlines = {};
  }

  // Queue action to add a new musician next timestep
  addMusician(musician: Musician): void {
    const action = (timestep: number) => {
      this.musiciansMap[musician.musician_id] = musician;
      this._restartMusicianLoop(musician.musician_id, timestep);
    }
    this.actionsQueue.push(action);
  }

  // Queue action to update the incumbent loop for an existing musician next timestep
  updateMusicianLoop(loop: Loop, musicianId: string): void {
    const action = (timestep: number) => {
      if (musicianId in this.musiciansMap) {
        this.musiciansMap[musicianId].loop = loop;
        this._restartMusicianLoop(musicianId, timestep);
      } else {
        console.log("tried to update a musician loop for a musician that does not exist : ", musicianId);
      }
    }
    this.actionsQueue.push(action);
  }

  // Return timestep slices due for the given timestep and update deadlines where necessary
  getDueTimestepSlices(currTimestep: number): TimestepSlice[] {
    // execute action queue
    this.actionsQueue.forEach((action: Function) => action(currTimestep));
    this.actionsQueue = [];

    // split array into due timestep slices and remaining timestep slices
    let splitIdx = 0;
    while (splitIdx < this.orderedTimestepSlices.length &&
      this.orderedTimestepSlices[splitIdx].timestep <= currTimestep) splitIdx++;
    const dueTimestepSlices = this.orderedTimestepSlices.splice(0, splitIdx);

    // restart any loops that have reached their timestep deadline
    this._handleDueRestartDeadlines(currTimestep);

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
    const loop = this.musiciansMap[musicianId].loop;
    // TODO set loop.start_timestep to current
    // loop.start_timestep = timestep;

    // adjust position to be correct timestep for each timestep
    const timeAdjustedTimestepSlices = loop.timestep_slices.map((timestepSlice) => {
      timestepSlice.timestep += loop.start_timestep;
      return timestepSlice;
    });

    // add timestep to restart loop to loop restart deadlines
    const deadline = loop.start_timestep + loop.length;
    deadline in this.loopRestartDeadlines ?
      this.loopRestartDeadlines[deadline].push(musicianId) :
      this.loopRestartDeadlines[deadline] = [musicianId];

    // copy loop into timeslices and sort
    this.orderedTimestepSlices = this.orderedTimestepSlices
      .concat(timeAdjustedTimestepSlices)
      .sort((sliceA, sliceB) => sliceA.timestep - sliceB.timestep);
  }
}