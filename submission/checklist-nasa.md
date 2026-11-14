# TURUBO — Checklist de entrega NASA Space Apps 2026

> **Issue:** [#2 — Investigación: lista de entrega y premios](https://github.com/federicorv25/turubo-atlas/issues/2) · **Responsable:** Erick · **Sede:** Santa Cruz de la Sierra, Bolivia · **Fecha de revisión:** 14 de noviembre de 2026 (UTC−4) · **Estado:** checklist preparada; **entrega del proyecto NO verificada**.
>
> **Uso:** Federico revisa y efectúa el envío; esta lista NO certifica que una tarea esté cumplida. Marcar [x] únicamente con evidencia. El formulario oficial de 2026 y las guías de entrega/evaluación deben comprobarse al entrar en la cuenta de TURUBO, porque las páginas de guías no respondieron de forma fiable en la revisión.

## 0. Plazos, responsables y comprobantes

- [ ] **Confirmar por escrito con la sede Santa Cruz** su corte local, método de envío y horario de defensa. **Plan interno del equipo, no plazo oficial independiente verificado:** domingo 15/11, envío NASA a **11:15**, entrega local a **12:00** y defensas aproximadamente **14:00** (hora Bolivia); estas horas vienen de *TURUBO Atlas — Guía del Equipo v5*, pp. 2 y 7.
- [ ] No confundir la entrega presencial con la entrega global. La referencia de la guía v5 es **domingo 15/11/2026 a las 23:59, hora local de la sede**, pero verificar el plazo efectivo en la plataforma de NASA.
- [ ] Federico: responsable de **Submit for Judging**, conservar confirmación y verificar el estado del proyecto.
- [ ] Belinda: revisar todos los textos finales en inglés y la narrativa (coordinar con #4).
- [ ] Erick: revisar esta checklist, enlaces, fuentes, elegibilidad y evidencias antes de que Federico envíe.
- [ ] Todos: confirmar que el proyecto aparezca correctamente asociado al **desafío oficial** y a la **sede Santa Cruz**.

**Evidencia de cierre:** captura/pantalla de confirmación, URL pública del proyecto NASA, URL pública de demo y URL pública del producto final; comprobarlas en otra sesión o incógnito.

## 1. Elegibilidad y equipo (verificación obligatoria)

- [ ] Los **seis integrantes** están registrados en NASA Space Apps 2026, figuran confirmados en **el mismo equipo TURUBO y en la misma sede**, y no solo en WhatsApp ni en el formulario logístico local.
- [ ] Seleccionado el reto oficial **“Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars”**: https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/
- [ ] El entregable **responde científicamente** al reto: describe sitios terrestres análogos y qué similitudes medibles los conectan con la Luna/Marte; **no basta** con un juego de temática espacial.
- [ ] Se utiliza, documenta y cita **al menos un recurso/dataset NASA del apartado Resources del desafío**, verificando su cumplimiento en las reglas 2026. Fuente del requisito publicada por una sede 2026: https://www.spaceappschallenge.org/2026/local-events/islamabad/ . Confirmar con la guía global si hubiera matices.
- [ ] Se respeta la originalidad del trabajo y se declara claramente qué se creó **durante el hackatón**, qué es un recurso preexistente y qué se hizo con IA.
- [ ] Material público sin credenciales ni datos personales, y respetando las condiciones de uso y licencias de mapas, fotografías, fuentes, código, ilustraciones, APIs y bibliotecas.
- [ ] Antes del envío, revisar condiciones y casillas del formulario NASA en sesión autenticada; no asumir que subir un repositorio basta para participar en el jurado.

## 2. Formulario NASA — campos y texto final

Campos descritos en *TURUBO Atlas — Guía del Equipo v5*, pág. 2; la **redacción exacta del formulario actual prevalece**:

- [ ] **Project Title:** `TURUBO — From Earth to New Worlds` (confirmar nombre definitivo).
- [ ] **High-Level Summary:** resumen claro en inglés (objetivo, solución, uso de datos NASA, utilidad). La guía interna sugiere **50–200 palabras**; validar límite real del campo.
- [ ] **Detailed Project Description:** en inglés, explicar: problema del desafío → enfoque → sitios evaluados → datos y método → resultados verificados → experiencia jugable → limitaciones → próximos pasos.
- [ ] **NASA Data / References:** citar productos concretos, institución, identificador o URL de la fuente, resolución, licencia/atribución, transformación, fecha de consulta y correspondencia con cada figura o cálculo.
- [ ] **AI/SI Disclosure:** declarar herramientas generativas para código, textos, imágenes, análisis y/o traducción cuando se hayan usado; indicar revisión humana. No afirmar haber entrenado un modelo si no ocurrió.
- [ ] **Project Demo:** enlace público a **presentación de hasta siete diapositivas (incluida portada)** **O** **video de hasta 30 segundos** según guía v5. Confirmar el formato exacto en la guía vigente de NASA. No depender de una demo que exija login.
- [ ] **Final Project:** URL pública de web/repo o resultado final; a diferencia de la demo, debe mostrar lo que funciona realmente. Validar ambos enlaces por separado.
- [ ] Seleccionar opción de participación en evaluación / **Submit for Judging** y comprobar confirmación final (texto del botón según formulario real).
- [ ] Registrar enlace NASA final y captura de estado; conservar copia offline de demo, texto y fuentes.

**URLs por completar por Federico/Belinda (no inventar):**
- Proyecto NASA: **PENDIENTE**
- Demo pública (7 slides o video ≤30 s): **PENDIENTE**
- Web del juego (GitHub Pages): **PENDIENTE**
- Código fuente: https://github.com/federicorv25/turubo-atlas

## 3. Contenido científico mínimo demostrable

- [ ] Datos publicados en `web/public/data/analysis.json` verificados; si no hay medidas, usar estado **`not_assessed`**, jamás copiar el fixture de prueba.
- [ ] Distinguir **Valle de la Luna (San José de Chiquitos)** de **Cerro Turubó**: son lugares diferentes. Cerro Turubó es **caso guiado**, no miembro del ranking.
- [ ] Referencia lunar **Nobile Rim 1** y referencia marciana **Jezero** claramente identificadas.
- [ ] Publicar, **solo cuando se hayan calculado realmente**, métricas de relieve, unidades, resolución de cada DEM, cobertura, método de remuestreo, límites del análisis y fuente.
- [ ] Si se comparan pendientes y desniveles, indicar que **similitud topográfica no implica** similitud en gravedad, atmósfera, geología, radiación, recursos ni seguridad de aterrizaje.
- [ ] Las decisiones ficticias **no alteran las mediciones**. Personajes, templos y encuentros son adaptación narrativa y no se colocan como elementos reales en mapas NASA.
- [ ] Botón **«Ver análisis»** utilizable desde Tierra, Luna y Marte; mostrar evidencia y regresar conservando el avance.
- [ ] Una persona diferente a quien procesó los DEM revisa visualmente y documentalmente una muestra de resultados y conserva prueba de esa revisión (coordinar #3, #8, #9).

**Fuentes previstas en la guía v5 (comprobar uso real, enlaces y crédito en la entrega):**
- Reto y pestaña Resources: https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/?tab=resources
- NASA LRO/LOLA, producto Site 06: https://pgda.gsfc.nasa.gov/products/78
- USGS/JPL CTX Jezero DEM: https://planetarymaps.usgs.gov/mosaic/mars2020_trn/CTX/ScienceInvestigationMaps_JPL/M20_JezeroCrater_CTXDEM_20m.tif
- Procedencia exacta del raster **NASADEM** usado para Santa Cruz: **PENDIENTE del pipeline y metadatos**, no basta con el nombre genérico del producto.
- Adaptación cultural de Turubó: https://archivodefolkloreboliviano.org/motivo/turubo/

## 4. Auditoría de enlaces, funcionamiento y presentación

- [ ] Abrir **en incógnito, sin cuenta**, el video/slides, la web y el repositorio; sin solicitudes de acceso.
- [ ] Comprobar navegación completa de las escenas en **español e inglés** y botones para saltar a evidencias.
- [ ] Probar celular y PC; carga razonable con conexión inestable; sin errores visibles graves.
- [ ] Ejecutar `npm --prefix web run check` y `npm --prefix web run build`; anotar resultado y SHA del commit probado. **Esta issue es de documentación, por lo que esos comandos se verifican en la integración #9; aquí NO constan como ejecutados.**
- [ ] La demo de 30 s o las 7 diapositivas deben enseñar **(1)** qué resuelve, **(2)** una acción real del juego, **(3)** al menos una comparación con fuente y **(4)** su límite principal.
- [ ] No presentar mapas de prueba, métricas hipotéticas, animaciones fantásticas ni placeholders como hallazgos.
- [ ] Ensayar discurso local de aproximadamente tres minutos **solo si lo confirma la sede**; reparto propuesto en guía v5: Federico abre, Luciana explica evidencia, Erick demuestra web y Belinda cierra; Asael y Ana Raquel responden preguntas.
- [ ] Preparar copia de respaldo: diapositivas o video descargado, capturas de la web, fuentes de datos y resumen sin internet.

## 5. Evaluación: criterios y estrategia, sin confundirlos con premios

La sede 2026 de Ajmer publica los **cinco criterios**: https://www.spaceappschallenge.org/2026/local-events/ajmer/ . En todo caso, comprobar la guía global más reciente.

| Criterio | Qué necesita demostrar TURUBO |
|---|---|
| **Impact** | Valor educativo y reproducible de explorar análogos terrestres para otros mundos. |
| **Creativity** | Una narrativa interactiva propia enlazada a una comparación científica auditable. |
| **Validity** | Elevaciones, unidades, resolución y procesamiento reales; no afirmar conclusiones no respaldadas. |
| **Relevance** | Respuesta específica al desafío de identificar y justificar lugares terrestres análogos. |
| **Presentation** | Demo comprensible en segundos, fuente accesible y descripción completa en inglés. |

### Las diez categorías globales de referencia

**Fuente verificable disponible: premios globales oficiales de 2025**, no un listado 2026 confirmado: https://www.spaceappschallenge.org/2025/awards/ . NASA puede revisar las categorías; confirmar las de 2026 cuando se pueda consultar su guía.

| Categoría | Enfoque |
|---|---|
| Best Use of Science | Método y rigor científico. |
| Best Use of Data | Accesibilidad y aplicación singular de datos espaciales. |
| Best Use of Technology | Innovación tecnológica. |
| Galactic Impact | Potencial de impacto amplio. |
| Best Mission Concept | Plausibilidad de concepto de misión. |
| Most Inspirational | Capacidad de inspirar. |
| Best Use of Storytelling | Comunicar la utilidad de datos abiertos con una historia creativa. |
| Global Connection | Conexión entre personas/comunidades mediante tecnología. |
| Art & Technology | Integración significativa de creatividad y desarrollo técnico. |
| Local Impact | Potencial de beneficio local. |

**Prioridad estratégica para TURUBO:** 1) **Best Use of Data** (mediciones verificables, mapa abierto, explicación); 2) **Best Use of Storytelling** (narrativa que enseña algo); 3) **Art & Technology** (arte original al servicio de una herramienta científica). **No son casillas que se marcan**, ni implican nominación o premio. La selección de **Global Nominees** depende del jurado local/universal y la candidatura global requiere los requisitos oficiales.

**Premios monetarios de Santa Cruz:** sin anuncio local verificable en esta revisión. No prometemos dinero, viajes ni equipos sin bases publicadas.

## 6. Pendientes para Federico: bloquear envío hasta resolver

| Pendiente crítico | Responsable | Cómo se cierra |
|---|---|---|
| Hora y modalidad de entrega presencial | Federico / organización local | Mensaje o cronograma confirmado por sede |
| Registrados confirmados en NASA y sede | Federico / seis integrantes | Panel de equipo NASA |
| Dos enlaces públicos válidos | Federico / Belinda | Incógnito desde otro dispositivo |
| Requisito exacto de demo y campos de formulario 2026 | Erick / Belinda / Federico | Inspección en sesión del proyecto NASA |
| Datos NASA realmente utilizados y fuente correcta del reto | Asael / Luciana / Belinda | Pipeline, metadatos y referencias |
| Documento de atribución y declaración IA | Belinda / Federico | Declaración final completa |
| Cierre de evaluación y confirmación | Federico | Captura del envío y URL NASA |

## 7. Fuentes y nivel de confianza

**Documentos del equipo (plan interno; no prueban hechos completados):**
- *TURUBO Atlas — Guía del Equipo v5*, 13/11/2026, en especial pp. 2, 3, 4, 7 y 8.
- [AGENTS.md](../AGENTS.md), [Guion](../content/GUION.md), [Contratos](../schema/README.md), [README de entrega](README.md), y issues [#2](https://github.com/federicorv25/turubo-atlas/issues/2), [#3](https://github.com/federicorv25/turubo-atlas/issues/3), [#4](https://github.com/federicorv25/turubo-atlas/issues/4), [#8](https://github.com/federicorv25/turubo-atlas/issues/8), [#9](https://github.com/federicorv25/turubo-atlas/issues/9).

**Fuentes externas consultadas (distinta vigencia y autoridad):**
- [NASA Space Apps 2026](https://www.spaceappschallenge.org/2026/) — convocatoria y fechas 14–15/11/2026.
- [Recursos NASA Space Apps](https://www.spaceappschallenge.org/resources/) — entrada oficial; **acceso inestable durante esta investigación**.
- [Project Submission Guide](https://www.spaceappschallenge.org/resources/project-submission-guide/) — enlace oficial proporcionado en #2; **no se pudo abrir directamente esta vez**. Confirmar su contenido en el navegador autenticado.
- [Judging & Awards Guide](https://www.spaceappschallenge.org/resources/judging-awards-guide/) — enlace oficial proporcionado en #2; **no se pudo abrir directamente esta vez**.
- [Premios NASA 2025](https://www.spaceappschallenge.org/2025/awards/) — fuente de las diez categorías **de referencia**, no prueba del catálogo 2026.
- [Sede Ajmer 2026](https://www.spaceappschallenge.org/2026/local-events/ajmer/) — publica cinco criterios; información redactada por organizadores locales.
- [Sede Islamabad 2026](https://www.spaceappschallenge.org/2026/local-events/islamabad/) — recuerda el recurso NASA obligatorio y distinción entre plazo local y global; **no establece el horario de Santa Cruz**.
- [Sede Poznan 2026](https://www.spaceappschallenge.org/2026/local-events/poznan/) — menciona formato hasta siete slides o video de 30 s; comprobarlo en la guía global.
- [NASA Space Apps 2022 FAQ — histórico](https://legacy.spaceappschallenge.org/resources/faq/) — solo antecedentes, **no utilizarlo como norma vigente de 2026**.

**Nota de auditoría:** Esta checklist distingue **confirmado en repositorio**, **plan interno** y **por verificar**. Ningún campo pendiente se considera cumplido hasta que haya prueba.
