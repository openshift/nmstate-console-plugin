import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

/**
 * A selector for a resource's labels
 * @param entity {K8sResourceCommon} - entity to get labels from
 * @param defaultValue {{ [key: string]: string }} - default value to return if no labels are found
 * @returns {{ [key: string]: string }} the labels for the resource
 */
export const getLabels = (
  entity: K8sResourceCommon,
  defaultValue?: { [key: string]: string },
): { [key: string]: string } => entity?.metadata?.labels || defaultValue;

/**
 * function for getting an entity's label
 * @param {K8sResourceCommon} entity - entity to get label from
 * @param {string} label - name of the label to get
 * @param {string} defaultValue - default value to return if label is not found
 * @returns the label value or defaultValue if not found
 */
export const getLabel = (entity: K8sResourceCommon, label: string, defaultValue?: string): string =>
  entity?.metadata?.labels?.[label] ?? defaultValue;

/**
 *
 * @param resource k8s resource
 * @returns resource's name
 */
export const getName = <A extends K8sResourceCommon = K8sResourceCommon>(resource: A) =>
  resource?.metadata?.name;

/**
 * A selector for the resource's annotations
 * @param entity {K8sResourceCommon} - entity to get annotations from
 * @param defaultValue {{ [key: string]: string }} - default value to return if no annotations are found
 * @returns {{ [key: string]: string }} the annotations for the resource
 */
export const getAnnotations = (
  entity: K8sResourceCommon,
  defaultValue?: { [key: string]: string },
): { [key: string]: string } => entity?.metadata.annotations || defaultValue;

/**
 * function for getting an entity's annotation
 * @param entity - entity to get annotation from
 * @param annotationName - name of the annotation to get
 * @param defaultValue - default value to return if annotation is not found
 * @returns the annotation value or defaultValue if not found
 */
export const getAnnotation = (
  entity: K8sResourceCommon,
  annotationName: string,
  defaultValue?: string,
): string => entity?.metadata?.annotations?.[annotationName] ?? defaultValue;
