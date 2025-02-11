export const GENRES = {
  0: { name: "All", color: "bg-gradient-to-br from-gray-400 to-gray-600" },
  132: { name: "Pop", color: "bg-gradient-to-br from-pink-400 to-pink-600" },
  116: { name: "Rap/Hip Hop", color: "bg-gradient-to-br from-purple-400 to-purple-600" },
  152: { name: "Rock", color: "bg-gradient-to-br from-red-400 to-red-600" },
  113: { name: "Dance", color: "bg-gradient-to-br from-blue-400 to-blue-600" },
  165: { name: "R&B", color: "bg-gradient-to-br from-indigo-400 to-indigo-600" },
  85: { name: "Alternative", color: "bg-gradient-to-br from-green-400 to-green-600" },
  106: { name: "Electro", color: "bg-gradient-to-br from-yellow-400 to-yellow-600" },
  466: { name: "Folk", color: "bg-gradient-to-br from-orange-400 to-orange-600" },
  144: { name: "Reggae", color: "bg-gradient-to-br from-teal-400 to-teal-600" },
  129: { name: "Jazz", color: "bg-gradient-to-br from-cyan-400 to-cyan-600" },
  98: { name: "Classical", color: "bg-gradient-to-br from-emerald-400 to-emerald-600" },
  173: { name: "Films/Games", color: "bg-gradient-to-br from-violet-400 to-violet-600" },
  464: { name: "Metal", color: "bg-gradient-to-br from-rose-400 to-rose-600" },
  169: { name: "Soul & Funk", color: "bg-gradient-to-br from-amber-400 to-amber-600" },
  153: { name: "Blues", color: "bg-gradient-to-br from-lime-400 to-lime-600" },
  95: { name: "Children's Music", color: "bg-gradient-to-br from-fuchsia-400 to-fuchsia-600" },
  197: { name: "Latino", color: "bg-gradient-to-br from-sky-400 to-sky-600" },
  75: { name: "Podcasts", color: "bg-gradient-to-br from-slate-400 to-slate-600" },
} as const;

export type GenreId = keyof typeof GENRES; 