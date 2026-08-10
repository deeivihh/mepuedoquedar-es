<div align="center">
  <img src="./public/logos/banner.png" alt="Banner ¿Me puedo quedar?" style="border-radius: 32px;" width="100%" />
</div>

**¿Me puedo quedar?** es una herramienta web interactiva diseñada para evaluar y comparar la calidad de vida en los municipios de Castilla y León. Utilizando datos abiertos proporcionados por la Junta de Castilla y León, la aplicación genera una puntuación dinámica para cada municipio basada en el perfil y las preferencias únicas de cada usuario.

## Características Principales

- **Datos Abiertos Actualizados Diariamente:** Los datos se obtienen y sincronizan de manera automatizada todas las madrugadas desde la API v2.1 del portal [datosabiertos.jcyl.es](https://datosabiertos.jcyl.es).
- **Puntuación Personalizada:** Calcula un índice de habitabilidad basado en categorías clave.
- **Perfil de Usuario Dinámico:** Las puntuaciones se ajustan automáticamente según las preferencias del usuario (edad, situación laboral, hijos a cargo, etc.), modificando el peso de cada categoría.
- **Buscador de Municipios:** Encuentra rápidamente cualquier municipio de Castilla y León y descubre su puntuación detallada.
- **Metodología Transparente:** Todas las fórmulas de cálculo están documentadas y disponibles en la plataforma.

## Tecnologías Utilizadas

- **Frontend:** [Next.js](https://nextjs.org/), React 19, [TailwindCSS v4](https://tailwindcss.com/)
- **Mapas y Geometría:** `pigeon-maps`, `geolib`
- **Animaciones:** `motion`
- **Procesamiento de Datos:** `csv-parse`
- **Base de Datos:** [Supabase](https://supabase.com/)
- **Despliegue:** Cloudflare (via `@opennextjs/cloudflare`)
- **Testing:** [Vitest](https://vitest.dev/)

## Instalación y Uso Local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/deeivihh/mepuedoquedar.git
   cd mepuedoquedar
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abre tu navegador:**
   Visita `http://localhost:3000` para ver la aplicación en funcionamiento.

## Metodología de Puntuación

El sistema asigna una puntuación de 0 a 100 a cada municipio calculando la media ponderada de las diferentes categorías. Cada indicador se evalúa mediante una de las siguientes funciones:
- **Umbral:** Cumplir o no cumplir un requisito mínimo (ej. tener centro de salud).
- **Escala Logarítmica:** Valora positivamente disponer de un servicio, pero reduce el impacto de la acumulación (ej. número de bibliotecas).
- **Interpolación Lineal:** Puntuación proporcional entre un valor mínimo y uno óptimo.

Los pesos base de cada categoría se multiplican según el perfil configurado, garantizando que el resultado refleje lo que realmente le importa a cada persona.

## Contribución

Las contribuciones son bienvenidas. Si tienes ideas para mejorar la fórmula de puntuación, el diseño, o agregar nuevos datasets, siéntete libre de abrir una *issue* o enviar un *pull request*.

## Datos y Licencia

Los datos utilizados para calcular las puntuaciones son proporcionados bajo licencia abierta por el **Portal de Datos Abiertos de la Junta de Castilla y León**.