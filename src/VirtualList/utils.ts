export enum CompareResult {
  eq,
  lt,
  gt,
}

export function binarySearch<T, K>(
  list: T[],
  value: K,
  compare: (current: T, value: K) => CompareResult
) {
  let l = 0;
  let r = list.length;
  while (l < r) {
    const mid = (l + r) >> 1;
    const cmpResult = compare(list[mid], value);
    switch (cmpResult) {
      case CompareResult.eq:
        return mid;
      case CompareResult.gt:
        r = mid - 1;
        break;
      case CompareResult.lt:
        l = mid + 1;
    }
  }
  return l;
}
