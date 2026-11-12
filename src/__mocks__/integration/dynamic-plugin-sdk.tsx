import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import NodeModel from 'src/console-models/NodeModel';
import NodeNetworkConfigurationEnactmentModel from 'src/console-models/NodeNetworkConfigurationEnactmentModel';
import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';
import { NodeNetworkStateModel } from 'src/console-models/NodeNetworkStateModel';

/**
 * Test double for the dynamic plugin SDK data layer.
 *
 * The console resolves a `groupVersionKind` to a model and issues a request to the
 * console proxy (`/api/kubernetes/...`). This double does the same, but through
 * `fetch`, so MSW owns the responses: integration tests exercise the real component
 * tree against realistic Kubernetes payloads instead of mocked hooks.
 */
type GroupVersionKind = { group?: string; version: string; kind: string };

type WatchResourceArgs = {
  groupVersionKind: GroupVersionKind;
  isList?: boolean;
  name?: string;
};

// Plural comes from the plugin's own models — the same source the SDK's model registry uses.
const PLURALS = new Map(
  [
    NodeModel,
    NodeNetworkConfigurationEnactmentModel,
    NodeNetworkConfigurationPolicyModel,
    NodeNetworkStateModel,
  ].map((model) => [`${model.apiGroup ?? ''}/${model.apiVersion}/${model.kind}`, model.plural]),
);

export const consoleApiPathFor = (
  { group = '', version, kind }: GroupVersionKind,
  name?: string,
): string => {
  const plural = PLURALS.get(`${group}/${version}/${kind}`) ?? `${kind.toLowerCase()}s`;
  return `${group ? `/apis/${group}` : '/api'}/${version}/${plural}${name ? `/${name}` : ''}`;
};

/**
 * Group, version and kind from a resource's `apiVersion` and `kind` — the same derivation the
 * SDK applies to owner references. Core resources have no group.
 */
export const getGroupVersionKindForResource = (resource?: {
  apiVersion?: string;
  kind?: string;
}): GroupVersionKind | undefined => {
  const apiVersion = resource?.apiVersion;
  const kind = resource?.kind;
  const [group, version] = apiVersion?.split('/') ?? [];
  if (!apiVersion || !kind) {
    return undefined;
  }
  return version ? { group, kind, version } : { kind, version: apiVersion };
};

export const useK8sWatchResource = <T,>({
  groupVersionKind,
  isList,
  name,
}: WatchResourceArgs): [T | undefined, boolean, Error | undefined] => {
  const path = consoleApiPathFor(groupVersionKind, name);
  // The real SDK seeds list watches with `[]` and single watches with `{}` before load,
  // so consumers never see undefined.
  const [state, setState] = useState<[T | undefined, boolean, Error | undefined]>([
    isList ? ([] as T) : ({} as T),
    false,
    undefined,
  ]);

  useEffect(() => {
    let active = true;
    const emptyData = isList ? ([] as T) : ({} as T);

    setState([emptyData, false, undefined]);
    fetch(`${window.location.origin}/api/kubernetes${path}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Console API ${response.status} for ${path}`);
        }
        return response.json();
      })
      .then((body) => {
        if (active) {
          setState([(isList ? body.items : body) as T, true, undefined]);
        }
      })
      .catch((error: Error) => {
        if (active) {
          setState([emptyData, true, error]);
        }
      });

    return () => {
      active = false;
    };
  }, [isList, path]);

  return state;
};

export const ListPageHeader = ({
  children,
  title,
}: {
  children?: React.ReactNode;
  title?: string;
}) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
);

export const ListPageBody = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;

/** Console resource URL, e.g. `/k8s/cluster/nmstate.io~v1~NodeNetworkConfigurationPolicy/br0`. */
const resourceUrl = (name: string, groupVersionKind?: GroupVersionKind): string => {
  if (!groupVersionKind) return `#${name}`;
  const group = groupVersionKind.group ? `${groupVersionKind.group}~` : '';
  return `/k8s/cluster/${group}${groupVersionKind.version}~${groupVersionKind.kind}/${name}`;
};

export const ResourceLink = ({
  groupVersionKind,
  name,
}: {
  groupVersionKind?: GroupVersionKind;
  name: string;
}) => {
  const navigate = useNavigate();
  const to = resourceUrl(name, groupVersionKind);
  return (
    <a
      href={to}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {name}
    </a>
  );
};

export const TableData = ({ children }: { children?: React.ReactNode }) => <td>{children}</td>;

export const useActiveColumns = <T,>({ columns }: { columns: T[] }): [T[]] => [columns];

export const ListPageCreateDropdown = ({
  children,
  items,
  onClick,
}: {
  children?: React.ReactNode;
  items?: Record<string, React.ReactNode>;
  onClick?: (key: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setIsOpen((open) => !open)}>
        {children}
      </button>
      {isOpen &&
        Object.entries(items ?? {}).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setIsOpen(false);
              onClick?.(key);
            }}
          >
            {label}
          </button>
        ))}
    </div>
  );
};

type RowFilterItem = { id: string; title: React.ReactNode };
type RowFilterLike = {
  filterGroupName: string;
  items?: RowFilterItem[];
  type: string;
};

/**
 * Interactive stand-in for the console toolbar filter: it renders one checkbox per
 * `rowFilters` item and reports the selection through `onFilterChange`, so tests click
 * the same control a user would instead of calling the filter hook directly.
 */
export const ListPageFilter = ({
  rowFilters = [],
  onFilterChange,
}: {
  onFilterChange?: (type: string, value: { selected: string[] }) => void;
  rowFilters?: RowFilterLike[];
}) => {
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  const toggle = (type: string, id: string) => {
    const current = selected[type] ?? [];
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    setSelected((previous) => ({ ...previous, [type]: next }));
    onFilterChange?.(type, { selected: next });
  };

  return (
    <fieldset data-test="list-page-filter">
      <legend>Filter</legend>
      {rowFilters.map((rowFilter) => (
        <fieldset key={rowFilter.type}>
          <legend>{rowFilter.filterGroupName}</legend>
          {(rowFilter.items ?? []).map((item) => (
            <label key={item.id}>
              <input
                checked={(selected[rowFilter.type] ?? []).includes(item.id)}
                onChange={() => toggle(rowFilter.type, item.id)}
                type="checkbox"
              />
              {item.title}
            </label>
          ))}
        </fieldset>
      ))}
    </fieldset>
  );
};

export const useListPageFilter = <T,>(
  data: T[],
  rowFilters: { filter: (value: { selected: string[] }, obj: T) => boolean; type: string }[] = [],
): [T[], T[], (type: string, value: { selected: string[] }) => void] => {
  const [selected, setSelected] = useState<Record<string, { selected: string[] }>>({});
  const filtered = data.filter((obj) =>
    rowFilters.every(
      (rowFilter) => !selected[rowFilter.type] || rowFilter.filter(selected[rowFilter.type], obj),
    ),
  );

  return [data, filtered, (type, value) => setSelected((prev) => ({ ...prev, [type]: value }))];
};

export const VirtualizedTable = <T,>({
  NoDataEmptyMsg,
  Row,
  data = [],
  loaded,
  rowData,
}: {
  NoDataEmptyMsg?: React.ComponentType;
  Row: React.ComponentType<{
    activeColumnIDs: Set<string>;
    index: number;
    obj: T;
    rowData: unknown;
  }>;
  data?: T[];
  loaded: boolean;
  rowData?: unknown;
}) => {
  if (!loaded) return null;
  if (!data.length) return NoDataEmptyMsg ? <NoDataEmptyMsg /> : null;

  return (
    <table>
      <tbody>
        {data.map((obj, index) => (
          <tr key={index}>
            <Row activeColumnIDs={new Set<string>()} index={index} obj={obj} rowData={rowData} />
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Tests can flip the RBAC outcome without re-mocking the whole SDK module.
let accessReview: [boolean, boolean] = [true, false];
export const setAccessReview = (value: [boolean, boolean]): void => {
  accessReview = value;
};
export const useAccessReview = (): [boolean, boolean] => accessReview;

type K8sModel = { apiGroup?: string; apiVersion: string; plural: string };

const consoleUrlFor = (model: K8sModel): string =>
  `${window.location.origin}/api/kubernetes${model.apiGroup ? `/apis/${model.apiGroup}` : '/api'}/${model.apiVersion}/${model.plural}`;

const request = async (method: string, url: string, data?: unknown) => {
  const response = await fetch(url, {
    body: data === undefined ? undefined : JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    method,
  });
  if (!response.ok) {
    throw new Error(`Console API ${response.status} for ${method} ${url}`);
  }
  return response.json();
};

const withQuery = (url: string, queryParams?: Record<string, string>) =>
  queryParams ? `${url}?${new URLSearchParams(queryParams).toString()}` : url;

export const k8sCreate = async ({
  model,
  data,
  queryParams,
}: {
  data: unknown;
  model: K8sModel;
  queryParams?: Record<string, string>;
}) => request('POST', withQuery(consoleUrlFor(model), queryParams), data);

export const k8sUpdate = async ({
  model,
  data,
  name,
}: {
  data: unknown;
  model: K8sModel;
  name?: string;
}) =>
  request(
    'PUT',
    `${consoleUrlFor(model)}/${name ?? (data as { metadata: { name: string } }).metadata.name}`,
    data,
  );

export const k8sDelete = async ({
  model,
  name,
}: {
  model: K8sModel;
  name?: string;
  resource?: unknown;
}) => request('DELETE', `${consoleUrlFor(model)}/${name}`);

type WatchK8sResult = { data: unknown; loaded: boolean; loadError: Error | undefined };

export const useK8sWatchResources = (
  resources: Record<string, WatchResourceArgs>,
): Record<string, WatchK8sResult> => {
  const key = Object.keys(resources).join('|');
  const [state, setState] = useState<Record<string, WatchK8sResult>>({});

  useEffect(() => {
    let active = true;
    const entries = Object.entries(resources);
    setState(
      Object.fromEntries(
        entries.map(([id, args]) => [
          id,
          { data: args.isList ? [] : {}, loadError: undefined, loaded: false },
        ]),
      ),
    );

    Promise.all(
      entries.map(async ([id, args]) => {
        const path = consoleApiPathFor(args.groupVersionKind, args.name);
        const response = await fetch(`${window.location.origin}/api/kubernetes${path}`);
        if (!response.ok) {
          throw new Error(`Console API ${response.status} for ${path}`);
        }
        const body = await response.json();
        return [id, (args.isList ? body.items : body) as unknown] as const;
      }),
    )
      .then((results) => {
        if (active) {
          setState(
            Object.fromEntries(
              results.map(([id, data]) => [id, { data, loadError: undefined, loaded: true }]),
            ),
          );
        }
      })
      .catch((error: Error) => {
        if (active) {
          setState((prev) =>
            Object.fromEntries(
              Object.keys(prev).map((id) => [
                id,
                { data: prev[id].data, loadError: error, loaded: true },
              ]),
            ),
          );
        }
      });

    return () => {
      active = false;
    };
    // `resources` is a stable literal per render in every caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
};

export const ResourceIcon = () => <span aria-hidden="true" />;

/** Monaco-backed in the console; a textarea keeps the editor contract testable in jsdom. */
export const YAMLEditor = React.forwardRef<
  HTMLTextAreaElement,
  { onChange?: (value: string) => void; value?: string }
>(({ onChange, value }, ref) => (
  <textarea
    data-testid="yaml-editor"
    onChange={(event) => onChange?.(event.target.value)}
    ref={ref}
    value={value}
  />
));

export const Timestamp = ({ timestamp }: { timestamp?: string }) => <span>{timestamp}</span>;

export const useLabelsModal = () => () => undefined;

export const useAnnotationsModal = () => () => undefined;

export const RedExclamationCircleIcon = () => <span aria-hidden="true" />;
