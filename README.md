<div align="center">
  <img src="./public/logos/banner.png" alt="Banner ¿Me puedo quedar?" width="100%" />
</div>

**¿Y si me voy a vivir a Castilla y León?** Es una idea que muchos se plantean, pero descubrir si realmente es viable para cada persona suele ser complicado. La información necesaria existe, pero está repartida entre la web de la Junta, el INE y decenas de portales oficiales. Cada fuente usa un formato distinto. Los nombres de los municipios varían. Y muchos datos solo cubren parte del territorio. El resultado es que quien plantea mudarse termina decidiendo sin información.

**¿Me puedo quedar?** es la respuesta a ese muro. Una web que analiza los **2.248 municipios de Castilla y León** y da a cada persona una puntuacion según su situación, para que pueda decidir si merece la pena mudarse con datos que se ajustan a su vida y no a la de otro. Si hay hijos, pesa más que haya un colegio. Si se teletrabaja, pesa menos el empleo local. Si no se tiene coche, pesa más el comercio del municipio. **Cada persona ve una puntuación distinta, porque cada vida es distinta.**

Usar la web es tan simple como buscar un municipio. Aparece una ficha clara, con un mapa y toda la información ordenada en secciones fáciles de reconocer. La puntuación se entiende de un vistazo y, si alguien quiere conocer el detalle de cada departamento, basta con desplegarlo. Funciona igual de bien en el móvil que en el ordenador, con textos claros y un diseño limpio que cualquier persona puede usar sin instrucciones. Y cuando a un municipio le falta algún dato, algo muy común en lugares pequeños, la web simplemente oculta esa parte, sin errores ni páginas a medias. **Nadie necesita saber nada de datos abiertos para usarla. Eso es precisamente el punto.**

Detrás de esa sencillez hay un trabajo enorme de recolección. La base son los datos abiertos de la Junta de Castilla y León, de donde salen más de una docena de conjuntos: policía local, colegios, centros de formación profesional, hospitales, centros de salud, oficinas de empleo, cooperativas, comercios, establecimientos turísticos, monumentos, museos, teatros, bibliotecas, asociaciones juveniles, clubes deportivos, servicios sociales y hasta una guía de medios de comunicación.

También se usan datos del INE para las estadísticas históricas, el Ministerio de Vivienda para los precios del alquiler, Wikipedia para la información descriptiva de cada municipio, y Wikimedia para las imágenes. Juntar todo esto fue lo más difícil. Cada fuente tiene su formato, los nombres de los municipios se escriben de mil maneras distintas, y algunos datos solo cubren parte de los municipios. Todo se tuvo que limpiar, unir por el código del municipio y convertir en una sola base de datos ordenada.

La web es autónoma. Hay procesos automáticos que descargan los datos, los limpian y los guardan, sin intervención manual. Cuando una fuente falla o tarda demasiado, la web sigue funcionando igual. Y cuando se dudó de la calidad de algún dato, se hicieron comprobaciones, por ejemplo se revisaron una por una casi 1.900 webs de ayuntamientos recopiladas para quedarse solo con las que de verdad funcionaban.

Todo esto se apoya sobre una base técnica que mantiene el proyecto estable y barato de mantener. La interfaz usa Next.js y React. Los datos se guardan en Supabase. El despliegue se realiza en Cloudflare. La actualización de datos funciona como una cadena de montaje programada, con registro de cada ejecución y comprobaciones en cada paso. El proyecto está pensado para escalar y crecer sin límites.

Todo el proyecto es de codigo abierto y su metodología es publica. Cualquiera puede ver de dónde sale cada dato y cómo se calcula la puntuación.

Hoy, la web ayuda a cualquiera que se esté planteando un cambio de vida a decidir con datos en lugar de a ciegas. Y es solo el principio.

**El proyecto también tiene un camino claro para sostenerse.** Las administraciones públicas son el destino natural. Diputaciones y la Junta podrían apoyarse en estos análisis, combinados con inteligencia artificial, para diseñar políticas de repoblación y decidir dónde invertir. Las empresas encontrarían informes de localización y estudios de viabilidad rural. Y quien quiera podría acceder a servicios avanzados, como comparadores entre municipios o avisos personalizados. Como la base de datos de los 2.248 municipios ya está construida y todo se apoya en información pública y gratuita, crear cada nuevo producto cuesta muy poco.

Al final, la idea es sencilla: **que nadie se marche de Castilla y León por falta de información, y que quien quiera venir a vivir, pueda comprobar con datos reales si merece la pena hacerlo**.

Puedes visitar el proyecto en **https://mepuedoquedar.es**
