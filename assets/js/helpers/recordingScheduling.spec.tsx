import { calcRecordingDeadlines } from "./recordingScheduling";

const mockedToneModule = {
  now: () => 0,
};

const mockedDateModule = {
  now: () => 1610577700000,
};

describe("scheduleRecordingStart", () => {
  test("successfully generates recording schedule deadlines", () => {
    const serverSendTimestamp = 1610577381024;
    const bufferTime = 5;
    const sampleTime = 10;
    const recordingTime = 30;

    const expectedDeadlines = {
      sampleStartTime: 313.976,
      recordingStartTime: 324.6427,
      recordingEndTime: 354.6427,
    };

    const actualDeadlines = calcRecordingDeadlines(
      serverSendTimestamp,
      bufferTime,
      sampleTime,
      recordingTime,
      mockedDateModule
    );

    expect(actualDeadlines).toStrictEqual(expectedDeadlines);
  });
});
