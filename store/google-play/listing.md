# DexaCV — Google Play Store Submission Kit

Todo lo que necesitas para publicar DexaCV en Google Play Console.
La app ya está simplificada: **100% local, sin login, sin sincronización, sin compras in-app, sin anuncios** — solo un constructor de CV que se guarda en el navegador y exporta PDF/DOCX gratis.

---

## 1. Datos básicos de la app

| Campo | Valor |
|---|---|
| **App name** (30 max) | DexaCV: CV Builder & Resume Maker |
| **Package name** | `com.dexacv` (el `applicationId` en `android/app/build.gradle`) |
| **Categoría** | Productividad (Productivity) |
| **Tipo de app** | Aplicación |
| **¿Contiene anuncios?** | No |
| **¿Compras in-app?** | No |
| **Clasificación de contenido** | Para todos (Everyone) |
| **App de pago o gratuita** | Gratuita |

---

## 2. Descripción corta (80 caracteres máx)

```
Crea y descarga tu CV en PDF. Gratis, 100% local y sin marca de agua.
```
*(66 caracteres)*

**Versión EN:**
```
Free CV builder. PDF resumes, 100% local. No signup, no watermark.
```
*(66 caracteres)*

---

## 3. Descripción completa (4000 caracteres máx)

### Español
```
DexaCV es un constructor de currículum vitae gratuito y sin marcas de agua. Crea, personaliza y descarga tu CV en formato PDF o DOCX directamente desde tu móvil, sin necesidad de registrarte ni crear una cuenta.

★ TOTALMENTE GRATIS
Construye, previsualiza y descarga tu CV sin coste alguno. Sin suscripciones, sin pagos ocultos, sin marca de agua.

★ SIN REGISTRO, SIN CUENTA
Todo se guarda en tu navegador. No necesitas iniciar sesión ni crear una cuenta para usar la app ni para descargar tu CV.

★ 42 PLANTILLAS PROFESIONALES
Diseños originales para cada etapa profesional: moderno, minimalista, ATS-friendly, ejecutivo, creativo y mucho más. Cambia de plantilla cuando quieras sin perder tu contenido.

★ VISTA PREVIA EN VIVO
Ve tu CV actualizarse al instante mientras escribes. Lo que ves es exactamente lo que descargas.

★ EXPORTACIÓN PDF Y DOCX
Descarga tu CV como PDF con saltos de página correctos, o como documento Word editable. Sin marca de agua, siempre.

★ SECCIONES COMPLETAS
Información personal, resumen profesional, experiencia, educación, habilidades, idiomas, proyectos, certificaciones, premios, cursos, voluntariado, intereses y referencias. Activa y reordena las secciones a tu gusto.

★ PERSONALIZACIÓN
Colores de acento y tipografía para adaptar el diseño a tu estilo.

★ 4 IDIOMAS
Interfaz disponible en inglés, español, francés y árabe (con soporte RTL).

★ 100% PRIVADO
Tus datos nunca salen de tu dispositivo. No hay servidores, no hay sincronización en la nube, no hay seguimiento. Tu CV es tuyo.

★ MÓVIL Y ESCRITORIO
Diseño responsivo que funciona perfectamente en cualquier dispositivo.

Construye un CV pulido y listo para reclutadores en minutos. Descárgalo gratis, sin marca de agua, sin suscripción.
```

### English
```
DexaCV is a free, watermark-free CV and resume builder. Create, customize and download your CV as PDF or DOCX directly from your phone — no sign-up, no account required.

★ COMPLETELY FREE
Build, preview and download your CV at no cost. No subscriptions, no hidden fees, no watermark.

★ NO SIGN-UP, NO ACCOUNT
Everything is saved in your browser. You don't need to log in or create an account to use the app or download your CV.

★ 42 PROFESSIONAL TEMPLATES
Original designs for every career stage: modern, minimal, ATS-friendly, executive, creative and more. Switch templates anytime without losing your content.

★ LIVE PREVIEW
Watch your CV update instantly as you type. What you see is exactly what you download.

★ PDF & DOCX EXPORT
Download your CV as a PDF with correct page breaks, or as an editable Word document. No watermark, ever.

★ FULL SECTIONS
Personal info, professional summary, experience, education, skills, languages, projects, certifications, awards, courses, volunteer work, interests and references. Enable and reorder sections to your liking.

★ CUSTOMIZATION
Accent colors and typography to match your style.

★ 4 LANGUAGES
Interface available in English, Spanish, French and Arabic (with RTL support).

★ 100% PRIVATE
Your data never leaves your device. No servers, no cloud sync, no tracking. Your CV is yours.

★ MOBILE & DESKTOP
Responsive design that works perfectly on any device.

Build a polished, recruiter-ready CV in minutes. Download it free — no watermark, no subscription.
```

---

## 4. Gráfico de presentación (Feature Graphic)

**Requisito:** PNG o JPEG, 1024 px × 500 px.

Ya generado y versionado en este repositorio:
- **Archivo:** `store/google-play/assets/feature-graphic-1024x500.png`

> Súbelo en Play Console → Presencia en Google Play → Gráfico de presentación.
> Para regenerarlo tras un cambio de marca, edita `store/google-play/assets/graphic-source.html`
> y vuelve a capturarlo (ver §17).

---

## 5. Icono de la app

**Requisito:** PNG, 512 px × 512 px, 32-bit (sin alpha en el borde).

El icono ya vive en el repositorio y es el mismo que usan la web y la PWA:

| Uso | Archivo |
|---|---|
| Icono de Play Store (512×512) | `public/android-chrome-512x512.png` |
| Icono maskable / adaptable | `public/icon-maskable-512.png` |
| Iconos del launcher en el APK | `android/app/src/main/res/mipmap-*/` |

> Súbelo en Play Console → Presencia en Google Play → Icono de la app. Para el
> icono adaptable usa la capa maskable sobre fondo sólido `#4f46e5` o `#1e1b4b`.
> Play Store rechaza PNG con canal alfa en el borde: aplana sobre fondo opaco si
> el validador se queja.

---

## 6. Capturas de pantalla (requeridas)

**Mínimo:** 2 capturas. **Máximo:** 8. **Formato:** PNG/JPEG, min 320 px, max 3840 px.
**Recomendado para móvil:** 1080×1920 px (formato 9:16) o 1440×2560 px.

### Mockups generados (listos para subir)

Generados a partir de capturas reales de la app (no imágenes de IA con datos ficticios) compuestas en un marco de dispositivo con fondo oscuro degradado. Rutas relativas a `store/screenshots/mockups/`:

| # | Mockup | Archivo | Pie sugerido |
|---|---|---|---|
| 1 | Editor con vista previa en vivo | `editor-preview-phone.png` | "Editor con vista previa en vivo" |
| 2 | Plantilla Moderna | `template-modern.png` | "Plantilla Moderna" |
| 3 | Plantilla ATS Friendly | `template-ats.png` | "Compatible con ATS" |
| 4 | Plantilla Ejecutiva | `template-executive.png` | "Diseño ejecutivo" |

> Composición vertical 1200×1500. Añade un texto superpuesto grande (banner superior o inferior) con el "Pie sugerido" para destacar el beneficio — Google Play lo permite. Para regenerar tras cambios de UI: `node store/capture-screenshots.mjs`, `node store/capture-template-mockups.mjs`, luego `node store/compose-mockups.mjs` (con el dev server corriendo).

### Mockups por formato (móvil / tablet / escritorio)

Mismo tratamiento (capturas reales + marco de dispositivo), en `store/screenshots/mockups/`:

**Móvil (1200×1500)**
| Mockup | Archivo |
|---|---|
| Editor con vista previa en vivo | `editor-preview-phone.png` |
| Galería de plantillas | `templates-gallery-phone.png` |

**Tablet (2000×1400)**
| Mockup | Archivo |
|---|---|
| Editor en tres columnas | `builder-tablet.png` |
| Galería de plantillas | `templates-gallery-tablet.png` |

**Escritorio (2000×1250)**
| Mockup | Archivo |
|---|---|
| Editor completo | `builder-desktop.png` |
| Inicio / hero | `home-desktop.png` |

> Todas reflejan el modo claro actual (la app ahora sigue el tema del sistema en vez de forzar oscuro por defecto). El marco del dispositivo y el fondo siguen siendo oscuros para el efecto de marketing.

### Opcional: capturas reales adicionales

Toma estas capturas en un dispositivo Android real, o con `npm run dev` y el
emulador de móvil de las DevTools:

| # | Pantalla a capturar | Texto superpuesto sugerido |
|---|---|---|
| 1 | Home / landing | "Crea tu CV gratis" |
| 2 | Galería de plantillas | "42 plantillas profesionales" |
| 3 | Builder — editor de experiencia | "Editor con vista previa en vivo" |
| 4 | Builder — vista previa del CV (móvil) | "Lo que ves es lo que descargas" |
| 5 | Selector de plantillas | "Cambia de plantilla sin perder contenido" |
| 6 | Mis Proyectos (lista de CVs) | "Guarda varios CVs en tu dispositivo" |
| 7 | Selector de color/tipografía | "Personaliza el diseño" |
| 8 | Descarga PDF completada | "Exporta a PDF o DOCX gratis" |

> **Tip:** Añade un texto superpuesto grande en cada captura (estilo banner superior o inferior) para destacar el beneficio. Google Play lo permite dentro de la captura.

**Para capturar en Android:** abre la app publicada, navega a cada pantalla, pulsa **Botón de encendido + Bajar volumen** simultáneamente.

---

## 7. Política de privacidad (obligatoria)

**URL:** https://dexacv.com/privacy  (o tu dominio personalizado + `/privacy`)

La app ya tiene una página de privacidad en `/privacy`. Puntos clave que ya cumple:
- No recopila datos personales
- No requiere registro
- Todo el contenido del CV se almacena localmente en el navegador del dispositivo
- No se comparten datos con terceros
- No se usa publicidad ni seguimiento

> Revisa que `/privacy` refleje: "sin cuenta, sin servidores, almacenamiento 100% local". Actualiza si menciona sincronización en la nube.

---

## 8. Clasificación de contenido

Responde el cuestionario de Play Console así:

| Pregunta | Respuesta |
|---|---|
| ¿Contiene violencia? | No |
| ¿Contiene desnudez/sexualidad? | No |
| ¿Contiene lenguaje soez? | No |
| ¿Contiene drogas? | No |
| ¿Contiene apuestas? | No |
| ¿Recopila información personal? | No |
| ¿Permite compras digitales? | No |
| ¿Permite contenido generado por usuarios? | No |
| ¿Permite interacción entre usuarios? | No |

**Resultado esperado:** Para todos (Everyone).

---

## 9. Datos de seguridad (Data Safety)

| Pregunta | Respuesta |
|---|---|
| ¿Recopila o comparte datos? | No |
| ¿Los datos se cifran en tránsito? | N/A (no hay transmisión de datos del CV) |
| ¿Se puede solicitar la eliminación de datos? | No aplica (los datos están solo en el dispositivo; el usuario los borra desinstalando o limpiando el navegador) |
| ¿Cumple con la política de datos de la familia de Google Play? | Sí |
| ¿Está orientada a niños? | No |

---

## 10. Audiencia objetivo

- **Grupo de edad objetivo:** 18+ (aunque el contenido es apto para todos, la app está pensada para adultos en búsqueda de empleo)
- **No** está orientada específicamente a niños (selección "No" en el formulario de audiencia)

---

## 11. Anuncios

- **¿Muestra anuncios?** No
- Selecciona "Mi app no contiene anuncios" en el formulario.

---

## 12. Compras in-app

- **¿Tiene compras in-app?** No
- La app es 100% gratuita. Todas las exportaciones (PDF/DOCX) son gratuitas. No hay suscripciones ni pagos.

> Esto es crítico: al no tener compras de bienes digitales, **no necesitas Google Play Billing** y la app se aprueba sin problema.

---

## 13. Correo de contacto (obligatorio)

Proporciona un correo de contacto para los usuarios:
- **Recomendado:** contact@dexacv.com (el que ya usa la página `/contact`)

---

## 14. Checklist final antes de enviar

- [ ] Sitio desplegado y estable en https://dexacv.com (el shell carga el sitio en vivo)
- [ ] AAB generado y firmado localmente (§15)
- [ ] Cuenta de Google Play Developer activa ($25 pagados)
- [ ] App creada en Play Console con package name correcto
- [ ] AAB subido a una vía (empezar con Pruebas internas)
- [ ] Gráfico de presentación subido (`store/google-play/assets/`)
- [ ] Icono 512×512 subido
- [ ] Mínimo 2 capturas de pantalla subidas
- [ ] Descripción corta + completa rellenadas
- [ ] Política de privacidad enlazada (https://dexacv.com/privacy)
- [ ] Clasificación de contenido completada → Everyone
- [ ] Datos de seguridad completados → No recopila datos
- [ ] Audiencia seleccionada → 18+, no orientada a niños
- [ ] Anuncios → No
- [ ] Compras in-app → No
- [ ] Correo de contacto rellenado
- [ ] App review enviado a producción (o pruebas cerradas primero)

---

## 15. Generar el AAB (build local)

```bash
npm run build          # compila el sitio en dist/
npx cap sync android   # copia dist/ y los plugins al proyecto Android
```

Después construye el bundle firmado desde `android/` y súbelo al listing
`com.dexacv`, con la **misma clave de subida** que todas las versiones
anteriores. Sube `versionCode` en `android/app/build.gradle` por encima de
cualquier build ya presente en cualquier canal, incluidas pruebas internas y
alfa cerrada.

Detalles de firma, App Links y el porqué de `server.url` en
[`android/README.md`](../../android/README.md).

> Como el shell carga el sitio en vivo, la mayoría de los cambios llegan a los
> usuarios al publicar **el sitio**. Solo hace falta subir un AAB nuevo cuando
> cambia lo que vive en el shell: icono, splash, permisos, plugins o config.

## 16. Pasos en Google Play Console

1. Crea cuenta en [play.google.com/console/signup](https://play.google.com/console/signup) (pago único $25).
2. **Crear app** → rellena nombre, idioma, app de pago/gratuita (gratuita).
3. Sube el **.aab** a **Pruebas → Pruebas internas** (no hace falta publicar para probar).
4. Rellena **Presencia en Google Play**: icono, feature graphic, capturas, descripción.
5. Rellena **Política de la app**: privacidad, clasificación, datos de seguridad, anuncios, compras.
6. Envía a revisión para **Producción** (o pruebas cerradas/abiertas primero).

Guía oficial de Google: [Preparar y lanzar una versión](https://support.google.com/googleplay/android-developer/answer/9859152)

---

## 17. Regenerar los gráficos de marca

El gráfico de presentación y la imagen Open Graph se renderizan desde una sola
plantilla HTML versionada, así que no dependen de ningún servicio externo:

```bash
CHROME=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell

# Feature graphic 1024x500
$CHROME --disable-gpu --no-sandbox --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1024,500 --screenshot=store/google-play/assets/feature-graphic-1024x500.png \
  file://$PWD/store/google-play/assets/graphic-source.html

# Open Graph 1200x630 (el que sirve el sitio)
$CHROME --disable-gpu --no-sandbox --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --screenshot=public/og-image.png \
  file://$PWD/store/google-play/assets/graphic-source.html
```

`graphic-source.html` está dimensionada a 1200×630; para el feature graphic
ajusta el bloque `html,body` a 1024×500 antes de capturar. Usa
`headless_shell` y no `chromium`: el segundo descuenta 87 px de cromo de
ventana y recorta el resultado.
