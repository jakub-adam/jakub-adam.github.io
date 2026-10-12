/* Sorting algorithms written as generators.
   Each "yield" hands back one animation frame, so the visualizer can run the algorithm
   one step at a time without any threads. */

const frame = (a, s, hl = []) => ({ a: a.slice(), hl, cmp: s.cmp, swp: s.swp });
const swap = (a, i, j, s) => { [a[i], a[j]] = [a[j], a[i]]; s.swp++; };

function* bubble(a, s) {
  for (let i = 0; i < a.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < a.length - 1 - i; j++) {
      s.cmp++;
      if (a[j] > a[j + 1]) { swap(a, j, j + 1, s); swapped = true; }
      yield frame(a, s, [j, j + 1]);
    }
    if (!swapped) return;
  }
}

function* insertion(a, s) {
  for (let i = 1; i < a.length; i++) {
    for (let j = i; j > 0; j--) {
      s.cmp++;
      yield frame(a, s, [j - 1, j]);
      if (a[j - 1] <= a[j]) break;
      swap(a, j - 1, j, s);
    }
  }
}

function* selection(a, s) {
  for (let i = 0; i < a.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      s.cmp++;
      if (a[j] < a[min]) min = j;
      yield frame(a, s, [min, j]);
    }
    if (min !== i) { swap(a, i, min, s); yield frame(a, s, [i, min]); }
  }
}

function* quick(a, s) {
  function* sort(lo, hi) {
    if (lo >= hi) return;
    const pivot = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      s.cmp++;
      if (a[j] < pivot) { swap(a, i, j, s); i++; }
      yield frame(a, s, [j, hi]);
    }
    swap(a, i, hi, s);
    yield frame(a, s, [i]);
    yield* sort(lo, i - 1);
    yield* sort(i + 1, hi);
  }
  yield* sort(0, a.length - 1);
}

function* merge(a, s) {
  function* sort(lo, hi) {
    if (hi - lo < 2) return;
    const mid = (lo + hi) >> 1;
    yield* sort(lo, mid);
    yield* sort(mid, hi);
    const left = a.slice(lo, mid), right = a.slice(mid, hi);
    let i = 0, j = 0, k = lo;
    while (i < left.length || j < right.length) {
      if (j >= right.length || (i < left.length && (s.cmp++, left[i] <= right[j]))) a[k] = left[i++];
      else a[k] = right[j++];
      s.swp++;
      yield frame(a, s, [k++]);
    }
  }
  yield* sort(0, a.length);
}

function* heap(a, s) {
  function* siftDown(i, end) {
    while (true) {
      let big = i;
      const l = 2 * i + 1, r = l + 1;
      if (l < end) { s.cmp++; if (a[l] > a[big]) big = l; }
      if (r < end) { s.cmp++; if (a[r] > a[big]) big = r; }
      if (big === i) return;
      swap(a, i, big, s);
      yield frame(a, s, [i, big]);
      i = big;
    }
  }
  for (let i = (a.length >> 1) - 1; i >= 0; i--) yield* siftDown(i, a.length);
  for (let end = a.length - 1; end > 0; end--) {
    swap(a, 0, end, s);
    yield frame(a, s, [0, end]);
    yield* siftDown(0, end);
  }
}

export const ALGORITHMS = {
  'Bubble sort': { run: bubble, big: 'O(n²)' },
  'Insertion sort': { run: insertion, big: 'O(n²)' },
  'Selection sort': { run: selection, big: 'O(n²)' },
  'Quick sort': { run: quick, big: 'O(n log n)' },
  'Merge sort': { run: merge, big: 'O(n log n)' },
  'Heap sort': { run: heap, big: 'O(n log n)' },
};

/* The numbers 1..n in random order (Fisher-Yates shuffle) */
export function makeArray(n) {
  const a = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
