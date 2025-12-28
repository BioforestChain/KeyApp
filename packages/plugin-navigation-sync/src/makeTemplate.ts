import type { Route } from "./RouteLike";

export function pathToUrl(path: string) {
  return new URL(path, "file://");
}

export function urlSearchParamsToMap(urlSearchParams: URLSearchParams) {
  const map: Record<string, string> = {};

  urlSearchParams.forEach((value, key) => {
    map[key] = value;
  });

  return map;
}

function appendTrailingSlashInPathname(pathname: string) {
  if (pathname.endsWith("/")) {
    return pathname;
  }
  return `${pathname}/`;
}

function prependQuestionMarkInSearchParams(searchParams: URLSearchParams) {
  const searchParamsStr = searchParams.toString();

  if (searchParamsStr.length > 0) {
    return `?${searchParams}`;
  }
  return searchParams;
}

/**
 * import { UrlPatternOptions } from "url-pattern"
 */
export interface UrlPatternOptions {
  escapeChar?: string;
  segmentNameStartChar?: string;
  segmentValueCharset?: string;
  segmentNameCharset?: string;
  optionalSegmentStartChar?: string;
  optionalSegmentEndChar?: string;
  wildcardChar?: string;
}

export function makeTemplate<T>(
  { path, decode }: Route<T>,
  _urlPatternOptions?: UrlPatternOptions,
) {
  const onlyAsterisk = path === "*" || path === "/*";

  const paramNames = onlyAsterisk
    ? []
    : Array.from(path.matchAll(/:([A-Za-z0-9_]+)/g)).map((m) => m[1]!).filter(Boolean);

  const uniqueParamNames = Array.from(new Set(paramNames));

  const variableCount = onlyAsterisk ? Number.POSITIVE_INFINITY : uniqueParamNames.length;

  const patternPathname = onlyAsterisk ? "*" : appendTrailingSlashInPathname(path);
  const urlPattern = onlyAsterisk
    ? null
    : new URLPattern({
        pathname: patternPathname,
      });

  return {
    fill(params: { [key: string]: string | undefined }) {
      if (onlyAsterisk) {
        const searchParams = new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            if (!value) return acc;
            return { ...acc, [key]: value };
          }, {} as Record<string, string>),
        );
        return appendTrailingSlashInPathname("/") + prependQuestionMarkInSearchParams(searchParams);
      }

      let pathname = path;
      for (const name of uniqueParamNames) {
        const value = params[name];
        if (value === undefined) {
          throw new Error(`Missing route param: ${name}`);
        }
        pathname = pathname.replace(`:${name}`, encodeURIComponent(value));
      }
      pathname = appendTrailingSlashInPathname(pathname);

      const searchParamsMap = { ...params };

      uniqueParamNames.forEach((key) => {
        delete searchParamsMap[key];
      });

      const searchParams = new URLSearchParams(
        Object.entries(searchParamsMap).reduce(
          (acc, [key, value]) => ({
            ...acc,
            ...(value
              ? {
                  [key]: value,
                }
              : null),
          }),
          {} as Record<string, string>,
        ),
      );

      return (
        pathname + prependQuestionMarkInSearchParams(searchParams)
      );
    },
    parse<T extends { [key: string]: string | undefined }>(
      path: string,
    ): T | null {
      const url = pathToUrl(path);
      if (onlyAsterisk) {
        const searchParams = urlSearchParamsToMap(url.searchParams);
        const params = {
          ...searchParams,
        };
        return decode ? decode(params) : (params as T);
      }

      if (!urlPattern) return null;

      const pathname = appendTrailingSlashInPathname(url.pathname);
      const match = urlPattern.exec({ pathname });
      const searchParams = urlSearchParamsToMap(url.searchParams);

      if (!match) {
        return null;
      }

      const pathParams = match.pathname.groups as Record<string, string | undefined>;

      const params = {
        ...searchParams,
        ...pathParams,
      };

      return decode ? decode(params) : params;
    },
    variableCount,
  };
}
