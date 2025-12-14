export interface ExchangeRates {
    [key: string]: number;
}

export const exchangeRateService = {
    async getRates(baseCurrency: string = 'usd'): Promise<ExchangeRates> {
        try {
            // CoinGecko API free tier
            // Fetching simple price for common currencies against USD (or base)
            // Note: CoinGecko free API has rate limits.
            // Using 'simple/price' endpoint.
            // IDs: bitcoin, ethereum, tether, usd, eur, brl, gbp

            const ids = 'bitcoin,ethereum,tether,usd,eur,brl,gbp';
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${baseCurrency}`);

            if (!response.ok) {
                console.error('Failed to fetch rates', response.statusText);
                return {};
            }

            const data = await response.json();

            // Transform data: { "bitcoin": { "usd": 95000 }, ... } -> { "BTC": 95000, ... }
            // Mapping CoinGecko IDs to our symbols
            const rates: ExchangeRates = {};

            if (data.bitcoin) rates['BTC'] = data.bitcoin[baseCurrency];
            if (data.ethereum) rates['ETH'] = data.ethereum[baseCurrency];
            if (data.tether) rates['USDT'] = data.tether[baseCurrency];
            if (data.usd) rates['USD'] = data.usd[baseCurrency];
            if (data.eur) rates['EUR'] = data.eur[baseCurrency];
            if (data.brl) rates['BRL'] = data.brl[baseCurrency];
            if (data.gbp) rates['GBP'] = data.gbp[baseCurrency];

            return rates;
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            return {};
        }
    }
};
