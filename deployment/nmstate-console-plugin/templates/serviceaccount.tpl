apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ .Values.plugin }}
  namespace: {{ .Values.namespace }}
  labels:
    app: {{ .Values.plugin }}
    app.kubernetes.io/component: {{ .Values.plugin }}
    app.kubernetes.io/instance: {{ .Values.plugin }}
    app.kubernetes.io/part-of: {{ .Values.plugin }}
