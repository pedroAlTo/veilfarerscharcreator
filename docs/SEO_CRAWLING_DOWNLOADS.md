# SEO, rastreo y descargas en Netlify

El dominio canónico del sitio es `https://veilfarers.com/`. Netlify publica directamente `public/`: `robots.txt`, `sitemap.xml` y `_headers` se sirven desde la raíz. Las reglas de redirección están exclusivamente en `netlify.toml`; no se necesita un segundo archivo `_redirects`.

## Rastreo e indexación

`public/robots.txt` permite las páginas públicas y `/download/`, declara el sitemap y no contiene un bloqueo global `Disallow: /`. Se conservaron las exclusiones de herramientas privadas, API, datos de referencia y material de campañas. Estas exclusiones no sustituyen las reglas de autorización existentes.

Las páginas públicas conservan sus etiquetas canónicas y no reciben una cabecera global `X-Robots-Tag: noindex`. Las herramientas privadas mantienen sus restricciones. No se añadió una cabecera global `index` que pudiera interferir con la protección de las vistas previas.

Las peticiones al host de producción `veilfarers.netlify.app`, al alias `www.veilfarers.com` y al dominio principal por HTTP se redirigen permanentemente al dominio HTTPS sin `www`, conservando la ruta. `/index.html` se redirige a `/`. Las reglas de host no incluyen comodines para otros subdominios de Netlify: no redirigen las vistas previas ni las ramas. El alias `www` debe estar configurado en Netlify y DNS, con certificado válido; los archivos del repositorio no crean ese alias ni su certificado.

## Descargas

La página de descargas incluye las tarjetas, versiones, tamaños y enlaces a los doce PDFs actuales en el HTML publicado. Los visitantes y rastreadores no necesitan ejecutar JavaScript para acceder a ellos. JavaScript actualiza el catálogo y conserva los enlaces publicados si falla la red, la respuesta no es válida o falta el runtime compartido.

Los PDFs se sirven como `application/pdf` y `Content-Disposition: attachment`, con caché pública durante un día y revalidación posterior. No se marcaron como inmutables porque algunos archivos no llevan versión en su nombre. Los catálogos JSON, robots y sitemap requieren revalidación para evitar directivas o listados obsoletos. No se modificaron ni recomprimieron los PDFs originales; se conservaron sus tamaños y sumas de comprobación.

Al publicar una nueva edición:

1. Actualiza los archivos PDF y los dos catálogos existentes, `public/download/downloads.json` y `public/rules-data/downloads.json`, manteniendo tamaños y SHA-256 correctos.
2. Ejecuta `npm run sync:downloads` para sincronizar el HTML estático con el catálogo principal.
3. Actualiza `lastmod` en el sitemap solo para páginas cuyo contenido cambió realmente.
4. Ejecuta `node scripts/sync-downloads.mjs --check` y `node --test tests/seo-downloads.test.mjs tests/download-index-consistency.test.mjs tests/release-1206.test.mjs`.

Si sustituyes un PDF sin cambiar su URL, puede seguir en la caché del navegador durante un día. Para nuevas ediciones, usa nombres de archivo versionados y actualiza los enlaces.

## Validación después del despliegue de producción

```sh
curl -I https://veilfarers.com/
curl -I https://veilfarers.com/downloads.html
curl -I https://veilfarers.com/robots.txt
curl -I https://veilfarers.com/sitemap.xml
curl -I 'https://veilfarers.netlify.app/downloads.html?source=check'
curl -I https://www.veilfarers.com/downloads.html
curl -I https://veilfarers.com/download/VeilFarers_Corebook_12.06.pdf
curl -sS https://veilfarers.com/robots.txt
```

La portada, el catálogo, robots, sitemap y PDF deben responder con HTTP 200, sin `noindex` en las páginas públicas. Los hosts alternativos deben responder con 301 hacia la ruta correspondiente del dominio canónico; comprueba también que se conserva la consulta. El PDF debe tener las cabeceras de descarga y caché indicadas. Comprueba separadamente que una vista previa mantiene su protección contra indexación. Una vista previa no demuestra que los cambios ya estén publicados en el dominio principal.

En Google Search Console, abre la propiedad verificada del dominio, inspecciona la portada y la página de descargas y selecciona «Probar URL publicada». Comprueba HTTP 200, rastreo permitido, ausencia de exclusión por `noindex` y la URL canónica elegida. Envía `sitemap.xml` en Sitemaps y solicita indexación cuando la prueba sea correcta. Estas acciones requieren acceso del propietario y no se ejecutaron desde el repositorio. La configuración facilita el rastreo, pero no garantiza indexación, posiciones ni resultados enriquecidos.
