# RepairFlow: instalación y nube

## 1. Probarlo en tu ordenador
Abre `index.html`. Los datos quedarán en el almacenamiento local de ese navegador. Usa **Ajustes > Descargar copia JSON** con frecuencia.

## 2. Activar acceso multidispositivo con Supabase
1. Crea una cuenta gratuita en https://supabase.com y un proyecto nuevo.
2. Abre **SQL Editor**, crea una consulta, pega TODO el contenido de `supabase.sql` y ejecútalo. Esto crea una tabla con seguridad RLS: cada usuario solo puede acceder a su propia fila.
3. En **Project Settings > API**, copia la URL del proyecto y la clave pública `anon` o `publishable`. Nunca uses la clave `service_role`.
4. Abre `config.js` y rellena `SUPABASE_URL` y `SUPABASE_ANON_KEY`. La clave pública puede estar en una web; la protección real la aplican el login y las políticas RLS.
5. En Supabase, revisa **Authentication > URL Configuration** y añade la URL final de tu web a Redirect URLs.
6. Sube los archivos a GitHub Pages siguiendo el apartado siguiente. En la web pulsa **Sincronizar**, crea tu cuenta e inicia sesión con la misma cuenta en cada dispositivo.

## 3. Publicarlo gratis con GitHub Pages
1. Crea una cuenta en GitHub y un repositorio nuevo, por ejemplo `repairflow`. En el plan gratuito, el repositorio debe ser público para usar Pages.
2. Sube los archivos del ZIP a la raíz del repositorio. No subas el propio ZIP.
3. Ve a **Settings > Pages**. En **Build and deployment**, elige **Deploy from a branch**, rama `main` y carpeta `/(root)`. Guarda.
4. Espera unos minutos. La dirección suele ser `https://TU-USUARIO.github.io/repairflow/`.

### Importante sobre privacidad
El código y `config.js` serán públicos en GitHub Pages. Eso es normal para una clave `anon`/`publishable`. La base de datos no es pública porque `supabase.sql` activa RLS y vincula cada fila a `auth.uid()`. No escribas jamás la clave `service_role` en `config.js`. Usa una contraseña fuerte y no guardes información especialmente sensible que no necesites.

## 4. Uso y cálculos
- **Saldo actual**: movimientos de ingreso menos gastos, más reparaciones marcadas como pagadas.
- **Pendiente de cobro**: precio de las reparaciones no pagadas.
- **Beneficio virtual**: saldo actual + pendiente de cobro - coste total de piezas.
- **Dinero libre real**: saldo actual - fondo reservado - costes de piezas de reparaciones no entregadas.
- Para registrar dinero que ya tenías antes de usar RepairFlow, crea un movimiento de tipo **Ingreso** llamado “Saldo inicial”.

## 5. Copias de seguridad
Aunque uses nube, descarga periódicamente una copia JSON desde Ajustes. El CSV sirve para abrir el listado en Excel; el JSON es el formato correcto para restaurar todo.
