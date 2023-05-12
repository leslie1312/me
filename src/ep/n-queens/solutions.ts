export function nQueens$1(n = 8) {
  const results: number[][] = []
  const rows: number[] = Array(n)
  const cols: boolean[] = Array(n)
  const deg1: boolean[] = Array(n * 2)
  const deg2: boolean[] = Array(n * 2)
  backtrack()
  return results

  function backtrack(row = 0) {
    if (row == n) {
      results.push(rows.slice())
      return
    }
    for (let col = 0; col < n; col++) {
      if (cols[col] || deg1[row + col] || deg2[row - col + n]) {
        continue
      }
      rows[row] = col
      cols[col] = true
      deg1[row + col] = true
      deg2[row - col + n] = true
      backtrack(row + 1)
      cols[col] = false
      deg1[row + col] = false
      deg2[row - col + n] = false
    }
  }
}

export function nQueens$2(n = 8) {
  const results: number[][] = []
  const rows: number[] = Array(n)
  const cols: boolean[] = Array(n)
  const deg1: boolean[] = Array(n * 2)
  const deg2: boolean[] = Array(n * 2)
  const isEven = n % 2 === 0
  const middle = isEven ? n / 2 : (n + 1) / 2
  backtrack()
  return JSON.stringify(results.concat(getOtherHalfResults()))

  function backtrack(row = 0) {
    if (row == n) {
      results.push(rows.slice())
      return
    }
    for (let col = 0; col < n; col++) {
      if (row === 0 && col >= middle) {
        return
      }
      if (cols[col] || deg1[row + col] || deg2[row - col + n]) {
        continue
      }
      rows[row] = col
      cols[col] = true
      deg1[row + col] = true
      deg2[row - col + n] = true
      backtrack(row + 1)
      cols[col] = false
      deg1[row + col] = false
      deg2[row - col + n] = false
    }
  }

  function getOtherHalfResults() {
    let source = results
    let _n = n - 1
    if (!isEven) {
      const limit = _n / 2
      source = results.filter(item => item[0] < limit)
    }
    return source.map(item => item.map(i => _n - i)).reverse()
  }
}
