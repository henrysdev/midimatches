import { Loop, TimestepSlice, Musician } from "../types/index";
import * as _ from "lodash";

const loopBoundary = 16;

/**
 * LoopPlaybackManager is responsible for maintaining the state and behavior of loop playback
 */
export class LoopPlaybackManager {
  // temporary buffer for actions to be executed on the next timestep event
  actionsQueue: Function[];
  // mapping of musicians in room keyed by musicianId
  musiciansMap: { [key: string]: Musician };
  // ordered list of timestep slices waiting to be scheduled for playback
  orderedTimestepSlices: TimestepSlice[];
  // mapping of loop identifiers (musicianIds) keyed by the timestep at which the playing loop
  // should be restarted
  loopRestartDeadlines: { [key: number]: string[] };
  // mapping of loops keyed by their loop identifiers (musicianIds)
  liveLoopMap: { [key: string]: Loop };

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
      this.musiciansMap[musician.musicianId] = musician;
      this.liveLoopMap[musician.musicianId] = _.cloneDeep(musician.loop);
      this._restartMusicianLoop(musician.musicianId, timestep);
    };
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
    };
    this.actionsQueue.push(action);
  }

  // Return timestep slices due for the given timestep and update deadlines where necessary
  getDueTimestepSlices(currTimestep: number): TimestepSlice[] {
    // execute all actions in action queue if current timestep is at a loop boundary
    if (currTimestep % loopBoundary == 0) {
      this.actionsQueue.forEach((action: Function) => action(currTimestep));
      this.actionsQueue = [];
    }

    // restart any loops that have reached their timestep deadline
    this._handleDueRestartDeadlines(currTimestep);

    // split array into due timestep slices and remaining timestep slices
    let splitIdx = 0;
    while (
      splitIdx < this.orderedTimestepSlices.length &&
      this.orderedTimestepSlices[splitIdx].timestep <= currTimestep
    )
      splitIdx++;
    const dueTimestepSlices = this.orderedTimestepSlices.splice(0, splitIdx);

    return dueTimestepSlices;
  }

  // Find any/all due restart deadlines and restart appropriate loops
  _handleDueRestartDeadlines(timestep: number): void {
    const musicianIdsRequiringLoopRestart =
      timestep in this.loopRestartDeadlines
        ? this.loopRestartDeadlines[timestep]
        : [];
    musicianIdsRequiringLoopRestart.forEach((musicianId) =>
      this._restartMusicianLoop(musicianId, timestep)
    );
    delete this.loopRestartDeadlines[timestep];
  }

  // Wrap loop timesteps and set next deadline
  _restartMusicianLoop(musicianId: string, timestep: number): void {
    const liveLoop = this.liveLoopMap[musicianId];
    const origLoop = this.musiciansMap[musicianId].loop;
    liveLoop.startTimestep = timestep;

    // adjust position to be correct timestep for each timestep
    liveLoop.timestepSlices = origLoop.timestepSlices.map((timestepSlice) => {
      return {
        timestep: timestepSlice.timestep + liveLoop.startTimestep,
        notes: timestepSlice.notes,
      } as TimestepSlice;
    });

    // add timestep to restart loop to loop restart deadlines
    const deadline = liveLoop.startTimestep + liveLoop.length;
    deadline in this.loopRestartDeadlines
      ? this.loopRestartDeadlines[deadline].push(musicianId)
      : (this.loopRestartDeadlines[deadline] = [musicianId]);

    // copy loop into timeslices and sort
    this.orderedTimestepSlices = this.orderedTimestepSlices
      .concat(liveLoop.timestepSlices)
      .sort((sliceA, sliceB) => sliceA.timestep - sliceB.timestep);
  }
}
