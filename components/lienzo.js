//=============================================================================
// El lienzo: dibuja el diseño y deja arrastrar y redimensionar con el raton.
//
// FIDELIDAD CON EL JUEGO
//   Esto vuelve a pintar en un canvas lo que el motor pinta con sprites de RGSS.
//   Dos detalles que hay que respetar o el editor miente:
//
//   1. En RGSS el zoom y el giro se aplican desde la ESQUINA SUPERIOR IZQUIERDA
//      del sprite (ox y oy valen 0), no desde el centro. Aqui igual.
//   2. El angulo de RGSS va en grados y en sentido ANTIHORARIO; el rotate del
//      canvas es horario. Por eso se pasa negado.
//
//   El texto se dibuja con la fuente de verdad del juego (Power Green, cargada
//   del proyecto) al mismo tamaño en pixeles. No es exacto al pixel porque el
//   trazado de fuentes de RGSS y el del navegador no son el mismo, pero las
//   cajas y las posiciones cuadran, que es para lo que sirve.
//=============================================================================

import { h, colorCss } from "./dom.js";
import * as M from "../modelo.js";
import * as G from "../graficos.js";
import * as D from "../datos.js";

const TIRADOR = 7;                 // lado del tirador de redimension, en pixeles de pantalla
const MINIMO = 2;                  // no se puede hacer un elemento mas pequeño que esto

// Los ocho tiradores, con el factor que aplican a x, y, ancho y alto.
const TIRADORES = [
  { id: "no", cx: 0,   cy: 0,   dx: 1, dy: 1, dw: -1, dh: -1 },
  { id: "n",  cx: 0.5, cy: 0,   dx: 0, dy: 1, dw: 0,  dh: -1 },
  { id: "ne", cx: 1,   cy: 0,   dx: 0, dy: 1, dw: 1,  dh: -1 },
  { id: "e",  cx: 1,   cy: 0.5, dx: 0, dy: 0, dw: 1,  dh: 0 },
  { id: "se", cx: 1,   cy: 1,   dx: 0, dy: 0, dw: 1,  dh: 1 },
  { id: "s",  cx: 0.5, cy: 1,   dx: 0, dy: 0, dw: 0,  dh: 1 },
  { id: "so", cx: 0,   cy: 1,   dx: 1, dy: 0, dw: -1, dh: 1 },
  { id: "o",  cx: 0,   cy: 0.5, dx: 1, dy: 0, dw: -1, dh: 0 }
];

const CURSORES = { no: "nwse-resize", n: "ns-resize", ne: "nesw-resize", e: "ew-resize",
                   se: "nwse-resize", s: "ns-resize", so: "nesw-resize", o: "ew-resize" };

export class Lienzo {
  constructor(opciones) {
    this.op = opciones;                 // {alSeleccionar, alCambiar, alMoverRaton}
    this.diseno = null;
    this.seleccion = null;
    this.tiempo = 0;
    this.zoom = 2;
    this.rejilla = true;
    this.imantar = true;
    this.pendientes = new Set();        // imagenes que se estan cargando

    // Dos capas: abajo el diseño a tamaño real y estirado picado (lo que se ve
    // en el juego), y encima los adornos del editor (rejilla, contorno,
    // tiradores) a resolucion de pantalla, para que sigan siendo finos y no se
    // conviertan en una escalera de pixeles ellos tambien.
    this.canvas = h("canvas", { className: "ui-lienzo" });
    this.ctx2d = this.canvas.getContext("2d");
    this.capa = h("canvas", { className: "ui-lienzo-capa" });
    this.ctxCapa = this.capa.getContext("2d");
    this.marco = h("div", { className: "ui-lienzo-marco" }, this.canvas, this.capa);
    this.el = h("div", { className: "ui-lienzo-zona" }, this.marco);

    this.arrastre = null;
    this.hayAnimadas = false;
    this.conectar();
    this.arrancarLatido();
  }

  //---------------------------------------------------------------------------
  fijarDiseno(diseno) { this.diseno = diseno; this.repintar(); }
  fijarSeleccion(id) { this.seleccion = id; this.repintar(); }
  fijarTiempo(t) { this.tiempo = t; this.repintar(); }
  fijarZoom(z) { this.zoom = Math.max(1, Math.min(6, z)); this.repintar(); }
  fijarRejilla(v) { this.rejilla = !!v; this.repintar(); }
  fijarImantar(v) { this.imantar = !!v; }

  get ancho() { return M.num(this.diseno?.lienzo?.ancho, M.LIENZO_ANCHO); }
  get alto() { return M.num(this.diseno?.lienzo?.alto, M.LIENZO_ALTO); }

  elementoElegido() {
    if (!this.diseno || !this.seleccion) return null;
    return (this.diseno.elementos || []).find(e => e.id === this.seleccion) || null;
  }

  //---------------------------------------------------------------------------
  // Pintado.
  //---------------------------------------------------------------------------
  // SE DIBUJA A TAMAÑO REAL (512x384) Y SE ESTIRA CON CSS, PICADO.
  //
  // Antes se dibujaba en un canvas ya escalado, o sea con la letra a doble o
  // triple resolucion, y salia mucho mas fina que en el juego. Eso convertia el
  // editor en un mentiroso bonito: enseñaba una calidad que el juego no puede
  // dar, porque el juego dibuja en 512x384 y luego estira la imagen entera.
  //
  // Dibujando 1:1 y dejando que el navegador lo estire con image-rendering
  // pixelated, se ve EXACTAMENTE la misma escalera de pixeles que en el juego.
  // Feo, pero verdad; y para cuadrar una pantalla la verdad es lo unico que vale.
  repintar() {
    if (!this.diseno) return;
    const z = this.zoom;
    const W = this.ancho, H = this.alto;
    if (this.canvas.width !== W || this.canvas.height !== H) {
      this.canvas.width = W;
      this.canvas.height = H;
    }
    // El tamaño en pantalla lo pone el CSS, no el canvas.
    this.canvas.style.width = (W * z) + "px";
    this.canvas.style.height = (H * z) + "px";

    // Se recalcula en cada pasada: si se quita el ultimo GIF, el latido para.
    this.hayAnimadas = false;

    const c = this.ctx2d;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);

    // Fondo del lienzo: un gris neutro que representa "aqui se ve el mapa".
    c.fillStyle = "#20242b";
    c.fillRect(0, 0, W, H);

    c.imageSmoothingEnabled = false;

    // Pantalla completa: fondo opaco, el mapa no se ve. Si no, se oscurece lo
    // que diga el diseño y el gris de debajo hace de "aqui se vera el mapa".
    if (this.diseno.pantalla_completa) {
      c.fillStyle = colorCss(this.diseno.color_fondo || "#000000FF", "#000000FF");
      c.fillRect(0, 0, W, H);
    } else {
      const oscurecer = M.num(this.diseno.oscurecer_mapa, 0);
      if (oscurecer > 0) {
        c.fillStyle = `rgba(0,0,0,${Math.min(oscurecer, 255) / 255})`;
        c.fillRect(0, 0, W, H);
      }
    }

    const ordenados = (this.diseno.elementos || [])
      .map((el, i) => ({ el, i }))
      .sort((a, b) => (M.num(a.el.capa, 0) - M.num(b.el.capa, 0)) || (a.i - b.i));

    for (const { el } of ordenados) {
      if (el.visible === false) continue;
      this.pintarElemento(c, el);
    }

    this.repintarCapa();
  }

  // Los adornos del editor, encima y a resolucion de pantalla.
  repintarCapa() {
    const z = this.zoom;
    const W = this.ancho, H = this.alto;
    if (this.capa.width !== W * z || this.capa.height !== H * z) {
      this.capa.width = W * z;
      this.capa.height = H * z;
    }
    this.capa.style.width = (W * z) + "px";
    this.capa.style.height = (H * z) + "px";

    const c = this.ctxCapa;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this.capa.width, this.capa.height);
    if (this.rejilla) this.pintarRejilla(c, W, H, z);
    this.pintarSeleccion(c);
  }

  pintarRejilla(c, W, H, z) {
    const paso = M.REJILLA * z;
    c.save();
    c.strokeStyle = "rgba(255,255,255,0.07)";
    c.lineWidth = 1;
    c.beginPath();
    for (let x = paso; x < W * z; x += paso) { c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, H * z); }
    for (let y = paso; y < H * z; y += paso) { c.moveTo(0, y + 0.5); c.lineTo(W * z, y + 0.5); }
    c.stroke();
    // El centro, que es la guia que mas se usa para centrar cosas.
    c.strokeStyle = "rgba(120,180,255,0.18)";
    c.beginPath();
    c.moveTo((W * z) / 2, 0); c.lineTo((W * z) / 2, H * z);
    c.moveTo(0, (H * z) / 2); c.lineTo(W * z, (H * z) / 2);
    c.stroke();
    c.restore();
  }

  // El boton que estara elegido al abrirse la pantalla: el mismo criterio que usa
  // el motor (primero el orden_teclado que se haya puesto, y si no, de arriba
  // abajo y de izquierda a derecha). Sirve para enseñar donde caera el cursor.
  primerBoton() {
    const botones = (this.diseno?.elementos || []).filter(e => e.tipo === "boton" && e.visible !== false);
    if (!botones.length) return null;
    return botones.slice().sort((a, b) => {
      const oa = a.orden_teclado == null ? 1 : 0, ob = b.orden_teclado == null ? 1 : 0;
      if (oa !== ob) return oa - ob;
      if (M.num(a.orden_teclado, 0) !== M.num(b.orden_teclado, 0)) return M.num(a.orden_teclado, 0) - M.num(b.orden_teclado, 0);
      if (M.num(a.y, 0) !== M.num(b.y, 0)) return M.num(a.y, 0) - M.num(b.y, 0);
      return M.num(a.x, 0) - M.num(b.x, 0);
    })[0];
  }

  // Coloca el canvas en el estado que pide el elemento (posicion, giro, zoom,
  // transparencia) y llama al dibujo concreto.
  pintarElemento(c, el) {
    let x = M.valorDe(el, "x", this.tiempo);
    let y = M.valorDe(el, "y", this.tiempo);

    // El cursor no se dibuja donde dice su x,y: se pega al boton elegido, igual
    // que hara en el juego. Si no, el editor enseñaria la flecha en una esquina
    // y en el juego apareceria en otro sitio.
    if (el.sigue_seleccion) {
      const destino = this.primerBoton();
      if (destino) {
        const m = this.medidaElemento(el);
        const mb = this.medidaElemento(destino);
        x = M.num(destino.x, 0) + M.num(el.cursor_x, 0);
        y = M.num(destino.y, 0) + Math.floor((mb.h - m.h) / 2) + M.num(el.cursor_y, 0);
      }
    }
    const op = M.valorDe(el, "opacidad", this.tiempo);
    const zoom = M.valorDe(el, "zoom", this.tiempo);
    const ang = M.valorDe(el, "angulo", this.tiempo);

    c.save();
    c.globalAlpha = Math.max(0, Math.min(255, op)) / 255;
    c.translate(x, y);
    if (ang) c.rotate(-ang * Math.PI / 180);      // RGSS gira al contrario
    if (zoom !== 1) c.scale(zoom, zoom);

    switch (el.tipo) {
      case "panel":   this.pintarPanel(c, el); break;
      case "texto":   this.pintarTexto(c, el); break;
      case "boton":   this.pintarBoton(c, el); break;
      case "imagen":  this.pintarImagen(c, el, el.imagen); break;
      case "animado": this.pintarAnimado(c, el); break;
      case "barra":   this.pintarBarra(c, el); break;
      case "pokemon": this.pintarPokemon(c, el); break;
    }
    c.restore();
  }

  pintarPanel(c, el) {
    const w = Math.max(M.num(el.ancho, 1), 1);
    const hh = Math.max(M.num(el.alto, 1), 1);
    this.recuadro(c, 0, 0, w, hh, colorCss(el.color, "#000000FF"),
      el.borde ? colorCss(el.borde, "#FFFFFFFF") : null,
      el.borde_grosor == null ? 1 : M.num(el.borde_grosor, 1));
  }

  pintarTexto(c, el) {
    // Se enseña el VALOR DE EJEMPLO, no las llaves: asi se ve el hueco que va a
    // ocupar de verdad en el juego y se puede cuadrar.
    const txt = D.rellenarEjemplo(el.texto);
    const tam = M.num(el.tamano, M.TEXTO_TAMANO);
    const medida = this.medirTexto(c, txt, tam);
    const w = M.num(el.ancho, 0) > 0 ? M.num(el.ancho, 0) : Math.ceil(medida.ancho) + 4;
    const hh = M.num(el.alto, 0) > 0 ? M.num(el.alto, 0) : Math.max(medida.alto, tam + 4);
    this.escribir(c, txt, 0, 0, w, hh, tam, {
      alineacion: el.alineacion,
      vertical: el.alineacion_vertical,
      desplazar: M.num(el.desplazar_y, 0),
      contorno: el.contorno,
      color: colorCss(el.color, M.TEXTO_COLOR),
      sombra: colorCss(el.sombra, M.TEXTO_SOMBRA)
    });
  }

  // El ancho del texto, y de paso la caja de linea.
  medirTexto(c, txt, tam) {
    c.font = `${tam}px "${G.FUENTE}", sans-serif`;
    const m = c.measureText(txt);
    const asc = m.fontBoundingBoxAscent != null ? m.fontBoundingBoxAscent : tam * 0.8;
    const desc = m.fontBoundingBoxDescent != null ? m.fontBoundingBoxDescent : tam * 0.2;
    return { ancho: m.width, alto: asc + desc, subida: asc };
  }

  // DONDE ESTA LA TINTA de una muestra fija, medida desde la linea base.
  //
  // Espejo de Interfaces.metricas en Ruby, que lo saca escaneando pixeles. Aqui
  // el canvas lo da hecho con actualBoundingBox, que son los limites REALES de lo
  // que se pinta (no la caja de linea de la fuente, que lleva hueco de sobra
  // repartido de forma desigual).
  //
  // Se mide una muestra FIJA, no el texto de cada elemento, para que todos los
  // textos compartan la misma linea base y no bailen segun lleven o no una "g".
  metricasTinta(c, tam) {
    this._tinta = this._tinta || {};
    if (this._tinta[tam]) return this._tinta[tam];
    c.font = `${tam}px "${G.FUENTE}", sans-serif`;
    const m = c.measureText(M.MUESTRA_METRICA);
    const subida = m.actualBoundingBoxAscent != null ? m.actualBoundingBoxAscent : tam * 0.72;
    const bajada = m.actualBoundingBoxDescent != null ? m.actualBoundingBoxDescent : tam * 0.22;
    this._tinta[tam] = { subida, bajada, alto: subida + bajada };
    return this._tinta[tam];
  }

  // ESPEJO DE Interfaces.escribir EN RUBY. Misma cuenta: se coloca por la TINTA,
  // o sea por lo que se ve, no por una caja invisible de la fuente. Si una de las
  // dos cambia, hay que cambiar la otra o el editor vuelve a mentir.
  escribir(c, txt, x, y, ancho, alto, tam, op) {
    if (!txt) return;
    const t = this.metricasTinta(c, tam);
    c.font = `${tam}px "${G.FUENTE}", sans-serif`;
    const al = op.alineacion || "izquierda";
    c.textAlign = al === "centro" ? "center" : (al === "derecha" ? "right" : "left");
    const tx = x + (al === "centro" ? ancho / 2 : (al === "derecha" ? ancho : 0));

    // Donde tiene que caer el borde de arriba de la tinta.
    let tintaArriba;
    if (op.vertical === "arriba") tintaArriba = 0;
    else if (op.vertical === "abajo") tintaArriba = alto - t.alto;
    else tintaArriba = Math.round((alto - t.alto) / 2);
    tintaArriba += M.num(op.desplazar, 0);

    c.textBaseline = "alphabetic";
    const base = y + tintaArriba + t.subida;
    if (op.sombra) {
      c.fillStyle = op.sombra;
      if (op.contorno) {
        // Ocho pasadas alrededor, las mismas que hace el motor.
        for (const [dx, dy] of [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]) {
          c.fillText(txt, tx + dx, base + dy);
        }
      } else {
        c.fillText(txt, tx + 1, base + 1);
      }
    }
    c.fillStyle = op.color;
    c.fillText(txt, tx, base);
  }

  // Rectangulo con borde. Espejo de Interfaces.recuadro en Ruby.
  recuadro(c, x, y, ancho, alto, relleno, borde, grosor) {
    if (relleno) { c.fillStyle = relleno; c.fillRect(x, y, ancho, alto); }
    if (!borde || grosor <= 0) return;
    let g = Math.min(grosor, Math.floor(Math.min(ancho, alto) / 2));
    if (g < 1) g = 1;
    c.fillStyle = borde;
    c.fillRect(x, y, ancho, g);
    c.fillRect(x, y + alto - g, ancho, g);
    c.fillRect(x, y, g, alto);
    c.fillRect(x + ancho - g, y, g, alto);
  }

  pintarBoton(c, el) {
    const conImagen = !!el.imagen;
    if (conImagen) { this.pintarImagen(c, el, el.imagen); return; }

    const w = Math.max(M.num(el.ancho, 1), 1);
    const hh = Math.max(M.num(el.alto, 1), 1);
    this.recuadro(c, 0, 0, w, hh, colorCss(el.color, M.BOTON_COLOR),
      el.borde ? colorCss(el.borde, "#FFFFFFFF") : null,
      el.borde_grosor == null ? 1 : M.num(el.borde_grosor, 1));

    const txt = D.rellenarEjemplo(el.texto);
    if (!txt) return;
    const tam = M.num(el.tamano, M.TEXTO_TAMANO);
    this.escribir(c, txt, 0, 0, w, hh, tam, {
      alineacion: el.alineacion || "centro",
      vertical: el.alineacion_vertical,
      desplazar: M.num(el.desplazar_y, 0),
      contorno: el.contorno,
      color: colorCss(el.color_texto, M.TEXTO_COLOR),
      sombra: colorCss(el.sombra, M.TEXTO_SOMBRA)
    });
  }

  pintarImagen(c, el, ruta) {
    const dato = this.pedirImagen(ruta);
    if (!dato) { this.pintarHueco(c, el, ruta ? "?" : ""); return; }
    c.drawImage(dato.img, 0, 0);
  }

  pintarAnimado(c, el) {
    const dato = this.pedirImagen(el.imagen);
    if (!dato) { this.pintarHueco(c, el, "?"); return; }
    const n = Math.max(M.num(el.fotogramas, 1), 1);
    const fw = M.num(el.ancho_fotograma, 0) > 0 ? M.num(el.ancho_fotograma, 0) : Math.floor(dato.ancho / n);
    const fh = M.num(el.alto_fotograma, 0) > 0 ? M.num(el.alto_fotograma, 0) : dato.alto;
    const porFila = Math.max(Math.floor(dato.ancho / Math.max(fw, 1)), 1);

    // Que fotograma toca ahora. El motor cambia cada velocidad/20 segundos.
    const vel = Math.max(M.num(el.velocidad, 2), 1);
    const porSeg = 20 / vel;
    const cual = Math.floor(this.tiempo * porSeg) % n;
    const sx = (cual % porFila) * fw;
    const sy = Math.floor(cual / porFila) * fh;
    c.drawImage(dato.img, sx, sy, fw, fh, 0, 0, fw, fh);
  }

  // Barra: se enseña a la mitad, que es lo util para cuadrar (llena o vacia no
  // deja ver donde queda el borde de relleno).
  pintarBarra(c, el) {
    const w = Math.max(M.num(el.ancho, 1), 1);
    const hh = Math.max(M.num(el.alto, 1), 1);
    const g = el.borde_grosor == null ? 1 : M.num(el.borde_grosor, 1);
    this.recuadro(c, 0, 0, w, hh, colorCss(el.color_fondo, "#20242BFF"),
      el.borde ? colorCss(el.borde, "#FFFFFFFF") : null, g);
    const dentro = el.borde ? g : 0;
    const utilW = w - dentro * 2, utilH = hh - dentro * 2;
    if (utilW <= 0 || utilH <= 0) return;
    const f = 0.6;                       // muestra: algo mas de la mitad
    const largo = Math.max(Math.round(utilW * f), 1);
    c.fillStyle = colorCss(el.color, "#68D076FF");
    if (String(el.hacia) === "izquierda") c.fillRect(dentro + utilW - largo, dentro, largo, utilH);
    else c.fillRect(dentro, dentro, largo, utilH);
  }

  // Pokemon: en el editor no hay partida, asi que se dibuja un hueco con su
  // medida real de icono para poder colocarlo.
  pintarPokemon(c, el) {
    const lado = (el.modo === "frente" || el.modo === "espalda") ? 128 : 64;
    c.save();
    c.strokeStyle = "rgba(120,200,255,0.9)";
    c.setLineDash([3, 2]);
    c.strokeRect(0.5, 0.5, lado - 1, lado - 1);
    c.setLineDash([]);
    c.fillStyle = "rgba(120,200,255,0.9)";
    c.font = "9px sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("POKE " + M.num(el.cual, 1), lado / 2, lado / 2);
    c.restore();
  }

  // Un elemento sin imagen: un recuadro a rayas para que se vea que esta ahi y
  // se pueda seleccionar y mover. Si no, seria invisible e imposible de tocar.
  pintarHueco(c, el, marca) {
    const w = Math.max(M.num(el.ancho, 32), 8);
    const hh = Math.max(M.num(el.alto, 32), 8);
    c.save();
    c.strokeStyle = "rgba(255,140,120,0.9)";
    c.setLineDash([3, 2]);
    c.lineWidth = 1;
    c.strokeRect(0.5, 0.5, w - 1, hh - 1);
    if (marca) {
      c.setLineDash([]);
      c.fillStyle = "rgba(255,140,120,0.9)";
      c.font = "10px sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(marca, w / 2, hh / 2);
    }
    c.restore();
  }

  // Pide una imagen. Si no esta en cache lanza la carga y repinta al llegar. Se
  // recuerda lo pendiente para no lanzar la misma carga en cada repintado.
  pedirImagen(ruta) {
    if (!ruta) return null;
    const enCache = G.imagenEnCache(ruta);
    if (enCache !== undefined) {
      if (enCache && enCache.img) {
        // Un GIF animado sigue corriendo dentro del <img>, y drawImage pinta el
        // fotograma de ese instante. Para verlo moverse aqui igual que en el
        // juego hay que repintar seguido: se enciende el latido.
        if (enCache.animada) this.hayAnimadas = true;
        return enCache;
      }
      return null;
    }
    if (this.pendientes.has(ruta)) return null;
    this.pendientes.add(ruta);
    G.imagenDibujable(ruta).then(() => {
      this.pendientes.delete(ruta);
      this.repintar();
    });
    return null;
  }

  // Repinta 15 veces por segundo MIENTRAS HAYA algun GIF a la vista. No se deja
  // corriendo siempre a proposito: sin GIFs el lienzo solo se repinta cuando algo
  // cambia, y asi el editor no calienta el portatil por enseñar algo quieto.
  arrancarLatido() {
    if (this._latiendo) return;
    this._latiendo = true;
    const paso = () => {
      if (!this.el.isConnected) { this._latiendo = false; return; }
      if (this.hayAnimadas) this.repintar();
      setTimeout(paso, 66);
    };
    setTimeout(paso, 66);
  }

  //---------------------------------------------------------------------------
  // Contorno y tiradores del elemento elegido.
  //---------------------------------------------------------------------------
  pintarSeleccion(c) {
    const el = this.elementoElegido();
    if (!el) return;
    const r = this.rectanguloPantalla(el);
    if (!r) return;

    c.save();
    c.strokeStyle = "#4b9fea";
    c.lineWidth = 1;
    c.setLineDash([4, 3]);
    c.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    c.setLineDash([]);

    if (this.redimensionable(el)) {
      c.fillStyle = "#fff";
      c.strokeStyle = "#4b9fea";
      for (const t of TIRADORES) {
        const p = this.puntoTirador(r, t);
        c.fillRect(p.x - TIRADOR / 2, p.y - TIRADOR / 2, TIRADOR, TIRADOR);
        c.strokeRect(p.x - TIRADOR / 2 + 0.5, p.y - TIRADOR / 2 + 0.5, TIRADOR - 1, TIRADOR - 1);
      }
    }
    c.restore();
  }

  // Solo tienen tamaño propio los que se dibujan por color o miden una caja. Una
  // imagen la mide su PNG, asi que estirarla desde el editor engañaria.
  redimensionable(el) {
    if (el.tipo === "panel") return true;
    if (el.tipo === "boton") return !el.imagen;
    if (el.tipo === "texto") return true;
    return false;
  }

  puntoTirador(r, t) {
    return { x: r.x + r.w * t.cx, y: r.y + r.h * t.cy };
  }

  // Rectangulo del elemento EN PIXELES DE PANTALLA, ya con el zoom aplicado.
  rectanguloPantalla(el) {
    const l = this.rectanguloLogico(el);
    if (!l) return null;
    const z = this.zoom;
    return { x: l.x * z, y: l.y * z, w: Math.max(l.w * z, 4), h: Math.max(l.h * z, 4) };
  }

  // Rectangulo en coordenadas del lienzo (512x384), en el instante actual.
  rectanguloLogico(el) {
    const x = M.valorDe(el, "x", this.tiempo);
    const y = M.valorDe(el, "y", this.tiempo);
    const zoom = M.valorDe(el, "zoom", this.tiempo);
    const m = this.medidaElemento(el);
    return { x, y, w: m.w * zoom, h: m.h * zoom };
  }

  // Cuanto mide un elemento. Los que tienen ancho y alto propios usan los suyos;
  // los de imagen, lo que mida la imagen; el texto se mide con la fuente.
  medidaElemento(el) {
    if (el.tipo === "pokemon") {
      const lado = (el.modo === "frente" || el.modo === "espalda") ? 128 : 64;
      return { w: lado, h: lado };
    }
    if (el.tipo === "barra" || el.tipo === "panel" || (el.tipo === "boton" && !el.imagen)) {
      return { w: Math.max(M.num(el.ancho, 1), 1), h: Math.max(M.num(el.alto, 1), 1) };
    }
    if (el.tipo === "texto") {
      const tam = M.num(el.tamano, M.TEXTO_TAMANO);
      // La misma medida que usa Texto#medir en Ruby, para que la caja que se
      // dibuja y la que se puede arrastrar sean la misma que la del juego.
      const medida = this.medirTexto(this.ctx2d, D.rellenarEjemplo(el.texto), tam);
      const w = M.num(el.ancho, 0) > 0 ? M.num(el.ancho, 0) : Math.ceil(medida.ancho) + 4;
      const hh = M.num(el.alto, 0) > 0 ? M.num(el.alto, 0) : Math.max(medida.alto, tam + 4);
      return { w: Math.max(w, 1), h: Math.max(hh, 1) };
    }
    // imagen y animado
    const dato = G.imagenEnCache(el.imagen);
    if (dato && dato.ancho) {
      if (el.tipo === "animado") {
        const n = Math.max(M.num(el.fotogramas, 1), 1);
        const fw = M.num(el.ancho_fotograma, 0) > 0 ? M.num(el.ancho_fotograma, 0) : Math.floor(dato.ancho / n);
        const fh = M.num(el.alto_fotograma, 0) > 0 ? M.num(el.alto_fotograma, 0) : dato.alto;
        return { w: Math.max(fw, 1), h: Math.max(fh, 1) };
      }
      return { w: dato.ancho, h: dato.alto };
    }
    return { w: Math.max(M.num(el.ancho, 32), 8), h: Math.max(M.num(el.alto, 32), 8) };
  }

  //---------------------------------------------------------------------------
  // Raton.
  //---------------------------------------------------------------------------
  conectar() {
    // Se guardan las funciones para poder QUITARLAS al cerrar. Sin esto, cada vez
    // que se abria el editor quedaban dos listeners mas en window apuntando a un
    // lienzo ya muerto: cada movimiento del raton en toda la ventana disparaba el
    // codigo de todos los lienzos zombis a la vez.
    this._alMoverVentana = (e) => this.alMover(e);
    this._alSoltarVentana = () => this.alSoltar();
    // Si la ventana pierde el foco a mitad de un arrastre (Alt+Tab, o un dialogo
    // que se abre encima), el mouseup se lo lleva otra ventana y nunca llega. Sin
    // esto el arrastre se quedaba pegado y al volver el elemento pegaba un salto.
    this._alPerderFoco = () => this.cancelarArrastre();
    this.canvas.addEventListener("mousedown", (e) => this.alPulsar(e));
    window.addEventListener("mousemove", this._alMoverVentana);
    window.addEventListener("mouseup", this._alSoltarVentana);
    window.addEventListener("blur", this._alPerderFoco);
    this.canvas.addEventListener("mousemove", (e) => this.alMoverEncima(e));
    this.canvas.addEventListener("mouseleave", () => this.op.alMoverRaton?.(null));
    // Rueda con Ctrl para el zoom, que es lo que espera cualquiera.
    this.canvas.addEventListener("wheel", (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      this.fijarZoom(this.zoom + (e.deltaY < 0 ? 1 : -1));
      this.op.alCambiarZoom?.(this.zoom);
    }, { passive: false });
  }

  posicionEnCanvas(e) {
    const caja = this.canvas.getBoundingClientRect();
    return { px: e.clientX - caja.left, py: e.clientY - caja.top };
  }

  aLogico(px, py) {
    return { x: px / this.zoom, y: py / this.zoom };
  }

  alPulsar(e) {
    if (e.button !== 0) return;
    const { px, py } = this.posicionEnCanvas(e);

    // Primero los tiradores del elegido: tienen prioridad sobre seleccionar otro.
    const elegido = this.elementoElegido();
    if (elegido && this.redimensionable(elegido)) {
      const r = this.rectanguloPantalla(elegido);
      for (const t of TIRADORES) {
        const p = this.puntoTirador(r, t);
        if (Math.abs(px - p.x) <= TIRADOR && Math.abs(py - p.y) <= TIRADOR) {
          const m = this.medidaElemento(elegido);
          this.op.antesDeCambiar?.("medida:" + elegido.id);   // foto antes de tocar nada
          this.arrastre = {
            modo: "medida", tirador: t, id: elegido.id,
            ox: px, oy: py,
            x0: M.num(elegido.x, 0), y0: M.num(elegido.y, 0),
            w0: m.w, h0: m.h
          };
          return;
        }
      }
    }

    const tocado = this.elementoEn(px, py);
    if (!tocado) { this.op.alSeleccionar?.(null); return; }
    if (tocado.id !== this.seleccion) this.op.alSeleccionar?.(tocado.id);
    this.op.antesDeCambiar?.("mover:" + tocado.id);
    this.arrastre = {
      modo: "mover", id: tocado.id,
      ox: px, oy: py,
      x0: M.num(tocado.x, 0), y0: M.num(tocado.y, 0)
    };
  }

  // El de capa mas alta que este bajo el punto, igual que hace el motor con los
  // botones: si dos se solapan gana el que se ve.
  elementoEn(px, py) {
    const { x, y } = this.aLogico(px, py);
    const lista = (this.diseno?.elementos || [])
      .map((el, i) => ({ el, i }))
      .filter(({ el }) => el.visible !== false && el.bloqueado !== true)
      .sort((a, b) => (M.num(b.el.capa, 0) - M.num(a.el.capa, 0)) || (b.i - a.i));
    for (const { el } of lista) {
      const r = this.rectanguloLogico(el);
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return el;
    }
    return null;
  }

  alMover(e) {
    if (!this.arrastre) return;
    const { px, py } = this.posicionEnCanvas(e);
    const dx = (px - this.arrastre.ox) / this.zoom;
    const dy = (py - this.arrastre.oy) / this.zoom;
    const el = (this.diseno.elementos || []).find(x => x.id === this.arrastre.id);
    if (!el) return;

    if (this.arrastre.modo === "mover") {
      el.x = this.ajustar(this.arrastre.x0 + dx, e.altKey);
      el.y = this.ajustar(this.arrastre.y0 + dy, e.altKey);
    } else {
      const t = this.arrastre.tirador;
      let nx = this.arrastre.x0 + (t.dx ? dx : 0);
      let ny = this.arrastre.y0 + (t.dy ? dy : 0);
      let nw = this.arrastre.w0 + (t.dw ? t.dw * dx : 0);
      let nh = this.arrastre.h0 + (t.dh ? t.dh * dy : 0);
      if (nw < MINIMO) { nw = MINIMO; nx = this.arrastre.x0 + this.arrastre.w0 - MINIMO; }
      if (nh < MINIMO) { nh = MINIMO; ny = this.arrastre.y0 + this.arrastre.h0 - MINIMO; }
      if (t.dx) el.x = this.ajustar(nx, e.altKey);
      if (t.dy) el.y = this.ajustar(ny, e.altKey);
      if (t.dw) el.ancho = Math.round(this.ajustar(nw, e.altKey));
      if (t.dh) el.alto = Math.round(this.ajustar(nh, e.altKey));
    }
    this.repintar();
    this.op.alCambiar?.(el, true);        // true = sigue arrastrando
  }

  // Imantar a la rejilla, salvo que se tenga Alt pulsado (la escapatoria de
  // siempre para colocar algo a mano).
  ajustar(v, sinImantar) {
    if (!this.imantar || sinImantar) return Math.round(v);
    return Math.round(v / M.REJILLA) * M.REJILLA;
  }

  // Suelta el elemento donde este, sin aplicar mas movimiento. Se usa al perder
  // el foco: mejor dejarlo donde estaba que darle un salto al volver.
  cancelarArrastre() {
    if (!this.arrastre) return;
    this.arrastre = null;
    this.op.alCambiar?.(null, false);
  }

  desconectar() {
    window.removeEventListener("mousemove", this._alMoverVentana);
    window.removeEventListener("mouseup", this._alSoltarVentana);
    window.removeEventListener("blur", this._alPerderFoco);
    this._latiendo = false;
    this.arrastre = null;
  }

  alSoltar() {
    if (!this.arrastre) return;
    const el = (this.diseno.elementos || []).find(x => x.id === this.arrastre.id);
    this.arrastre = null;
    if (el) this.op.alCambiar?.(el, false);
  }

  // Cursor y coordenadas del pie.
  alMoverEncima(e) {
    const { px, py } = this.posicionEnCanvas(e);
    const { x, y } = this.aLogico(px, py);
    this.op.alMoverRaton?.({ x: Math.floor(x), y: Math.floor(y) });

    if (this.arrastre) return;
    const el = this.elementoElegido();
    if (el && this.redimensionable(el)) {
      const r = this.rectanguloPantalla(el);
      for (const t of TIRADORES) {
        const p = this.puntoTirador(r, t);
        if (Math.abs(px - p.x) <= TIRADOR && Math.abs(py - p.y) <= TIRADOR) {
          this.canvas.style.cursor = CURSORES[t.id];
          return;
        }
      }
    }
    this.canvas.style.cursor = this.elementoEn(px, py) ? "move" : "default";
  }

  // Mover con las flechas: 1 pixel, o un paso de rejilla con Shift.
  empujar(dx, dy, paso) {
    const el = this.elementoElegido();
    if (!el) return false;
    this.op.antesDeCambiar?.("empujar:" + el.id);
    el.x = M.num(el.x, 0) + dx * paso;
    el.y = M.num(el.y, 0) + dy * paso;
    this.repintar();
    this.op.alCambiar?.(el, false);
    return true;
  }
}
