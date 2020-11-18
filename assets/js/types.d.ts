export interface Note {
    instrument: string,
    key: number;
    duration: number;
}

export interface TimestepSlice {
    timestep: number;
    notes: Note[];
}

export interface Loop {
    start_timestep: number;
    length: number;
    timestep_slices: TimestepSlice[];
}
