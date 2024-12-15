
export const getPrice = (prices: any, syntPythId: string) => {
  if (syntPythId === '') {
    return 'no data'
  }
  if (!prices?.tokenPrices) {
    return "loading..."
  }
  if (!prices?.tokenPrices.dataParsed) {
    return "loading..."
  }
  if (prices.tokenPrices.dataParsed.length === 0) {
    return "loading..."
  }
  if (!prices.tokenPrices.dataParsed.filter((e: any) => e.priceId === syntPythId)[0]) {
    return "loading..."
  }
  const decimal = 0 - prices.tokenPrices.dataParsed.filter((e: any) => e.priceId === syntPythId)[0].expo
  return Number(prices.tokenPrices.dataParsed.filter((e: any) => e.priceId === syntPythId)[0].price / (10 ** decimal)).toFixed(2)
}

export const getPriceRaw = (prices: any, syntPythId: string) => {
  if (syntPythId === '') {
    return 0
  }
  if (!prices?.tokenPrices) {
    return 0
  }
  if (!prices?.tokenPrices.dataParsed) {
    return 0
  }
  if (prices.tokenPrices.dataParsed.length === 0) {
    return 0
  }
  if (!prices.tokenPrices.dataParsed.filter((e: any) => e.priceId === syntPythId)[0]) {
    return 0
  }

  const decimal = 0 - prices.tokenPrices.dataParsed.filter((e: any) => e.priceId === syntPythId)[0].expo
  return Number(prices.tokenPrices.dataParsed.filter((e: any) => e.priceId === syntPythId)[0].price / (10 ** decimal))
}
