import { fetchBufferData } from "./utils";

const audioContext = new AudioContext();

export default class SoundManager {
  static sounds = new Map<string, AudioBuffer>();

  public static get(id: string) {
    const buff = SoundManager.sounds.get(id);
    if (!buff) {
      throw new Error(`Sound with id ${id} not found`);
    }
    return buff;
  }

  public static async add(url: string) {
    const data = await fetchBufferData(url);
    const audioBuffer = await audioContext.decodeAudioData(data.buffer)!;
    SoundManager.sounds.set(url, audioBuffer as any);
  }

  public static setup() {
    //
  }
}

export { audioContext };
