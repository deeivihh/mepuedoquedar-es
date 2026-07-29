# ¿Me puedo quedar?

## Motor de Sincronización de Datos (API)

Este proyecto utiliza un motor avanzado de cruce de datos que puedes encontrar en `src/app/api/sync/sanidad/route.ts`. Su objetivo es conectarse a los datos abiertos de la Junta de Castilla y León, descargar distintos datasets (archivos de datos), cruzarlos, y agruparlos automáticamente por municipio.

### 1. Definición de Datasets (`datasets`)
En la configuración, lo primero que haces es decirle al motor qué datos quieres descargar:

```typescript
datasets: {
  ocupacionCamasHospitales: {
    id: "ocupacion-de-camas-en-hospitales", // Nombre del dataset en el portal de datos
    where: `fecha >= date'2026-06-29'`, // Opcional: Filtro SQL para no descargar todo
  }
}
```

### 2. Creación de Indicadores (`indicators`)
Una vez descargados los datos, creas **indicadores** que son los resultados matemáticos que quieres obtener por cada municipio. 

```typescript
camasHospitales: {
  dataset: "ocupacionCamasHospitales", // De qué dataset salen los datos
  operation: "sum",                    // Operación matemática: "sum", "count", "average"
  fields: ["camas_ocupadas_planta"],   // Qué columnas sumar
  
  // OPCIONES AVANZADAS:
  // 1. Cruzar datos (Join)
  // Si el dataset no tiene el municipio directamente, usamos joinVia para cruzarlo
  // usando un dataset puente (ej. centrosSanitarios).
  joinVia: {
    dataset: "centrosSanitarios",
    municipality: "localidad",
    localKey: "nombre_del_centro",
    foreignKey: "hospital",
  },
  
  // 2. Dependencias (Requires)
  // Si no hay hospitales en el municipio, no mostramos este indicador para ahorrar peso.
  requires: "hospitales",
  
  // 3. Quedarse solo con lo último (Latest)
  // Para capacidades (camas), agrupa por hospital y coge solo la fila con la fecha más nueva.
  latestGroupBy: "hospital",
  latestBy: "fecha",
  
  // 4. Mostrar la fecha del dato
  // Incluye automáticamente la fecha (o rango de fechas) de los datos que ha sumado.
  dateField: "fecha",
}
```

### 3. Filtros Personalizados
Si un dataset tiene datos "basura" (por ejemplo, hospitales que reportan 0 camas por error de servidor), puedes añadir un `filter` en el indicador para limpiarlos en memoria antes de hacer la matemática:

```typescript
filter: (row: any) => Number(row.camas_habilitadas_planta) > 0,
```