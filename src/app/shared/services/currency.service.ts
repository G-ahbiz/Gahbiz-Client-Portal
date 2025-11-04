import { Injectable } from '@angular/core';
import { CurrencyInfo } from '@shared/interfaces/currency-info';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private readonly currencies: Map<string, CurrencyInfo> = new Map([
    ['USD', { code: 'USD', symbol: '$', name: 'US Dollar', unicode: '$' }],
    ['EUR', { code: 'EUR', symbol: '€', name: 'Euro', unicode: '€' }],
    ['AUD', { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', unicode: 'A$' }],
    ['GBP', { code: 'GBP', symbol: '£', name: 'British Pound', unicode: '£' }],
    ['NZD', { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', unicode: 'NZ$' }],
    ['CAD', { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', unicode: 'C$' }],
    ['BRL', { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', unicode: 'R$' }],
    ['SAR', { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal', unicode: '﷼' }],
    ['AED', { code: 'AED', symbol: 'AED', name: 'UAE Dirham', unicode: 'د.إ' }],
    ['QAR', { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal', unicode: '﷼' }],
    ['EGP', { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', unicode: 'ج.م' }],
    ['None', { code: 'None', symbol: '', name: 'No Currency', unicode: '' }],
  ]);

  getCurrencyInfo(currencyCode: string): CurrencyInfo {
    const normalizedCode = currencyCode?.toUpperCase() || 'USD';
    return this.currencies.get(normalizedCode) || this.currencies.get('USD')!;
  }

  getCurrencySymbol(currencyCode: string): string {
    return this.getCurrencyInfo(currencyCode).symbol;
  }

  getCurrencyUnicode(currencyCode: string): string {
    return this.getCurrencyInfo(currencyCode).unicode || this.getCurrencySymbol(currencyCode);
  }

  getAllCurrencies(): CurrencyInfo[] {
    return Array.from(this.currencies.values());
  }

  isValidCurrency(currencyCode: string): boolean {
    return this.currencies.has(currencyCode?.toUpperCase());
  }
}
