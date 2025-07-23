export function not(a: readonly string[], b: readonly string[]) {
  return a.filter((value) => !b.includes(value))
}

export function intersection(a: readonly string[], b: readonly string[]) {
  return a.filter((value) => b.includes(value))
}

export function union(a: readonly string[], b: readonly string[]) {
  return [...a, ...not(b, a)]
}
