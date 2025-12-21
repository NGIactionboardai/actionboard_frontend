/**
 * Build a flat, absolute-time word timeline from bot transcript
 *
 * @param {Array} transcript - bot transcript array
 * @param {number} recordingStartMs - recording.start_timestamp_ms
 * @returns {Array} wordTimeline
 */
export function buildWordTimeline(transcript, recordingStartMs) {
    if (!Array.isArray(transcript) || !recordingStartMs) return [];
  
    const timeline = [];
  
    transcript.forEach((utterance, utteranceIndex) => {
      const utteranceStartMs = utterance.timestamp_ms;
  
      utterance.transcription?.words?.forEach((word, wordIndex) => {
        const startSeconds =
          (utteranceStartMs + word.start * 1000 - recordingStartMs) / 1000;
  
        const endSeconds =
          (utteranceStartMs + word.end * 1000 - recordingStartMs) / 1000;
  
        timeline.push({
          id: `${utteranceIndex}-${wordIndex}`,
          word: word.word,
          start: Math.max(startSeconds, 0),
          end: Math.max(endSeconds, 0),
          speaker: utterance.speaker_name,
          utteranceIndex,
          wordIndex,
        });
      });
    });
  
    return timeline.sort((a, b) => a.start - b.start);
  }