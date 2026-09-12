import { NextResponse } from "next/server";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

export async function GET(
  request: Request,
  context: {
    params: Promise<{ iso: string }>;
  }
) {
  try {
    const { iso } = await context.params;

    if (!iso) {
      return NextResponse.json(
        {
          error: "Country ISO is required",
          type: "FeatureCollection",
          features: [],
        },
        { status: 400 }
      );
    }

    const iso2 = iso.trim().toUpperCase();

    const iso3 = countries.alpha2ToAlpha3(iso2);

    if (!iso3) {
      return NextResponse.json(
        {
          error: `Unsupported country ISO: ${iso2}`,
          type: "FeatureCollection",
          features: [],
        },
        { status: 400 }
      );
    }

    console.log(`[boundaries] Fetching ADM1 for ${iso2} (${iso3})`);

    const metadataUrl =
      `https://www.geoboundaries.org/api/current/gbOpen/` +
      `${iso3}/ADM1/`;

    const metadataResponse = await fetch(metadataUrl, {
      next: { revalidate: 86400 },
    });

    if (!metadataResponse.ok) {
      throw new Error(
        `GeoBoundaries metadata request failed: ` +
          `${metadataResponse.status} ${metadataResponse.statusText}`
      );
    }

    const metadata = await metadataResponse.json();

    const geoJsonUrls = [
      metadata.simplifiedGeometryGeoJSON,
      metadata.gjDownloadURL,
    ].filter(Boolean);

    if (geoJsonUrls.length === 0) {
      throw new Error(
        "GeoBoundaries response did not contain a GeoJSON URL"
      );
    }

    let data: any = null;
    let lastError: unknown = null;

    for (const url of geoJsonUrls) {
      try {
        console.log("[boundaries] Trying GeoJSON:", url);

        const response = await fetch(url, {
          next: { revalidate: 86400 },
        });

        console.log(
          "[boundaries] Response:",
          response.status,
          response.statusText
        );

        if (!response.ok) {
          throw new Error(
            `GeoJSON request failed: ` +
              `${response.status} ${response.statusText}`
          );
        }

        data = await response.json();

        break;
      } catch (error) {
        lastError = error;

        console.error(
          "[boundaries] GeoJSON fetch failed:",
          error
        );
      }
    }

    if (!data) {
      throw lastError instanceof Error
        ? lastError
        : new Error("Failed to fetch GeoJSON");
    }

    if (
      data?.type !== "FeatureCollection" ||
      !Array.isArray(data?.features)
    ) {
      throw new Error("GeoBoundaries returned invalid GeoJSON");
    }

    const features = data.features.map((feature: any) => {
      const properties = feature.properties ?? {};

      const name =
        properties.shapeName ??
        properties.name ??
        properties.NAME_1 ??
        properties.NAME ??
        "Unknown region";

      const regionId =
        properties.shapeISO ??
        properties.shapeID ??
        properties.gid ??
        feature.id ??
        name;

      return {
        ...feature,
        properties: {
          ...properties,
          region_id: String(regionId),
          region_name: String(name),
          name: String(name),
        },
      };
    });

    console.log(
      `[boundaries] ${iso2}: ${features.length} ADM1 regions`
    );

    return NextResponse.json({
      type: "FeatureCollection",
      features,
    });
  } catch (error) {
    console.error("[boundaries] Failed:", error);

    return NextResponse.json(
      {
        type: "FeatureCollection",
        features: [],
        error:
          error instanceof Error
            ? error.message
            : "Unknown boundary error",
      },
      { status: 500 }
    );
  }
}