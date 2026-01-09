'use client';

import { useMemo } from 'react';
import { Country, City } from 'country-state-city';
import { FormField } from '@/components/ui/FormField';
import { Combobox } from '@/components/ui/Combobox';

import { ALLOWED_COUNTRIES, POPULAR_CITIES } from '@/lib/location-data';

interface LocationSelectorProps {
    countryCode: string;
    cityName: string;
    onCountryChange: (countryCode: string) => void;
    onCityChange: (cityName: string) => void;
    cityError?: string;
    countryError?: string;
    required?: boolean;
}

import { useTranslations } from 'next-intl';

export function LocationSelector({
    countryCode,
    cityName,
    onCountryChange,
    onCityChange,
    cityError,
    countryError,
    required = false,
}: LocationSelectorProps) {
    const t = useTranslations('Forms');
    // Get allowed countries
    const countries = useMemo(() => {
        const allCountries = Country.getAllCountries();
        return allCountries.filter(c => ALLOWED_COUNTRIES.includes(c.isoCode));
    }, []);

    // Get cities based on selected country
    const cities = useMemo(() => {
        if (!countryCode) return [];

        // Check for popular cities first
        if (POPULAR_CITIES[countryCode]) {
            return POPULAR_CITIES[countryCode].map(name => ({ name }));
        }

        // Fallback to all cities if no popular list exists
        return City.getCitiesOfCountry(countryCode) || [];
    }, [countryCode]);

    // Handle country change
    const handleCountryChange = (value: string) => {
        onCountryChange(value);
        // Reset city when country changes
        onCityChange('');
    };

    // Handle city change
    const handleCityChange = (value: string) => {
        onCityChange(value);
    };

    const countryOptions = useMemo(() =>
        countries.map(c => ({ value: c.isoCode, label: c.name })),
        [countries]);

    const cityOptions = useMemo(() =>
        cities.map(c => ({ value: c.name, label: c.name })),
        [cities]);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <FormField label={t('countryLabel')} required={required} error={countryError}>
                <Combobox
                    value={countryCode}
                    onChange={handleCountryChange}
                    options={countryOptions}
                    placeholder={t('selectCountry')}
                    searchPlaceholder="Search country..."
                    hasError={!!countryError}
                />
            </FormField>

            <FormField label={t('cityLabel')} required={required} error={cityError}>
                <Combobox
                    value={cityName}
                    onChange={handleCityChange}
                    options={cityOptions}
                    placeholder={t('selectCity')}
                    searchPlaceholder={t('searchCity')}
                    emptyText={countryCode ? t('noCitiesFound') : "Select a country first"}
                    disabled={!countryCode}
                    hasError={!!cityError}
                    allowCustomValue={true}
                />
            </FormField>
        </div>
    );
}
