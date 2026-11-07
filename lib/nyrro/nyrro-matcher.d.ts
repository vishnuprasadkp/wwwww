export type NyrroReply = {
  answer: string;
  followups: string[];
  match: { type: string; id: string; aspect?: string; score: number };
};
export type Nyrro = {
  ask: (text: string) => NyrroReply;
  peek?: (text: string) => unknown;
  reset: () => void;
  normalize: (text: string) => string;
};
export default function createNyrro(kb: unknown, options?: { onMiss?: (q: string) => void }): Nyrro;
