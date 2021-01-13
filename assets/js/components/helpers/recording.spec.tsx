import { calcRecordingDeadlines } from "./recording";

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
      recordingStartTime: 323.976,
      recordingEndTime: 353.976,
    };

    const actualDeadlines = calcRecordingDeadlines(
      serverSendTimestamp,
      bufferTime,
      sampleTime,
      recordingTime,
      mockedToneModule,
      mockedDateModule
    );

    expect(actualDeadlines).toStrictEqual(expectedDeadlines);
  });
});
