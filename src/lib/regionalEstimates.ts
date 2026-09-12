import type { Region } from "@/types/regions";

interface NationalIndicators {
    population: number | null;
    gdp: number | null;
    gdpPerCapita: number | null;
    lifeExpectancy: number | null;
    year?: number;
}

interface RegionInput {
    id: string;
    name: string;
}

interface RegionalEstimate extends Region { }

function hashString(value: string): number {
    let hash = 0;

    for (let i = 0; i < value.length; i++) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }

    return Math.abs(hash);
}

/**
 * Generates deterministic pseudo-regional weights.
 *
 * We deliberately use the region name so the same region always
 * receives the same estimate between requests.
 */
function generateWeights(
    regions: RegionInput[]
): Map<string, number> {
    const rawWeights = regions.map((region) => {
        const hash = hashString(region.id + region.name);

        // Produces values roughly between 0.7 and 1.3.
        const weight = 0.7 + (hash % 600) / 1000;

        return {
            id: region.id,
            weight,
        };
    });

    const total = rawWeights.reduce(
        (sum, item) => sum + item.weight,
        0
    );

    return new Map(
        rawWeights.map((item) => [
            item.id,
            item.weight / total,
        ])
    );
}


/**
 * Generate approximate ADM1 statistics from national statistics.
 *
 * This is NOT official regional data.
 * It is intended for visualization/demo purposes.
 */
export function estimateRegionalIndicators(
    regions: RegionInput[],
    national: NationalIndicators
): Record<string, Region> {
    if (regions.length === 0) {
        return {};
    }

    const populationWeights =
        generateWeights(regions);

    const result: Record<string, Region> = {};

    for (const region of regions) {
        const populationWeight = populationWeights.get(region.id) ?? 1 / regions.length;

        /**
         * Population
         *
         * The weights sum to 1, so regional populations sum
         * exactly to the national population.
         */
        const population =
            national.population != null
                ? Math.round(
                    national.population *
                    populationWeight
                )
                : null;


        const gdp =
            national.gdp != null
                ? national.gdp
                : null;

        /**
         * Calculate regional GDP/capita from the estimated
         * regional GDP and population.
         */
        let gdpPerCapita: number | null = null;

        if (
            gdp != null &&
            population != null &&
            population > 0
        ) {
            gdpPerCapita = gdp / population;
        }

        /**
         * Life expectancy.
         *
         * Since we don't have actual ADM1 life expectancy,
         * vary the national number by a small amount.
         *
         * Example:
         * India = 72.2
         *
         * Region might become:
         * 70.8
         * 72.9
         * 73.4
         */
        let lifeExpectancy: number | null = null;

        if (national.lifeExpectancy != null) {
            const hash =
                hashString(region.id + "-life");

            const variation =
                ((hash % 500) / 100) - 2.5;

            lifeExpectancy = Math.max(
                40,
                Math.min(
                    90,
                    national.lifeExpectancy + variation
                )
            );
        }

        result[region.id] = {
            id: region.id,
            name: region.name,

            population,

            gdp,

            gdpPerCapita,

            lifeExpectancy,

            year: national.year,

            subregions: [],
        };
    }

    return result;
}