'use client';

import { useMemo } from 'react';
import { Country, City } from 'country-state-city';
import { FormField } from '@/components/ui/FormField';
import { Combobox } from '@/components/ui/Combobox';

interface LocationSelectorProps {
    countryCode: string;
    cityName: string;
    onCountryChange: (countryCode: string) => void;
    onCityChange: (cityName: string) => void;
    cityError?: string;
    countryError?: string;
    required?: boolean;
}

export function LocationSelector({
    countryCode,
    cityName,
    onCountryChange,
    onCityChange,
    cityError,
    countryError,
    required = false,
}: LocationSelectorProps) {
    // Get all countries
    const countries = useMemo(() => Country.getAllCountries(), []);

    // Get cities based on selected country
    const cities = useMemo(() => {
        if (!countryCode) return [];
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
            <FormField label="Country" required={required} error={countryError}>
                <Combobox
                    value={countryCode}
                    onChange={handleCountryChange}
                    options={countryOptions}
                    placeholder="Select Country"
                    searchPlaceholder="Search country..."
                    hasError={!!countryError}
                />
            </FormField>

            <FormField label="City" required={required} error={cityError}>
                <Combobox
                    value={cityName}
                    onChange={handleCityChange}
                    options={cityOptions}
                    placeholder="Select City"
                    searchPlaceholder="Search city..."
                    emptyText={countryCode ? "No cities found" : "Select a country first"}
                    disabled={!countryCode}
                    hasError={!!cityError}
                />
            </FormField>
        </div>
    );
}
