# Editor de Interfaces

Editor visual de pantallas para proyectos de **Pokemon Essentials**, como mod de
Maker Studio.

Colocas imagenes, textos, botones, barras de vida y Pokemon del equipo
arrastrandolos sobre un lienzo de 512x384, les pones animaciones de entrada, y
dices que hace cada boton. Se guarda en `UI/<nombre>.json`.

**Y esa es la idea de fondo: una pantalla deja de ser codigo y pasa a ser un
fichero de datos.** Cambiar un diseño no obliga a recompilar el juego ni a
reiniciarlo: guardas aqui y vuelves a abrir la pantalla.

![Editor de Interfaces](icon.png)

---

## Hacen falta las dos mitades

Este mod es el **editor**. Lo que dibuja las pantallas dentro del juego es un
plugin de Ruby que vive en su propio repositorio:

> ### [Interfaces — el plugin de Essentials](https://github.com/yobrantoro/essentials-interfaces)
>
> **Instalalo antes de empezar.** Sin el, este editor guarda ficheros JSON que
> nada lee: podras diseñar, pero en el juego no aparecera nada.

| | Donde va |
|---|---|
| **El editor** (este mod) | Se instala desde el Marketplace de Maker Studio |
| **El motor** ([plugin](https://github.com/yobrantoro/essentials-interfaces)) | Se copia a la carpeta `Plugins/` de tu proyecto |

El editor comprueba al abrirse si el plugin esta en el proyecto, y avisa arriba si
falta. Probado en Essentials v21.1 sobre MKXP-Z.

---

## Que se puede poner en una pantalla

| Tipo | Para que |
|---|---|
| **Imagen** | Un PNG o un GIF. Los GIF animados se mueven solos: los reproduce MKXP-Z en C++, asi que no cuestan trabajo en Ruby |
| **Texto** | Con datos del juego entre llaves (ver abajo), contorno, y colocacion fina |
| **Boton** | Con imagen o como rectangulo de color. Cambia al pasar y al pulsar, y puede crecer |
| **Rectangulo** | Fondos y separadores, con borde opcional |
| **Animacion** | Una hoja de sprites que se reproduce sola |
| **Barra** | Se llena segun un dato. Cambia de color como las barras de vida |
| **Pokemon** | El icono o el sprite de un miembro del equipo |

### Datos del juego en vivo

Un texto puede llevar datos entre llaves y se sustituyen al abrir la pantalla:

```
{jugador} tiene {dinero}$
{equipo.1.nombre}  Nv{equipo.1.nivel}
{equipo.1.hp} / {equipo.1.hp_max}
```

Hay 33: el jugador, su dinero, medallas, horas jugadas, Pokedex, donde esta, los
seis del equipo con nombre, nivel, vida, estado y estadisticas, las variables e
interruptores de los eventos, y el combate en marcha. En el editor salen en una
lista con su explicacion, y el lienzo enseña un valor de ejemplo para que puedas
cuadrar el hueco que van a ocupar de verdad.

Un dato que no se puede saber (sin partida empezada, equipo vacio, fuera de
combate) devuelve `---`. **Pedir un dato nunca tira el juego.**

---

## Como se abre una pantalla dentro del juego

Se configura en el propio editor, con casillas. Cuatro maneras:

1. **Menu de pausa** — marcas la casilla y eliges el puesto.
2. **Una tecla** — la eliges de una lista (las que ya usa el juego no salen).
3. **Un interruptor de interfaz** — un nombre tuyo, como `misiones`. Cualquier
   boton que lo active abre esa pantalla y cierra la de antes.
4. **Desde un evento** — `pbInterfaz("mi_pantalla")` en un comando de Script.

### Reemplazar una pantalla del juego

Las siete pantallas de Essentials (mochila, equipo, pokedex, guardar, ficha, mapa,
pokegear) tienen su propio interruptor. La regla es una sola:

> **Manda la pantalla tuya si existe, y si no, la del juego.**

O sea: haces una pantalla, le pones el interruptor `mochila`, y esa pasa a ser la
mochila. La entrada del menu de pausa abre la tuya, y cualquier boton que use ese
interruptor tambien.

**Aviso honesto:** el *contenido* de esas pantallas (la lista de objetos, la lista
de Pokemon) lo genera el codigo del juego, no es un dato, y no se puede dibujar
aqui. Si reemplazas la mochila del todo tendras el marco pero no los objetos. Para
menus de botones va perfecto; para pantallas con contenido, lo util es dejar un
boton que abra la original. El editor te lo avisa al elegir reemplazar una.

---

## Manejo

Con **raton** y con **teclado** a la vez, sin configurar nada:

- Flechas para moverse entre botones, **Z** para pulsar, **X** para salir.
- El raton elige el boton por el que pasa, y al moverlo manda sobre la seleccion.
- Un elemento marcado como **cursor** se coloca solo junto al boton elegido.

---

## Atajos del editor

| | |
|---|---|
| Arrastrar | Mover un elemento |
| Flechas | Mover 1 pixel |
| Shift + flechas | Mover un paso de rejilla |
| Alt mientras arrastras | Sin imantar a la rejilla |
| Ctrl + rueda | Zoom |
| Ctrl+D | Duplicar |
| Supr | Borrar |
| Ctrl+S | Guardar |
| Ctrl+Z / Ctrl+Shift+Z | Deshacer / rehacer |

---

## Un detalle que importa

**El editor dibuja a 512x384 y estira picado, igual que el juego.** Se ve mas
basto que si dibujara a resolucion de pantalla, y es a proposito: si el editor
enseñara una calidad que el juego no puede dar, no serviria para cuadrar nada.

Por lo mismo, el texto se coloca midiendo la tinta real de la fuente en vez de
fiarse de las medidas de la caja de linea, y el editor carga la fuente del propio
proyecto (`Fonts/power green.ttf`). Lo que ves es lo que hay.

---

## Permisos que pide

| Permiso | Para que |
|---|---|
| `fs.project` | Leer los diseños de `UI/` y las imagenes de `Graphics/` |
| `fs.write.project` | Guardar los diseños |
| `ui.dialogs` | La ventana del editor |
| `ui.toasts` | Los avisos |

Ademas lee ficheros binarios (las imagenes) por `window.__TAURI__`, que es la via
que la propia API de mods documenta para esto: `ctx.fs.readProjectFile` devuelve
texto y un PNG es binario.

---

## Licencia

MIT. Ver [LICENSE](LICENSE).
