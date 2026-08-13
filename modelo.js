//=============================================================================
// El modelo del diseño: tipos, valores por defecto, animacion y guardado.
//
// CUIDADO AL TOCAR ESTE FICHERO
//   Las curvas de suavizado y la manera de resolver el valor de una propiedad
//   estan PORTADAS de Ruby, de Plugins/[LBDS] Interfaces/[001] Suavizado.rb y
//   [003] Elementos.rb. Si las dos implementaciones se separan, el editor
//   enseñaria una animacion y el juego haria otra, que es el peor fallo posible
//   en una herramienta como esta: dejaria de ser fiable.
//
//   Igual con las constantes de abajo: son las de [000] Settings.rb.
//=============================================================================

// ---- Constantes, espejo de [000] Settings.rb ----
export const LIENZO_ANCHO = 512;
export const LIENZO_ALTO = 384;
export const REJILLA = 8;
export const TEXTO_TAMANO = 14;
export const TEXTO_COLOR = "#FFFFFF";
export const TEXTO_SOMBRA = "#404040";
export const ENTRADA_DURACION = 0.25;
export const SUAVIZADO_DEFECTO = "suave";
export const DESLIZA_DISTANCIA = 32;

export const BOTON_COLOR = "#3C6E9BFF";
export const BOTON_COLOR_ENCIMA = "#5A96C8FF";
export const BOTON_COLOR_PULSADO = "#28506FFF";

export const TIPOS = ["ventana", "imagen", "texto", "boton", "panel", "animado", "barra", "pokemon"];

// El marco por defecto es el del SISTEMA, o sea el que el jugador tenga elegido en
// Opciones. El editor no puede saber cual es, asi que enseña el primero de la
// lista de Essentials (MENU_WINDOWSKINS[0]) para hacerse una idea.
export const MARCO_DEFECTO = "choice 1";

// QUE FORMATO TIENE UN MARCO, POR SU TAMAÑO.
//
// La carpeta Windowskins mezcla tres cosas muy distintas, y solo dos son marcos
// de ventana. Se clasifica igual que el motor (mirar __setWindowskin en los
// scripts del juego), que decide por las medidas y nada mas:
//
//   3x3     cuadrado y divisible entre 3 -> nueve piezas. Son los "choice N",
//           los 28 que Essentials declara como marcos de menu.
//   clasico 192x128 o 128x128 -> windowskin de RPG Maker XP o VX. Otra
//           distribucion completamente: el fondo va aparte del borde.
//   ninguno todo lo demas: bocadillos de dialogo y carteles de señal. NO son
//           marcos de ventana y dibujarlos como tal sale deforme.
export function formatoMarco(ancho, alto) {
  if (!ancho || !alto) return "ninguno";
  if (ancho === alto && ancho % 3 === 0) return "3x3";
  if ((ancho === 192 && alto === 128) || (ancho === 128 && alto === 128)) return "clasico";
  return "ninguno";
}
export const ALINEACIONES = ["izquierda", "centro", "derecha"];
export const VERTICALES = ["arriba", "centro", "abajo"];

// La muestra con la que se mide donde cae la tinta de la letra. Tiene que ser LA
// MISMA que MUESTRA_METRICA en [003] Elementos.rb: si no, el editor y el juego
// centrarian los textos a alturas distintas.
export const MUESTRA_METRICA = "AXgy";

// Velocidades con nombre para las animaciones de entrada. La casilla de segundos
// sigue estando para afinar; esto es para no tener que adivinar que numero
// corresponde a "que salga despacito".
export const SEGUNDOS_VELOCIDAD = {
  "muy lento": 1.6,
  "lento": 0.9,
  "normal": 0.25,
  "rapido": 0.15,
  "muy rapido": 0.08,
  "a medida": null
};
export const VELOCIDADES = Object.keys(SEGUNDOS_VELOCIDAD);

// Que nombre le pega a esta duracion. Si no cae cerca de ninguno, "a medida".
export function velocidadDe(segundos) {
  for (const nombre of VELOCIDADES) {
    const s = SEGUNDOS_VELOCIDAD[nombre];
    if (s != null && Math.abs(s - segundos) < 0.005) return nombre;
  }
  return "a medida";
}

export const PROPIEDADES = ["x", "y", "opacidad", "zoom", "angulo"];
export const EFECTOS = ["aparece", "desde_arriba", "desde_abajo", "desde_izquierda", "desde_derecha", "crece", "gira"];
export const SUAVIZADOS = ["lineal", "suave", "entra_suave", "sale_suave", "golpe", "rebote", "elastico"];

export const ACCIONES = [
  { valor: "nada",                 texto: "No hacer nada" },
  { valor: "ir_a_interfaz",        texto: "Ir a otra pantalla" },
  { valor: "interruptor_interfaz", texto: "Ir a la pantalla de un interruptor" },
  { valor: "cerrar",               texto: "Cerrar esta pantalla" },
  { valor: "abrir_interfaz",       texto: "Abrir otra encima (aviso)" },
  { valor: "abrir_mochila",  texto: "Abrir la mochila" },
  { valor: "abrir_equipo",   texto: "Abrir el equipo" },
  { valor: "abrir_pokedex",  texto: "Abrir la Pokedex" },
  { valor: "abrir_guardar",  texto: "Abrir guardar partida" },
  { valor: "abrir_ficha",    texto: "Abrir la ficha de entrenador" },
  { valor: "abrir_mapa",     texto: "Abrir el mapa de la region" },
  { valor: "abrir_pokegear", texto: "Abrir el Pokegear" },
  { valor: "abrir_opciones", texto: "Abrir las Opciones" },
  { valor: "interruptor",    texto: "Cambiar un interruptor" },
  { valor: "variable",       texto: "Cambiar una variable" },
  { valor: "sonido",         texto: "Sonar un efecto" },
  { valor: "script",         texto: "Ejecutar codigo Ruby" }
];

// Como se llaman las cosas en el editor. Sin jerga: nadie tiene que saber lo que
// es un z-index ni un easing para cuadrar una pantalla.
export const NOMBRE_TIPO = {
  imagen: "Imagen", texto: "Texto", boton: "Boton", panel: "Rectangulo", animado: "Animacion",
  barra: "Barra", pokemon: "Pokemon", ventana: "Ventana"
};

export const MODOS_POKEMON = ["icono", "frente", "espalda"];

// Comparadores de las condiciones. Espejo de Datos::COMPARADORES en Ruby.
export const COMPARADORES = [
  { valor: "es",            texto: "es igual a" },
  { valor: "no_es",         texto: "no es igual a" },
  { valor: "mayor_que",     texto: "es mayor que" },
  { valor: "menor_que",     texto: "es menor que" },
  { valor: "mayor_o_igual", texto: "es mayor o igual que" },
  { valor: "menor_o_igual", texto: "es menor o igual que" },
  { valor: "contiene",      texto: "contiene el texto" },
  { valor: "existe",        texto: "existe (no esta vacio)" }
];

//=============================================================================
// DE QUE VA UNA CONDICION.
//
// El fichero solo guarda un dato y un comparador, que es lo justo para el motor.
// Pero para EDITARLA hace falta saber de que trata, porque cada caso se rellena
// distinto: un interruptor solo esta encendido o apagado, un boton se elige de
// una lista, una variable pide un numero.
//
// Se deduce del propio dato en vez de guardar un campo extra en el fichero. Asi
// una condicion escrita a mano (o por una version anterior) se sigue editando
// bien, y el .json no engorda con informacion que solo le sirve al editor.
//=============================================================================
export const CLASES_CONDICION = [
  { valor: "boton",       texto: "Cuando este elegido un boton" },
  { valor: "interruptor", texto: "Un interruptor del juego" },
  { valor: "variable",    texto: "Una variable del juego" },
  { valor: "dato",        texto: "Otro dato del juego (a mano)" }
];

export function claseCondicion(cond) {
  const d = String((cond && cond.dato) || "");
  if (/^\{?seleccion/.test(d)) return "boton";
  if (/^\{?interruptor\./.test(d)) return "interruptor";
  if (/^\{?variable\./.test(d)) return "variable";
  return "dato";
}

// Una condicion recien elegida, ya rellena con algo que se cumple de verdad. Una
// condicion a medias (sin comparador, o sin dato) es la que no se cumple nunca y
// deja a alguien mirando una pantalla vacia sin saber por que.
export function condicionNueva(clase, idBoton) {
  switch (clase) {
    case "boton":       return { dato: "{seleccion." + (idBoton || "boton") + "}", es: 1 };
    case "interruptor": return { dato: "{interruptor.1}", es: 1 };
    case "variable":    return { dato: "{variable.1}", mayor_o_igual: 1 };
    default:            return { dato: "{equipo.1.nombre}", existe: true };
  }
}

// Que comparador usa una condicion, o null si ninguno.
export function comparadorDe(cond) {
  if (!cond || typeof cond !== "object") return null;
  for (const c of COMPARADORES) if (c.valor in cond) return c.valor;
  return null;
}

// Como se lee una condicion en cristiano, para la lista de capas y el inspector.
//
// Se traducen los tres casos comunes a lenguaje normal en vez de enseñar el dato
// crudo: "si el interruptor 45 esta activado" se entiende, "si interruptor.45 es
// igual a 1" hay que descifrarlo.
export function resumenCondicion(cond) {
  if (!cond) return "";
  const c = comparadorDe(cond);
  if (!c) return "condicion sin terminar";
  const dato = String(cond.dato || "?").replace(/^{|}$/g, "");

  const clase = claseCondicion(cond);
  if (clase === "boton") {
    const cual = dato.replace(/^seleccion\.?/, "");
    const quien = cual ? `"${cual}"` : "el mismo";
    const negada = (c === "no_es");
    if (!cual) {
      // {seleccion} comparado con {n}: cada copia mira su propia seleccion.
      return negada ? "cuando NO esta elegida esta copia" : "cuando esta elegida esta copia";
    }
    return negada ? `cuando ${quien} NO esta elegido` : `cuando ${quien} esta elegido`;
  }
  if (clase === "interruptor") {
    const n = dato.replace(/[^0-9]/g, "");
    const apagado = (c === "es") && num(cond.es, 1) === 0;
    return `si el interruptor ${n} esta ${apagado ? "apagado" : "activado"}`;
  }
  if (clase === "variable") {
    const n = dato.replace(/[^0-9]/g, "");
    const texto = (COMPARADORES.find(x => x.valor === c) || {}).texto || c;
    return `si la variable ${n} ${texto} ${cond[c]}`;
  }

  if (c === "existe") return cond.existe ? `si ${dato} existe` : `si ${dato} NO existe`;
  const texto = (COMPARADORES.find(x => x.valor === c) || {}).texto || c;
  return `si ${dato} ${texto} ${cond[c]}`;
}

// Lo que se ve cuando un dato no se puede saber. Igual que Datos::HUECO en Ruby.
export const HUECO = "---";

//-----------------------------------------------------------------------------
// ¿SE CUMPLE ESTA CONDICION? Espejo de Datos.cumple? en [007] Datos.rb.
//
// Vive aqui para que la use tanto el lienzo del editor como la vista previa de
// tools/ver-interfaz.mjs, y sobre todo para que se pueda probar: si el editor y
// el juego no esconden lo mismo, el editor enseña cosas que en el juego no
// estan, que es justo el fallo que se arreglo escribiendo esto.
//
// "valorDeDato" recibe la clave ya sin llaves y devuelve el valor en texto.
//-----------------------------------------------------------------------------
export function cumpleCondicion(cond, valorDeDato) {
  if (!cond || typeof cond !== "object") return true;
  const clave = String(cond.dato == null ? "" : cond.dato).trim().replace(/^\{|\}$/g, "");
  if (!clave) return true;
  const izq = valorDeDato ? valorDeDato(clave) : HUECO;

  // "existe" es el unico que mira el hueco: todo lo demas compara valores.
  if ("existe" in cond) {
    const hay = !(izq == null || izq === HUECO || String(izq) === "");
    return cond.existe ? hay : !hay;
  }

  const c = comparadorDe(cond);
  if (!c) return true;
  const der = cond[c];
  // Si los dos lados parecen numeros se comparan como numeros; si no, como
  // texto. Asi "3" y 3 son lo mismo, que es lo que espera cualquiera.
  const a = parseFloat(izq), b = parseFloat(der);
  const numeros = Number.isFinite(a) && Number.isFinite(b) &&
                  String(izq).trim() !== "" && String(der).trim() !== "";
  switch (c) {
    case "es":            return numeros ? a === b : String(izq) === String(der);
    case "no_es":         return numeros ? a !== b : String(izq) !== String(der);
    case "mayor_que":     return numeros && a > b;
    case "menor_que":     return numeros && a < b;
    case "mayor_o_igual": return numeros && a >= b;
    case "menor_o_igual": return numeros && a <= b;
    case "contiene":      return String(izq).includes(String(der));
  }
  return true;
}

export const NOMBRE_PROPIEDAD = {
  x: "Posicion X", y: "Posicion Y", opacidad: "Transparencia", zoom: "Tamaño", angulo: "Giro"
};

//=============================================================================
// Curvas de suavizado. Portadas de [001] Suavizado.rb, con los mismos
// coeficientes de Penner. Reciben t de 0 a 1 y pueden devolver fuera de 0..1
// (eso es lo que da vida a "golpe" y "rebote").
//=============================================================================
const GOLPE_FUERZA = 1.70158;
const REBOTE_N = 7.5625;
const REBOTE_D = 2.75;
const ELASTICO_PERIODO = (2 * Math.PI) / 3;

export function suavizar(nombre, t) {
  if (t < 0) t = 0;
  if (t > 1) t = 1;
  switch (nombre) {
    case "suave":
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    case "entra_suave":
      return t * t * t;
    case "sale_suave":
      return 1 - Math.pow(1 - t, 3);
    case "golpe": {
      const c1 = GOLPE_FUERZA, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
    case "rebote": {
      const n = REBOTE_N, d = REBOTE_D;
      let u = t;
      if (u < 1 / d) return n * u * u;
      if (u < 2 / d) { u -= 1.5 / d; return n * u * u + 0.75; }
      if (u < 2.5 / d) { u -= 2.25 / d; return n * u * u + 0.9375; }
      u -= 2.625 / d; return n * u * u + 0.984375;
    }
    case "elastico":
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ELASTICO_PERIODO) + 1;
    default:
      return t;                                     // lineal
  }
}

//=============================================================================
// Valores de reposo y animacion. Espejo de Elemento#valor_de en Ruby.
//=============================================================================
export function reposo(el) {
  return {
    x: num(el.x, 0),
    y: num(el.y, 0),
    opacidad: num(el.opacidad, 255),
    zoom: num(el.zoom, 1),
    angulo: num(el.angulo, 0)
  };
}

// Los tweens del efecto de entrada, igual que preparar_entrada en Ruby.
export function tweensEntrada(el) {
  const ent = el.entrada;
  if (!ent || typeof ent !== "object") return {};
  const base = reposo(el);
  const dur = num(ent.duracion, ENTRADA_DURACION);
  const curva = ent.suavizado || SUAVIZADO_DEFECTO;
  const retraso = num(ent.retraso, 0);
  const dist = num(ent.distancia, DESLIZA_DISTANCIA);
  const tw = {};
  const mk = (desde, hasta) => ({ desde, hasta, dur, curva, retraso });

  switch (ent.efecto) {
    case "desde_arriba":     tw.y = mk(base.y - dist, base.y); break;
    case "desde_abajo":      tw.y = mk(base.y + dist, base.y); break;
    case "desde_izquierda":  tw.x = mk(base.x - dist, base.x); break;
    case "desde_derecha":    tw.x = mk(base.x + dist, base.x); break;
    case "crece":            tw.zoom = mk(0, base.zoom); break;
    case "gira":             tw.angulo = mk(base.angulo - 180, base.angulo); break;
  }
  // Todos aparecen ademas, igual que en el motor.
  tw.opacidad = mk(0, base.opacidad);
  return tw;
}

function valorTween(tw, t) {
  const u = t - tw.retraso;
  if (u <= 0) return tw.desde;
  if (tw.dur <= 0 || u >= tw.dur) return tw.hasta;
  return tw.desde + (tw.hasta - tw.desde) * suavizar(tw.curva, u / tw.dur);
}

function tweenTerminado(tw, t) {
  return (t - tw.retraso) >= tw.dur;
}

// Espejo de Pista#valor: cada clave lleva el suavizado con el que se LLEGA a ella.
export function valorPista(pista, t) {
  const claves = (pista.claves || []).slice().sort((a, b) => num(a.t, 0) - num(b.t, 0));
  if (!claves.length) return null;
  const total = num(claves[claves.length - 1].t, 0);
  let u = t;
  if (pista.bucle && total > 0) u = u % total;
  else if (u >= total) return num(claves[claves.length - 1].valor, 0);
  if (u <= 0) return num(claves[0].valor, 0);

  let anterior = claves[0];
  for (const clave of claves) {
    const ct = num(clave.t, 0);
    if (ct >= u) {
      const hueco = ct - num(anterior.t, 0);
      if (hueco <= 0) return num(clave.valor, 0);
      const local = (u - num(anterior.t, 0)) / hueco;
      const avance = suavizar(clave.suavizado || SUAVIZADO_DEFECTO, local);
      const desde = num(anterior.valor, 0);
      const hasta = num(clave.valor, 0);
      return desde + (hasta - desde) * avance;
    }
    anterior = clave;
  }
  return num(claves[claves.length - 1].valor, 0);
}

// El valor de una propiedad en el instante t. Manda la entrada mientras dura,
// luego la pista, y si no hay nada el reposo. Igual que en Ruby.
export function valorDe(el, propiedad, t) {
  const base = reposo(el);
  const tw = tweensEntrada(el)[propiedad];
  if (tw && !tweenTerminado(tw, t)) return valorTween(tw, t);
  const pista = (el.animaciones || []).find(p => p.propiedad === propiedad);
  if (pista) {
    const v = valorPista(pista, t);
    if (v != null) return v;
  }
  if (tw) return valorTween(tw, t);
  return base[propiedad];
}

// Cuanto dura la animacion mas larga del diseño, para la linea de tiempo.
export function duracionDiseno(diseno) {
  let max = 1;
  for (const el of diseno.elementos || []) {
    const tw = tweensEntrada(el);
    for (const k of Object.keys(tw)) max = Math.max(max, tw[k].retraso + tw[k].dur);
    for (const p of el.animaciones || []) {
      for (const c of p.claves || []) max = Math.max(max, num(c.t, 0));
    }
  }
  return Math.ceil(max * 2) / 2;                    // redondeado a medio segundo
}

//=============================================================================
// GEOMETRIA: donde esta un elemento y si un punto cae dentro.
//
// ESPEJO DE Elemento#actualizar Y Boton#contiene? EN RUBY. Vive aqui y no en el
// lienzo por dos motivos: el lienzo necesita el DOM y no se puede probar sin
// navegador, y estas cuentas son EXACTAMENTE las que tienen que coincidir con el
// motor. Si se separan, el editor enseña un boton en un sitio y el juego lo deja
// pulsable en otro, que es el peor fallo posible en una herramienta asi.
//
// LA REGLA: la x,y del diseño es la esquina de arriba a la izquierda, pero el
// GIRO y el ZOOM trabajan sobre el CENTRO. Girar desde una esquina manda al
// elemento describiendo un arco, y crecer desde una esquina lo empuja hacia
// abajo y a la derecha en vez de hincharlo en su sitio.
//=============================================================================

// La caja que ocupa algo de w x h puesto en x,y con ese zoom.
export function cajaConZoom(x, y, w, h, zoom) {
  const z = zoom == null ? 1 : zoom;
  return { x: x + (w - w * z) / 2, y: y + (h - h * z) / 2, w: w * z, h: h * z };
}

// De un punto de la caja SIN girar a donde se ve de verdad. RGSS gira en sentido
// antihorario, que con la y hacia abajo es la matriz [[cos, sen], [-sen, cos]].
export function girarPunto(caja, ang, px, py) {
  if (!ang) return { x: px, y: py };
  const a = ang * Math.PI / 180;
  const cx = caja.x + caja.w / 2, cy = caja.y + caja.h / 2;
  const dx = px - cx, dy = py - cy;
  return { x: cx + (dx * Math.cos(a)) + (dy * Math.sin(a)),
           y: cy - (dx * Math.sin(a)) + (dy * Math.cos(a)) };
}

// Y la vuelta, que es su inversa. ESTA es la que hace Boton#contiene? en Ruby
// para saber si el raton cayo sobre un boton girado.
export function desgirarPunto(caja, ang, px, py) {
  if (!ang) return { x: px, y: py };
  const a = ang * Math.PI / 180;
  const cx = caja.x + caja.w / 2, cy = caja.y + caja.h / 2;
  const dx = px - cx, dy = py - cy;
  return { x: cx + (dx * Math.cos(a)) - (dy * Math.sin(a)),
           y: cy + (dx * Math.sin(a)) + (dy * Math.cos(a)) };
}

export function dentroDeCaja(caja, ang, px, py) {
  const p = desgirarPunto(caja, ang, px, py);
  return p.x >= caja.x && p.x <= caja.x + caja.w &&
         p.y >= caja.y && p.y <= caja.y + caja.h;
}

//=============================================================================
// REPETICIONES. Espejo del modulo Repeticiones de [002] Lector.rb.
//
// El editor EDITA la lista de origen (un elemento por grupo) pero DIBUJA la lista
// expandida, que es lo que se vera en el juego. Si solo dibujara el origen,
// estarias colocando una ficha a ciegas sin ver si las seis caben.
//
// Cada copia lleva _origen con el id del elemento del que salio, para que al
// pulsar la tercera copia se seleccione el elemento de verdad y no una copia que
// no existe en el fichero.
//=============================================================================
export const TOPE_REPETICIONES = 60;

export function expandirRepeticiones(diseno, valorDeDato) {
  const declaradas = diseno && diseno.repeticiones;
  const elementos = (diseno && diseno.elementos) || [];
  if (!declaradas || typeof declaradas !== "object" || !Object.keys(declaradas).length) {
    return elementos.map(el => ({ ...el, _origen: el.id }));
  }

  const salida = [];
  for (const el of elementos) {
    const nombre = el.repetir;
    const regla = nombre ? declaradas[nombre] : null;
    if (!regla || typeof regla !== "object") {
      salida.push({ ...el, _origen: el.id });
      continue;
    }
    let n = typeof regla.cuantos === "string"
      ? parseInt(valorDeDato ? valorDeDato(regla.cuantos) : "0", 10) || 0
      : num(regla.cuantos, 0);
    if (n > TOPE_REPETICIONES) n = TOPE_REPETICIONES;
    if (n <= 0) continue;

    const dx = num(regla.salto_x, 0), dy = num(regla.salto_y, 0);
    const porFila = num(regla.por_fila, 0);
    const saltoFilaY = regla.salto_fila_y == null ? dy : num(regla.salto_fila_y, 0);
    const saltoFilaX = num(regla.salto_fila_x, 0);
    const retraso = num(regla.retraso, 0);

    for (let i = 1; i <= n; i++) {
      const col = porFila > 0 ? (i - 1) % porFila : (i - 1);
      const fila = porFila > 0 ? Math.floor((i - 1) / porFila) : 0;
      const copia = sustituirN({ ...JSON.parse(JSON.stringify(el)) }, i);
      copia.id = el.id + "_" + i;
      copia._origen = el.id;
      copia._copia = i;                 // igual que en Ruby: lo usa {seleccion}
      copia.x = num(el.x, 0) + dx * col + saltoFilaX * fila;
      copia.y = num(el.y, 0) + (porFila > 0 ? 0 : dy * col) + saltoFilaY * fila;
      delete copia.repetir;
      if (retraso > 0 && copia.entrada) {
        copia.entrada.retraso = num(copia.entrada.retraso, 0) + retraso * (i - 1);
      }
      salida.push(copia);
    }
  }
  return salida;
}

function sustituirN(o, i) {
  if (typeof o === "string") return o.split("{n}").join(String(i));
  if (Array.isArray(o)) return o.map(v => sustituirN(v, i));
  if (o && typeof o === "object") {
    for (const k of Object.keys(o)) o[k] = sustituirN(o[k], i);
    return o;
  }
  return o;
}

//=============================================================================
// Crear elementos nuevos con valores que ya se vean sin tocar nada.
//=============================================================================
export function elementoNuevo(tipo, id, x, y) {
  const el = { id, tipo, capa: 10, x, y };
  switch (tipo) {
    case "imagen":
      el.imagen = "";
      break;
    case "texto":
      el.texto = "Texto nuevo";
      el.tamano = TEXTO_TAMANO;
      el.color = TEXTO_COLOR;
      el.sombra = TEXTO_SOMBRA;
      el.alineacion = "izquierda";
      break;
    case "boton":
      el.ancho = 120; el.alto = 28;
      el.texto = "Boton";
      el.tamano = TEXTO_TAMANO;
      el.color = BOTON_COLOR;
      el.color_encima = BOTON_COLOR_ENCIMA;
      el.color_pulsado = BOTON_COLOR_PULSADO;
      el.accion = { tipo: "cerrar" };
      break;
    case "panel":
      el.ancho = 120; el.alto = 60;
      el.color = "#16202CF0";
      break;
    case "animado":
      el.imagen = "";
      el.fotogramas = 1; el.velocidad = 2; el.bucle = true;
      break;
    case "ventana":
      el.ancho = 200; el.alto = 120;
      el.capa = 0;                      // el marco va detras de lo que lleve dentro
      break;
    case "barra":
      el.ancho = 96; el.alto = 8;
      el.valor = "{equipo.1.hp}";
      el.maximo = "{equipo.1.hp_max}";
      el.por_tramos = true;
      el.color_fondo = "#20242BFF";
      break;
    case "pokemon":
      el.cual = 1;
      el.modo = "icono";
      break;
  }
  return el;
}

export function disenoNuevo(nombre) {
  return {
    version: 1,
    nombre,
    titulo: "",
    lienzo: { ancho: LIENZO_ANCHO, alto: LIENZO_ALTO },
    oscurecer_mapa: 0,
    aperturas: {},
    elementos: []
  };
}

//=============================================================================
// Aperturas: como se abre una pantalla dentro del juego.
//=============================================================================

// Ordenes que ya usa el menu de pausa de Essentials. Los de en medio (35, 45...)
// son los que quedan libres.
export const ORDEN_DEFECTO = 35;
export const ORDENES_OCUPADOS = {
  10: "Pokedex", 20: "Pokemon", 30: "Mochila", 40: "Mapa / Pokegear",
  50: "Ficha", 60: "Guardar", 70: "Opciones", 80: "Debug", 90: "Salir"
};

// Espejo de TECLAS_PROHIBIDAS en [000] Settings.rb: las que ya usa el juego.
export const TECLAS_PROHIBIDAS = ["Z", "X", "C", "A", "S", "D", "RETURN", "ESCAPE",
  "SPACE", "UP", "DOWN", "LEFT", "RIGHT", "LSHIFT", "RSHIFT", "LCTRL", "RCTRL",
  "F1", "F5", "F8", "F12"];

// Solo letras y las F libres. Se dejan fuera los numeros y las teclas raras
// aposta: sus nombres cambian de un motor a otro y no estan comprobados en este
// build, y una tecla que no responde sin decir por que es de lo peor que hay.
// Si alguna letra tampoco valiera, el juego la apaga sola y lo apunta.
export const TECLAS = ["", ..."BEFGHIJKLMNOPQRTUVWY".split(""),
  "F2", "F3", "F4", "F6", "F7"]
  .filter(t => !TECLAS_PROHIBIDAS.includes(t));

//=============================================================================
// LAS PANTALLAS QUE YA TRAE EL JUEGO.
//
// Espejo de INTEGRADAS en [000] Settings.rb. Cada una tiene su interruptor, asi
// que se pueden usar igual que las tuyas: un boton puede abrirlas, y si haces
// una pantalla tuya con ese mismo interruptor, LA TUYA GANA y reemplaza a la del
// juego en todas partes (incluido el menu de pausa).
//
// "contenido" dice si la pantalla enseña datos del juego. Importa mucho: una
// pantalla de menu (solo botones) se puede rehacer entera, pero la Mochila
// enseña TUS objetos y esa lista es codigo, no datos. Si la reemplazas te queda
// un marco bonito y vacio. El editor lo avisa antes de que pierdas la tarde.
//=============================================================================
export const INTEGRADAS = {
  mochila:  { titulo: "Mochila",             contenido: "la lista de objetos" },
  equipo:   { titulo: "Equipo Pokemon",      contenido: "tus Pokemon" },
  pokedex:  { titulo: "Pokedex",             contenido: "la lista de especies" },
  guardar:  { titulo: "Guardar partida",     contenido: "los huecos de guardado" },
  ficha:    { titulo: "Ficha de entrenador", contenido: "tus datos y medallas" },
  mapa:     { titulo: "Mapa de la region",   contenido: "el mapa y los pueblos" },
  pokegear: { titulo: "Pokegear",            contenido: "el telefono y la radio" },
  opciones: { titulo: "Opciones",            contenido: "la lista de ajustes" }
};

export function aperturas(diseno) {
  if (!diseno.aperturas || typeof diseno.aperturas !== "object") diseno.aperturas = {};
  return diseno.aperturas;
}

// Como se abre, en una linea legible. Es lo que pinta el mapa de aperturas.
export function resumenAperturas(diseno) {
  const ap = (diseno && diseno.aperturas) || {};
  const formas = [];
  if (ap.menu_pausa) formas.push(`menu de pausa (orden ${num(ap.orden, ORDEN_DEFECTO)})`);
  if (ap.tecla) formas.push(`tecla ${ap.tecla}`);
  if (ap.interruptor) {
    formas.push(INTEGRADAS[ap.interruptor]
      ? `REEMPLAZA a ${INTEGRADAS[ap.interruptor].titulo} del juego`
      : `interruptor "${ap.interruptor}"`);
  }
  if (!formas.length) return "solo desde un evento o el menu de debug";
  return formas.join(" · ");
}

// A donde lleva un interruptor. Misma regla que en Ruby, en un solo sitio:
// manda la pantalla tuya si existe, y si no, la del juego.
export function destinoDeInterruptor(interruptor, catalogo = []) {
  const clave = String(interruptor || "");
  if (!clave) return { tipo: "nada" };
  const propia = catalogo.find(e => (e.aperturas || {}).interruptor === clave);
  if (propia) return { tipo: "interfaz", nombre: propia.nombre };
  if (INTEGRADAS[clave]) return { tipo: "integrada", nombre: clave, titulo: INTEGRADAS[clave].titulo };
  return { tipo: "nada" };
}

// Un id libre a partir del tipo: "boton", "boton_2", "boton_3"...
export function idLibre(diseno, base) {
  const usados = new Set((diseno.elementos || []).map(e => e.id));
  if (!usados.has(base)) return base;
  let n = 2;
  while (usados.has(`${base}_${n}`)) n++;
  return `${base}_${n}`;
}

//=============================================================================
// Guardado.
//
// Se escribe con un ORDEN DE CLAVES FIJO en vez de dejar que JSON.stringify use
// el orden de insercion. Asi el fichero de una pantalla no se reordena solo al
// editarla, y los diffs de git enseñan lo que cambio de verdad y no un baile de
// lineas.
//=============================================================================
const ORDEN = ["id", "tipo", "repetir", "capa", "x", "y", "ancho", "alto",
  "imagen", "imagen_encima", "imagen_pulsado",
  "fotogramas", "ancho_fotograma", "alto_fotograma", "velocidad", "bucle",
  "marco",
  "imagen_fondo", "tramos_imagen",
  "valor", "maximo", "por_tramos", "color_fondo", "color_medio", "color_bajo", "hacia",
  "cual", "modo",
  "texto", "tamano", "color", "sombra", "color_texto",
  "color_encima", "color_pulsado", "borde", "borde_encima", "borde_pulsado", "borde_grosor",
  "alineacion", "alineacion_vertical", "desplazar_y", "contorno",
  "opacidad", "zoom", "angulo", "visible", "sonido",
  "escala_encima", "escala_pulsado",
  "mostrar_si",
  "orden_teclado", "tecla", "sigue_seleccion", "cursor_x", "cursor_y",
  "accion", "entrada", "animaciones"];

function ordenarClaves(el) {
  const salida = {};
  for (const k of ORDEN) if (el[k] !== undefined) salida[k] = el[k];
  for (const k of Object.keys(el)) if (salida[k] === undefined) salida[k] = el[k];
  return salida;
}

export function escribirJSON(diseno) {
  const salida = {
    version: 1,
    nombre: diseno.nombre,
    lienzo: diseno.lienzo || { ancho: LIENZO_ANCHO, alto: LIENZO_ALTO },
    oscurecer_mapa: num(diseno.oscurecer_mapa, 0)
  };
  if (diseno.titulo) salida.titulo = diseno.titulo;
  // Solo se escribe si esta APAGADO: va puesto por defecto, y un "teclado: true"
  // en cada fichero seria ruido.
  if (diseno.teclado === false) salida.teclado = false;
  if (diseno.repeticiones && Object.keys(diseno.repeticiones).length) {
    salida.repeticiones = diseno.repeticiones;
  }
  if (diseno.pantalla_completa) {
    salida.pantalla_completa = true;
    if (diseno.color_fondo) salida.color_fondo = diseno.color_fondo;
  }

  // Solo se escribe el bloque de aperturas si dice algo, para que un diseño que
  // se abre solo por script no lleve un objeto vacio de adorno.
  const ap = diseno.aperturas || {};
  const limpio = {};
  if (ap.menu_pausa) { limpio.menu_pausa = true; limpio.orden = num(ap.orden, ORDEN_DEFECTO); }
  if (ap.tecla) limpio.tecla = String(ap.tecla).toUpperCase();
  if (ap.interruptor) limpio.interruptor = String(ap.interruptor);
  if (Object.keys(limpio).length) salida.aperturas = limpio;

  salida.elementos = (diseno.elementos || []).map(ordenarClaves);
  return JSON.stringify(salida, null, 2) + "\n";
}

//=============================================================================
// Comprobaciones. Las mismas que hace el Lector en Ruby, para enterarse aqui y
// no despues de arrancar el juego.
//=============================================================================
// `otros` es la lista de los demas diseños, {nombre, aperturas}, para poder
// avisar de cosas que solo se ven mirando el conjunto: dos pantallas peleandose
// por la misma tecla, o un boton que apunta a un interruptor que nadie tiene.
export function revisar(diseno, otros = []) {
  const avisos = [];
  const vistos = new Map();

  const ap = diseno.aperturas || {};
  if (ap.tecla && TECLAS_PROHIBIDAS.includes(String(ap.tecla).toUpperCase())) {
    avisos.push(`La tecla ${ap.tecla} ya la usa el juego: elige otra`);
  }
  // MISMO criterio que el Lector en Ruby: cualquier multiplo de 10 esta reservado
  // para las entradas del juego. Antes el editor solo avisaba de los nueve numeros
  // que conoce por su nombre, asi que un 100 pasaba aqui y saltaba en el juego, que
  // es exactamente el descuadre que esta herramienta no se puede permitir.
  if (ap.menu_pausa) {
    const o = num(ap.orden, ORDEN_DEFECTO);
    if (o % 10 === 0) {
      const quien = ORDENES_OCUPADOS[o];
      avisos.push(quien
        ? `El orden ${o} del menu de pausa lo ocupa "${quien}": usa 35, 45, 55...`
        : `El orden ${o} es multiplo de 10 y esos los reserva el juego: usa 35, 45, 55...`);
    }
  }
  if (ap.menu_pausa && !diseno.titulo) {
    avisos.push("Sale en el menu de pausa pero no tiene titulo: se vera el nombre del fichero");
  }
  for (const o of otros) {
    if (o.nombre === diseno.nombre) continue;
    const oap = o.aperturas || {};
    if (ap.tecla && oap.tecla && String(ap.tecla).toUpperCase() === String(oap.tecla).toUpperCase()) {
      avisos.push(`La tecla ${ap.tecla} tambien la pide "${o.nombre}": solo funcionara una`);
    }
    if (ap.interruptor && oap.interruptor && ap.interruptor === oap.interruptor) {
      avisos.push(`El interruptor "${ap.interruptor}" tambien lo tiene "${o.nombre}": solo se abrira una`);
    }
  }

  // Interruptores a los que apunta algun boton pero que no recoge nadie. Cuentan
  // como recogidos los de las pantallas del juego: apuntar a "mochila" es
  // perfectamente valido aunque no tengas una mochila propia.
  const conocidos = new Set(otros.map(o => (o.aperturas || {}).interruptor).filter(Boolean));
  if (ap.interruptor) conocidos.add(ap.interruptor);
  for (const k of Object.keys(INTEGRADAS)) conocidos.add(k);
  for (const el of diseno.elementos || []) {
    const a = el.accion;
    if (a && a.tipo === "interruptor_interfaz" && a.nombre && !conocidos.has(a.nombre)) {
      avisos.push(`"${el.id}" activa el interruptor "${a.nombre}" pero ninguna pantalla se abre con el`);
    }
    if (a && a.tipo === "ir_a_interfaz" && !a.interfaz) {
      avisos.push(`"${el.id}" dice ir a otra pantalla pero no dice a cual`);
    }
  }

  // Dos botones con la misma tecla rapida: solo respondera uno, y desde el
  // editor eso se ve como "esta tecla no hace nada".
  const porTecla = new Map();
  for (const el of diseno.elementos || []) {
    if (el.tipo !== "boton" || !el.tecla) continue;
    const t = String(el.tecla).toUpperCase();
    if (porTecla.has(t)) {
      avisos.push(`La tecla ${t} la tienen "${porTecla.get(t)}" y "${el.id}": solo funcionara uno`);
    } else {
      porTecla.set(t, el.id);
    }
    if (TECLAS_PROHIBIDAS.includes(t)) {
      avisos.push(`La tecla ${t} de "${el.id}" ya la usa el juego: elige otra`);
    }
  }

  (diseno.elementos || []).forEach((el, i) => {
    const donde = el.id || `elemento ${i + 1}`;
    if (!el.id) avisos.push(`El elemento ${i + 1} no tiene nombre`);
    else if (vistos.has(el.id)) avisos.push(`Hay dos elementos llamados "${el.id}": los nombres tienen que ser distintos`);
    else vistos.set(el.id, i);

    if (!TIPOS.includes(el.tipo)) avisos.push(`"${donde}" es de un tipo que no existe (${el.tipo})`);

    if (el.tipo === "imagen" && !el.imagen) avisos.push(`"${donde}" es una imagen pero no tiene ninguna puesta`);
    if (el.tipo === "animado" && !el.imagen) avisos.push(`"${donde}" es una animacion pero no tiene imagen`);
    if (el.tipo === "boton") {
      if (!el.accion || !el.accion.tipo || el.accion.tipo === "nada") avisos.push(`"${donde}" es un boton pero no hace nada`);
      if (!el.imagen && (!el.ancho || !el.alto)) avisos.push(`"${donde}" es un boton sin tamaño y sin imagen: no habra nada que pulsar`);
      if (el.accion && el.accion.tipo === "abrir_interfaz" && !el.accion.interfaz) avisos.push(`"${donde}" abre otra interfaz pero no dice cual`);
      if (el.accion && (el.accion.tipo === "interruptor" || el.accion.tipo === "variable") && !(num(el.accion.numero, 0) > 0)) {
        avisos.push(`"${donde}" necesita un numero mayor que 0`);
      }
    }
    if (el.mostrar_si) {
      if (typeof el.mostrar_si !== "object") avisos.push(`La condicion de "${donde}" tiene que ser un objeto`);
      else {
        if (!el.mostrar_si.dato) avisos.push(`"${donde}" tiene una condicion que no dice que dato mira`);
        if (!comparadorDe(el.mostrar_si)) avisos.push(`"${donde}" tiene una condicion sin comparacion`);
        // Una condicion que mira un boton que ya no existe NO da error en el
        // juego: el elemento deja de aparecer y punto. Hay que cazarlo aqui o se
        // convierte en media hora buscando por que algo no sale.
        const m = String(el.mostrar_si.dato || "").match(/^\{seleccion\.([^}]+)\}$/);
        if (m && m[1] !== "id" && !m[1].includes("{n}")) {
          const existe = (diseno.elementos || []).some(e => e.id === m[1] && e.tipo === "boton");
          if (!existe) {
            avisos.push(`"${donde}" se ve solo cuando este elegido "${m[1]}", y no hay ningun boton con ese nombre`);
          }
        }
      }
    }
    for (const p of el.animaciones || []) {
      if (!PROPIEDADES.includes(p.propiedad)) avisos.push(`"${donde}" quiere animar algo que no se puede (${p.propiedad})`);
      if (!p.claves || p.claves.length < 2) avisos.push(`La animacion de ${NOMBRE_PROPIEDAD[p.propiedad] || p.propiedad} en "${donde}" necesita al menos dos claves`);
    }
  });
  return avisos;
}

//=============================================================================
export function num(v, porDefecto) {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : porDefecto;
}
