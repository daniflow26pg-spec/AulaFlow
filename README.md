# ✦ AulaFlow — Organizador de tareas estudiantiles

Una aplicación web responsive creada con **HTML, CSS y JavaScript puro**, diseñada para ayudar a estudiantes a organizar tareas, fechas de entrega y prioridades.

## Funciones
- Crear, editar, completar y eliminar tareas.
- Asignar curso, fecha límite, prioridad y notas.
- Ver tarjetas de pendientes, tareas para hoy, completadas y vencidas.
- Buscar, filtrar y ordenar tareas.
- Mostrar el porcentaje de progreso.
- Exportar una copia de las tareas en CSV.
- Guardar automáticamente las tareas en `localStorage` del navegador.

## Cómo usarla en tu computadora
1. Descarga los archivos del proyecto.
2. Mantén `index.html`, `styles.css` y `app.js` **juntos en la misma carpeta**.
3. Abre `index.html` con Chrome, Edge o Firefox.

## Cómo publicarla gratis con GitHub Pages
1. En GitHub, crea un repositorio público llamado `aulaflow`.
2. En `Add file` → `Upload files`, sube **los archivos descomprimidos**, no el ZIP. Verifica que `index.html` quede en la raíz del repositorio.
3. Presiona `Commit changes`.
4. En el repositorio, abre `Settings` → `Pages`.
5. En `Build and deployment` → `Source` elige `Deploy from a branch`.
6. Elige `main` y `/(root)`, y pulsa `Save`.
7. Abre `https://TU-USUARIO.github.io/aulaflow/` reemplazando `TU-USUARIO` por tu usuario de GitHub. La primera publicación puede tomar unos minutos.

Documentación oficial: https://docs.github.com/es/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Tecnologías
- HTML5: estructura y formularios.
- CSS3: diseño adaptable a celulares y computadoras.
- JavaScript: lógica, filtros, estadísticas y acciones.
- `localStorage`: persistencia **local por navegador y dispositivo**.
- GitHub Pages: publicación del sitio estático.

## Importante sobre los datos
**Esta versión no tiene cuentas, base de datos en la nube ni sincronización entre celulares.** Dos compañeros que visitan el mismo enlace no verán las mismas tareas: cada dispositivo conserva sus propios datos. Si borras los datos del navegador, las tareas pueden desaparecer. Usa “Exportar CSV” para guardar una copia.

No publiques contraseñas, claves API ni datos privados en el repositorio. GitHub Pages expone públicamente el código del sitio.

## Próximas mejoras posibles
- Añadir modo claro/oscuro.
- Notificaciones locales de fechas cercanas.
- Pruebas automáticas de funciones.
- Registrar opiniones de 5 compañeros y corregir problemas de uso.
- Versión 2: autenticación y sincronización de tareas con una base de datos y reglas de seguridad, usando un servicio adecuado para back-end (GitHub Pages solo sirve el front-end).

## Reto para aprender de verdad
1. Cambia los colores y el nombre de tu aplicación.
2. Agrega un curso nuevo editando `index.html` y `app.js`.
3. Explica con tus propias palabras qué hacen `localStorage`, `render()` y los eventos `addEventListener`.
4. Publica capturas y describe en el README qué problema resuelve el proyecto.

Proyecto inicial educativo: mejora, personaliza y prueba el código antes de presentarlo como un proyecto propio.
