"use client";

import { useState } from "react";
import styles from "@/styles/components.module.scss";

const STREMIO_ID = "stremio";
const PROVIDER_SHIMMER_COUNT = 5;

export default function DetailWatchProviders({ providers, isLoading = false }) {
  const [activeId, setActiveId] = useState(null);
  const hasProviders = Array.isArray(providers) && providers.length > 0;

  const handleProviderActivate = (id) => {
    setActiveId((current) => (current === id ? null : id));
  };

  const handleKeyDown = (event, id) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleProviderActivate(id);
    }
  };

  return (
    <section
      className={styles.detailModalWatchSection}
      aria-label="Dónde ver"
      aria-busy={isLoading}
    >
      <h3 className={styles.detailModalWatchTitle}>DONDE VER</h3>
      <ul
        className={`${styles.detailModalProviders} ${isLoading ? styles.detailModalProvidersLoading : ""}`.trim()}
      >
        {isLoading ? (
          Array.from({ length: PROVIDER_SHIMMER_COUNT }, (_, index) => (
            <li key={`provider-shimmer-${index}`}>
              <div
                className={styles.detailModalProviderShimmer}
                aria-hidden="true"
              />
            </li>
          ))
        ) : hasProviders ? (
          providers.map((provider) => (
            <li key={provider.providerId}>
              <div
                className={styles.detailModalProviderItem}
                role="button"
                tabIndex={0}
                aria-label={provider.providerName}
                data-active={activeId === provider.providerId}
                onClick={() => handleProviderActivate(provider.providerId)}
                onKeyDown={(event) =>
                  handleKeyDown(event, provider.providerId)
                }
              >
                {provider.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={provider.logoUrl}
                    alt=""
                    width={36}
                    height={36}
                    className={styles.detailModalProviderLogo}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span
                    className={styles.detailModalProviderLogoFallback}
                    aria-hidden="true"
                  >
                    {provider.providerName.slice(0, 1)}
                  </span>
                )}
                <span className={styles.detailModalProviderName}>
                  {provider.providerName}
                </span>
              </div>
            </li>
          ))
        ) : (
          <li>
            <div
              className={styles.detailModalProviderItem}
              role="button"
              tabIndex={0}
              aria-label="Ver en Stremio"
              data-active={activeId === STREMIO_ID}
              onClick={() => handleProviderActivate(STREMIO_ID)}
              onKeyDown={(event) => handleKeyDown(event, STREMIO_ID)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/stremio.png"
                alt=""
                width={36}
                height={36}
                className={styles.detailModalProviderLogo}
                loading="lazy"
                decoding="async"
              />
              <span className={styles.detailModalProviderName}>Stremio</span>
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}
