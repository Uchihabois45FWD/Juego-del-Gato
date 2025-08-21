const elementos = {
  contenedorCeldas: document.getElementById("contenedorCeldas"),
  estadoJuego: document.getElementById("estadoPartida"),
  botonReiniciar: document.getElementById("reiniciar"),
  botonModo: document.getElementById("cambioModo"),
  botonReiniciarEstadisticas: document.getElementById("resetStats")
}
const STORAGE_KEY = "Estadisticas_gato";

const configuracion = {
  condicionesVictoria: [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ],
  jugadores: ["X", "O"],
  jugadorInicial: "X",
  modosJuego: {
    MULTIJUGADOR: "multijugador",
    VS_IA: "vs_IA"
  },
  modoActual: "multijugador",
  jugadorHumano: "X",
  jugadorIA: "O",
};

const estado = {
  tablero: ["", "", "", "", "", "", "", "", ""],
  jugadorActual: configuracion.jugadorInicial,
  enEjecucion: false,
  celdas: [],
  estadisticas: obtenerEstadisticas()
};

function iniciarJuego() {
  estado.celdas = Array.from(
    elementos.contenedorCeldas.getElementsByClassName("celda")
  );

  if (estado.celdas.length !== 9) {
    console.error("Debe haber exactamente 9 celdas en el tablero");
    return;
  }

  estado.celdas.forEach((celda) => {
    celda.addEventListener("click", manejarClickCelda);
  });

  elementos.botonReiniciar.addEventListener("click", reiniciarJuego);
  elementos.botonModo.addEventListener("click", alternarModoJuego)
  actualizarEstadoJuego(`Turno de ${estado.jugadorActual}`);
  estado.enEjecucion = true;
}

function manejarClickCelda() {
  const indiceCelda = parseInt(this.getAttribute("cellIndex"));

  if (!esMovimientoValido(indiceCelda)) return;

  realizarMovimiento(this, indiceCelda);
  verificarResultadoJuego();
}

function esMovimientoValido(indiceCelda) {
  return estado.tablero[indiceCelda] === "" && estado.enEjecucion;
}

function realizarMovimiento(elementoCelda, indice) {
  estado.tablero[indice] = estado.jugadorActual;
  elementoCelda.textContent = estado.jugadorActual;
  elementoCelda.classList.add(`jugador-${estado.jugadorActual}`);
}

function cambiarJugador() {
  estado.jugadorActual =
    estado.jugadorActual === configuracion.jugadores[0]
      ? configuracion.jugadores[1]
      : configuracion.jugadores[0];
  actualizarEstadoJuego(`Turno de ${estado.jugadorActual}`);

  if (configuracion.modoActual === configuracion.modosJuego.VS_IA &&
    estado.jugadorActual === configuracion.jugadorIA &&
    estado.enEjecucion) {
    jugarTurnoIA();
  }
}

function verificarResultadoJuego() {
  if (hayVictoria()) {
    actualizarEstadoJuego(`¡${estado.jugadorActual} gana!`);
    estado.enEjecucion = false;
    resaltarCeldasGanadoras();
    if (configuracion.modoActual === configuracion.modosJuego.VS_IA) {
      if (estado.jugadorActual === configuracion.jugadorHumano) {
        estado.estadisticas.jugador++;
      } else {
        estado.estadisticas.ia++;
      }
      estado.estadisticas.total++;
      guardarEstadisticas();
      actualizarUIEstadisticas();
    }
  } else if (hayEmpate()) {
    actualizarEstadoJuego("EMPATE");
    estado.enEjecucion = false;
    if (configuracion.modoActual === configuracion.modosJuego.VS_IA) {
      estado.estadisticas.empates++;
      estado.estadisticas.total++;
      guardarEstadisticas();
      actualizarUIEstadisticas();
    }
  } else {
    cambiarJugador()
  }
}

function obtenerEstadisticas() {
  try {
    const stastGuardadas = localStorage.getItem(STORAGE_KEY);
    if (stastGuardadas) {
      return JSON.parse(stastGuardadas);
    }
    return {jugador: 0, ia: 0, empates: 0, total: 0};
  } catch (error) {
    console.warn("Error leyendo estadisticas:", error);
    return {jugador: 0, ia: 0, empates: 0, total: 0};
  }
}

function guardarEstadisticas() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado.estadisticas));
  } catch (error) {
    console.error("Error guardando estadisticas:", error);    
  }
}

function actualizarUIEstadisticas() {
  document.getElementById("statsVictorias").textContent = estado.estadisticas.jugador;
  document.getElementById("statsDerrotas").textContent = estado.estadisticas.ia;
  document.getElementById("statsEmpates").textContent = estado.estadisticas.empates;
  document.getElementById("statsTotal").textContent = estado.estadisticas.total;
  
}

function resetearEstadisticas() {
  if (confirm("¿Resetear todas las estadisticas?")) {
    estado.estadisticas = {jugador: 0, ia: 0, empates: 0, total: 0}
    guardarEstadisticas()
    actualizarUIEstadisticas()
  }
}

function hayVictoria() {
  return configuracion.condicionesVictoria.some((condicion) => {
    const [a, b, c] = condicion;
    return (
      estado.tablero[a] &&
      estado.tablero[a] === estado.tablero[b] &&
      estado.tablero[a] === estado.tablero[c]
    );
  });
}

function resaltarCeldasGanadoras() {
  const combinacionGanadora = configuracion.condicionesVictoria.find(
    (condicion) => {
      const [a, b, c] = condicion;
      return (
        estado.tablero[a] &&
        estado.tablero[a] === estado.tablero[b] &&
        estado.tablero[a] === estado.tablero[c]
      );
    }
  );

  if (combinacionGanadora) {
    combinacionGanadora.forEach((indice) => {
      estado.celdas[indice].classList.add("ganadora");
    });
  }
}

function hayEmpate() {
  return !estado.tablero.includes("");
}

function actualizarEstadoJuego(mensaje) {
  elementos.estadoJuego.textContent = mensaje;
}

function reiniciarJuego() {
  estado.jugadorActual = configuracion.jugadorInicial;
  estado.tablero = ["", "", "", "", "", "", "", "", ""];
  estado.enEjecucion = true;
  actualizarEstadoJuego(`Turno de ${estado.jugadorActual}`);

  estado.celdas.forEach((celda) => {
    celda.textContent = "";
    celda.classList.remove("jugador-X", "jugador-O", "ganadora");
  });
}

function obtenerMovimientosValidos() {
  const movimientos = [];
  estado.tablero.forEach((valor, indice) => {
    if (valor === "") {
      movimientos.push(indice);
    }
  });
  return movimientos;
}

function jugarTurnoIA() {
  if (
    !estado.enEjecucion ||
    configuracion.modoActual !== configuracion.modosJuego.VS_IA
  ) {
    return;
  }

  const movimientosValidos = obtenerMovimientosValidos();

  if (movimientosValidos.length === 0) return;

  const indiceAleatorio = Math.floor(Math.random() * movimientosValidos.length);
  const movimiento = movimientosValidos[indiceAleatorio];

  setTimeout(() => {
    if (estado.tablero[movimiento] === "" && estado.enEjecucion) {
      const celda = estado.celdas[movimiento];
      realizarMovimiento(celda, movimiento);
      verificarResultadoJuego();
    }
  }, 600);
}

function alternarModoJuego() {
  if (configuracion.modoActual === configuracion.modosJuego.MULTIJUGADOR) {
    configuracion.modoActual = configuracion.modosJuego.VS_IA;
    elementos.botonModo.textContent = "Modo: VS IA";
    elementos.botonModo.classList.add("modo-ia");
  } else {
    configuracion.modoActual = configuracion.modosJuego.MULTIJUGADOR;
    elementos.botonModo.textContent = "Modo: 2 Jugadores";
  }
  reiniciarJuego();
}
document.addEventListener("DOMContentLoaded", () => {
  iniciarJuego();
  actualizarUIEstadisticas();
});
window.resetearEstadisticas = resetearEstadisticas;