"use strict";
/* ========================================================= LA RUCALETA JAVA PRINCIPAL ========================================================= */
/* ========================================================= ELEMENTOS GENERALES ========================================================= */
const pantallaInicio = document.getElementById("pantalla-inicio"); const pantallaLogin = document.getElementById("pantalla-login"); const pantallaInstrucciones = document.getElementById("pantalla-instrucciones"); const pantallaSesion = document.getElementById("pantalla-sesion"); const pantallaSesionActiva = document.getElementById("pantalla-sesion-activa");
const overlayTransicion = document.getElementById("overlay-transicion"); const transicionRuleta = document.getElementById("transicion-ruleta"); const ruletaAnimada = document.getElementById("ruleta-animada"); const capaEfectos = document.getElementById("capa-efectos");
/* ========================================================= PORTADA ========================================================= */
const contenedorLogo = document.getElementById("contenedor-logo"); const logoPrincipal = document.getElementById("logo-principal"); const botonIniciar = document.getElementById("boton-iniciar");
/* ========================================================= LOGIN ========================================================= */
const loginPanel = document.getElementById("login-panel"); const loginUsuario = document.getElementById("login-usuario"); const loginClave = document.getElementById("login-clave"); const botonVerClave = document.getElementById("boton-ver-clave"); const botonLogin = document.getElementById("boton-login"); const mensajeLogin = document.getElementById("mensaje-login"); const loginCarga = document.getElementById("login-carga");
/* ========================================================= CUENTAS AUTORIZADAS
ESTA ES LA ZONA QUE PUEDES EDITAR PARA CREAR CUENTAS.
EJEMPLO:
{ usuario: "nuevo", clave: "1234" },
========================================================= */
const CUENTAS_AUTORIZADAS = [
{
    usuario: "usuario1",
    clave: "1522"
},

{
    usuario: "usuario2",
    clave: "8471"
}
];
/* ========================================================= INSTRUCCIONES ========================================================= */
const checkInstrucciones = document.getElementById("check-instrucciones");
const aceptacionInstrucciones = document.getElementById("aceptacion-instrucciones");
const botonContinuarInstrucciones = document.getElementById("boton-continuar-instrucciones");
/* ========================================================= ULTIMOS 10 NUMEROS ========================================================= */
const contadorInicial = document.getElementById("contador-inicial");
const historialNumeros = document.getElementById("historial-numeros");
const casillasHistorial = Array.from(document.querySelectorAll(".casilla-historial"));
const numeroRuleta = document.getElementById("numero-ruleta");
const botonAgregar = document.getElementById("boton-agregar");
const mensajeInicial = document.getElementById("mensaje-inicial");
const contenedorIniciarSesion = document.getElementById("contenedor-iniciar-sesion");
const botonIniciarSesion = document.getElementById("boton-iniciar-sesion");
/* ========================================================= SESION ACTIVA ========================================================= */
const contenidoSesionActiva = document.getElementById("contenido-sesion-activa");
const contadorIntentos = document.getElementById("contador-intentos");
const numeroIntento = document.getElementById("numero-intento");
const panelEstado = document.getElementById("panel-estado");
const textoEstado = document.getElementById("texto-estado");
const descripcionEstado = document.getElementById("descripcion-estado");
const nivelSenal = document.getElementById("nivel-senal");
const opcionColor = document.getElementById("opcion-color");
const opcionMitades = document.getElementById("opcion-mitades");
const opcionParidad = document.getElementById("opcion-paridad");
const resultadoColor = document.getElementById("resultado-color");
const resultadoMitades = document.getElementById("resultado-mitades");
const resultadoParidad = document.getElementById("resultado-paridad");
const historialSesion = document.getElementById("historial-sesion");
const girosSesion = Array.from(document.querySelectorAll(".giro-sesion"));
const confirmarAnalisis = document.getElementById("confirmar-analisis");
const contenedorConfirmarApuesta = document.getElementById("contenedor-confirmar-apuesta");
const numeroSesion = document.getElementById("numero-sesion");
const botonAgregarSesion = document.getElementById("boton-agregar-sesion");
const mensajeSesion = document.getElementById("mensaje-sesion");
/* ========================================================= RULETA ========================================================= */
const ROJOS = new Set([ 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36 ]);
const NEGROS = new Set([ 2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35 ]);
/* ========================================================= ESTADO GENERAL ========================================================= */
let numerosIniciales = [];
let historialCompleto = [];
let intentoActual = 0;
let secuenciaActiva = false;
let esperandoResultadoApuesta = false;
let apuestaCongelada = null;
let estadoVisualActual = "ESPERAR";
let navegacionBloqueada = false;
let cerrandoSecuencia = false;
let audioContext = null;
/* ========================================================= UTILIDADES ========================================================= */
function esperar(ms) {
return new Promise((resolve) => {

    setTimeout(resolve, ms);

});
}
function normalizarNumero(valor) {
const texto = String(valor).trim();

if (texto === "00") {
    return "00";
}

if (!/^\d{1,2}$/.test(texto)) {
    return null;
}

const numero = Number(texto);

if (!Number.isInteger(numero)) {
    return null;
}

if (numero < 0 || numero > 36) {
    return null;
}

return numero;
}
function esVerde(numero) {
return numero === 0 || numero === "00";
}
function obtenerColor(numero) {
if (esVerde(numero)) {
    return "VERDE";
}

if (ROJOS.has(numero)) {
    return "ROJO";
}

if (NEGROS.has(numero)) {
    return "NEGRO";
}

return null;
}
function obtenerParidad(numero) {
if (esVerde(numero)) {
    return null;
}

return numero % 2 === 0 ? "PAR" : "IMPAR";
}
function obtenerMitad(numero) {
if (esVerde(numero)) {
    return null;
}

if (numero >= 1 && numero <= 18) {
    return "1-18";
}

if (numero >= 19 && numero <= 36) {
    return "19-36";
}

return null;
}
/* ========================================================= AUDIO ========================================================= */
function prepararAudio() {
try {

    if (!audioContext) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        audioContext = new AudioContext();

    }

    if (audioContext.state === "suspended") {

        audioContext.resume();

    }

} catch (error) {

    console.warn("Audio no disponible");

}
}
function tono({
     frecuencia = 440, 
     duracion = 0.08,
      volumen = 0.035,
       tipo = "sine",
        retraso = 0 } = {}) {
if (!audioContext) {
    return;
}

try {

    const inicio =
        audioContext.currentTime + retraso;

    const oscilador =
        audioContext.createOscillator();

    const ganancia =
        audioContext.createGain();

    oscilador.type = tipo;

    oscilador.frequency.setValueAtTime(
        frecuencia,
        inicio
    );

    ganancia.gain.setValueAtTime(
        0.0001,
        inicio
    );

    ganancia.gain.exponentialRampToValueAtTime(
        volumen,
        inicio + 0.015
    );

    ganancia.gain.exponentialRampToValueAtTime(
        0.0001,
        inicio + duracion
    );

    oscilador.connect(ganancia);

    ganancia.connect(audioContext.destination);

    oscilador.start(inicio);

    oscilador.stop(
        inicio + duracion + 0.03
    );
    } catch (error) {

    console.warn("No se pudo reproducir sonido");

}
}
function sonidoClick() {
tono({
    frecuencia: 310,
    duracion: 0.055,
    volumen: 0.025,
    tipo: "triangle"
});

tono({
    frecuencia: 520,
    duracion: 0.07,
    volumen: 0.018,
    tipo: "sine",
    retraso: 0.025
});
}
function sonidoInicio() {
tono({
    frecuencia: 180,
    duracion: 0.13,
    volumen: 0.035,
    tipo: "sine"
});

tono({
    frecuencia: 360,
    duracion: 0.16,
    volumen: 0.028,
    tipo: "triangle",
    retraso: 0.07
});

tono({
    frecuencia: 620,
    duracion: 0.18,
    volumen: 0.022,
    tipo: "sine",
    retraso: 0.15
});
}
function sonidoRuleta() {
tono({
    frecuencia: 110,
    duracion: 0.55,
    volumen: 0.03,
    tipo: "sawtooth"
});

tono({
    frecuencia: 170,
    duracion: 0.45,
    volumen: 0.018,
    tipo: "triangle",
    retraso: 0.18
});
}
function sonidoAcceso() {
tono({
    frecuencia: 390,
    duracion: 0.09,
    volumen: 0.03,
    tipo: "triangle"
});

tono({
    frecuencia: 560,
    duracion: 0.12,
    volumen: 0.025,
    tipo: "triangle",
    retraso: 0.08
});

tono({
    frecuencia: 790,
    duracion: 0.18,
    volumen: 0.022,
    tipo: "sine",
    retraso: 0.16
});
}
function sonidoError() {
tono({
    frecuencia: 150,
    duracion: 0.12,
    volumen: 0.035,
    tipo: "square"
});

tono({
    frecuencia: 115,
    duracion: 0.16,
    volumen: 0.025,
    tipo: "square",
    retraso: 0.1
});
}
function sonidoCondicion() {
tono({
    frecuencia: 290,
    duracion: 0.12,
    volumen: 0.03,
    tipo: "triangle"
});

tono({
    frecuencia: 410,
    duracion: 0.15,
    volumen: 0.024,
    tipo: "triangle",
    retraso: 0.08
});
}
function sonidoEntrada() {
tono({
    frecuencia: 360,
    duracion: 0.11,
    volumen: 0.035,
    tipo: "triangle"
});

tono({
    frecuencia: 620,
    duracion: 0.18,
    volumen: 0.027,
    tipo: "sine",
    retraso: 0.08
});
}
function sonidoConfirmacion() {
tono({
    frecuencia: 240,
    duracion: 0.07,
    volumen: 0.035,
    tipo: "square"
});

tono({
    frecuencia: 480,
    duracion: 0.11,
    volumen: 0.025,
    tipo: "triangle",
    retraso: 0.06
});
}
function sonidoUltimoIntento() {
tono({
    frecuencia: 170,
    duracion: 0.16,
    volumen: 0.04,
    tipo: "sawtooth"
});

tono({
    frecuencia: 220,
    duracion: 0.16,
    volumen: 0.032,
    tipo: "sawtooth",
    retraso: 0.14
});

tono({
    frecuencia: 300,
    duracion: 0.2,
    volumen: 0.026,
    tipo: "triangle",
    retraso: 0.28
});
}
function sonidoGanada() {
tono({
    frecuencia: 420,
    duracion: 0.13,
    volumen: 0.035,
    tipo: "triangle"
});

tono({
    frecuencia: 620,
    duracion: 0.16,
    volumen: 0.032,
    tipo: "triangle",
    retraso: 0.1
});

tono({
    frecuencia: 850,
    duracion: 0.24,
    volumen: 0.027,
    tipo: "sine",
    retraso: 0.2
});
}
function sonidoCierre() {
tono({
    frecuencia: 320,
    duracion: 0.11,
    volumen: 0.027,
    tipo: "triangle"
});

tono({
    frecuencia: 210,
    duracion: 0.18,
    volumen: 0.022,
    tipo: "sine",
    retraso: 0.1
});
}
/* ========================================================= NAVEGACION ========================================================= */
function ocultarPantallas() {
pantallaInicio.hidden = true;
pantallaLogin.hidden = true;
pantallaInstrucciones.hidden = true;
pantallaSesion.hidden = true;
pantallaSesionActiva.hidden = true;
}
async function mostrarPantalla( pantalla, claseEntrada = "pantalla-entrando" ) {
ocultarPantallas();

pantalla.hidden = false;

pantalla.classList.remove(
    "pantalla-entrando",
    "pantalla-entrando-profunda",
    "pantalla-saliendo"
);

void pantalla.offsetWidth;

pantalla.classList.add(claseEntrada);

await esperar(650);

pantalla.classList.remove(claseEntrada);
}
async function transicionNormal( pantallaActual, pantallaSiguiente ) {
if (navegacionBloqueada) {
    return;
}

navegacionBloqueada = true;

overlayTransicion.classList.add(
    "overlay-activo"
);

pantallaActual.classList.add(
    "pantalla-saliendo"
);

await esperar(420);

pantallaActual.hidden = true;
pantallaActual.classList.remove(
    "pantalla-saliendo"
);

pantallaSiguiente.hidden = false;

pantallaSiguiente.classList.add(
    "pantalla-entrando"
);

await esperar(180);

overlayTransicion.classList.remove(
    "overlay-activo"
);

await esperar(500);

pantallaSiguiente.classList.remove(
    "pantalla-entrando"
);

navegacionBloqueada = false;
}
/* ========================================================= TRANSICION DE RULETA PORTADA -> LOGIN ========================================================= */
async function abrirLoginConRuleta() {
if (navegacionBloqueada) {
    return;
}

navegacionBloqueada = true;

prepararAudio();

sonidoInicio();

botonIniciar.disabled = true;

contenedorLogo.classList.add(
    "logo-preparando-salida"
);

botonIniciar.classList.add(
    "boton-preparando-salida"
);

await esperar(260);

transicionRuleta.hidden = false;

void transicionRuleta.offsetWidth;

transicionRuleta.classList.add(
    "ruleta-transicion-activa"
);

sonidoRuleta();

await esperar(1100);

pantallaInicio.hidden = true;

prepararLogin();

pantallaLogin.hidden = false;

pantallaLogin.classList.add(
    "pantalla-login-revelada"
);

await esperar(420);

transicionRuleta.classList.add(
    "ruleta-transicion-final"
);

await esperar(650);

transicionRuleta.hidden = true;

transicionRuleta.classList.remove(
    "ruleta-transicion-activa",
    "ruleta-transicion-final"
);

pantallaLogin.classList.remove(
    "pantalla-login-revelada"
);

contenedorLogo.classList.remove(
    "logo-preparando-salida"
);

botonIniciar.classList.remove(
    "boton-preparando-salida"
);

botonIniciar.disabled = false;

navegacionBloqueada = false;

setTimeout(() => {

    loginUsuario.focus();

}, 150);
}
/* ========================================================= LOGIN ========================================================= */
function normalizarLogin(texto) {
return String(texto)
    .trim()
    .toLowerCase();
}
function comprobarCuenta(usuario, clave) {
const usuarioNormalizado =
    normalizarLogin(usuario);

const claveNormalizada =
    String(clave).trim();

return CUENTAS_AUTORIZADAS.some(
    (cuenta) => {

        return (
            normalizarLogin(cuenta.usuario) ===
                usuarioNormalizado &&
            String(cuenta.clave) ===
                claveNormalizada
        );

    }
);
}
function prepararLogin() {
loginUsuario.value = "";

loginClave.value = "";

loginClave.type = "password";

botonVerClave.textContent = "VER";

botonLogin.disabled = false;

loginUsuario.disabled = false;

loginClave.disabled = false;

mensajeLogin.textContent =
    "ACCESO REQUERIDO";

loginPanel.classList.remove(
    "login-error",
    "login-correcto",
    "login-validando"
);

loginCarga.classList.remove(
    "login-carga-activa"
);
}
function mostrarErrorLogin( texto = "USUARIO O CLAVE INCORRECTOS" ) {
mensajeLogin.textContent = texto;

loginPanel.classList.remove(
    "login-error"
);

void loginPanel.offsetWidth;

loginPanel.classList.add(
    "login-error"
);

sonidoError();

setTimeout(() => {

    loginPanel.classList.remove(
        "login-error"
    );

}, 650);
}
async function intentarLogin() {
if (navegacionBloqueada) {
    return;
}

prepararAudio();

const usuario =
    loginUsuario.value.trim();

const clave =
    loginClave.value.trim();

if (!usuario || !clave) {

    mostrarErrorLogin(
        "COMPLETA USUARIO Y CLAVE"
    );

    return;

}

botonLogin.disabled = true;

loginUsuario.disabled = true;

loginClave.disabled = true;

loginPanel.classList.add(
    "login-validando"
);

loginCarga.classList.add(
    "login-carga-activa"
);

mensajeLogin.textContent =
    "VERIFICANDO ACCESO";

await esperar(700);

const autorizado =
    comprobarCuenta(usuario, clave);

if (!autorizado) {

    botonLogin.disabled = false;

    loginUsuario.disabled = false;

    loginClave.disabled = false;

    loginClave.value = "";

    loginPanel.classList.remove(
        "login-validando"
    );

    loginCarga.classList.remove(
        "login-carga-activa"
    );

    mostrarErrorLogin();

    loginClave.focus();

    return;
    }

mensajeLogin.textContent =
    "ACCESO AUTORIZADO";

loginPanel.classList.remove(
    "login-validando"
);

loginPanel.classList.add(
    "login-correcto"
);

loginCarga.classList.remove(
    "login-carga-activa"
);

sonidoAcceso();

crearParticulasAcceso();

await esperar(900);

prepararInstrucciones();

await transicionNormal(
    pantallaLogin,
    pantallaInstrucciones
);
}
/* ========================================================= MOSTRAR / OCULTAR CLAVE ========================================================= */
function alternarClave() {
prepararAudio();

sonidoClick();

const mostrando =
    loginClave.type === "text";

loginClave.type =
    mostrando
        ? "password"
        : "text";

botonVerClave.textContent =
    mostrando
        ? "VER"
        : "OCULTAR";
}
/* ========================================================= INSTRUCCIONES ========================================================= */
function prepararInstrucciones() {
checkInstrucciones.checked = false;

botonContinuarInstrucciones.disabled = true;

aceptacionInstrucciones.classList.remove(
    "aceptacion-activa"
);
}
function actualizarAceptacion() {
prepararAudio();

const aceptado =
    checkInstrucciones.checked;

botonContinuarInstrucciones.disabled =
    !aceptado;

aceptacionInstrucciones.classList.toggle(
    "aceptacion-activa",
    aceptado
);

if (aceptado) {

    sonidoAcceso();

    pulsoElemento(
        aceptacionInstrucciones
    );

} else {

    sonidoClick();

}
}
async function continuarDesdeInstrucciones() {
if (
    navegacionBloqueada ||
    !checkInstrucciones.checked
) {
    return;
}

prepararAudio();

sonidoInicio();

botonContinuarInstrucciones.disabled =
    true;

pantallaInstrucciones.classList.add(
    "instrucciones-abriendo"
);

crearImpacto();

await esperar(550);

overlayTransicion.classList.add(
    "overlay-apertura"
);

await esperar(350);

pantallaInstrucciones.hidden = true;

pantallaInstrucciones.classList.remove(
    "instrucciones-abriendo"
);

pantallaSesion.hidden = false;

pantallaSesion.classList.add(
    "pantalla-entrando-profunda"
);

actualizarHistorialInicial();

await esperar(300);

overlayTransicion.classList.remove(
    "overlay-apertura"
);

await esperar(650);

pantallaSesion.classList.remove(
    "pantalla-entrando-profunda"
);

botonContinuarInstrucciones.disabled =
    false;

numeroRuleta.focus();
}
/* ========================================================= ESTILO DE NUMEROS ========================================================= */
function aplicarEstiloNumero( elemento, numero ) {
elemento.classList.remove(
    "numero-rojo",
    "numero-negro",
    "numero-verde"
);

if (
    numero === null ||
    numero === undefined ||
    numero === ""
) {
    return;
}

const color =
    obtenerColor(numero);

if (color === "ROJO") {

    elemento.classList.add(
        "numero-rojo"
    );

} else if (color === "NEGRO") {

    elemento.classList.add(
        "numero-negro"
    );

} else if (color === "VERDE") {

    elemento.classList.add(
        "numero-verde"
    );

}
}
/* ========================================================= ULTIMOS 10 NUMEROS ========================================================= */
function actualizarHistorialInicial() {
casillasHistorial.forEach(
    (casilla, indice) => {

        const numero =
            numerosIniciales[indice];

        casilla.textContent =
            numero !== undefined
                ? String(numero)
                : "";

        aplicarEstiloNumero(
            casilla,
            numero
        );

        casilla.classList.toggle(
            "casilla-ocupada",
            numero !== undefined
        );

    }
);

contadorInicial.textContent =
    `${numerosIniciales.length}/10`;

const completo =
    numerosIniciales.length === 10;

numeroRuleta.disabled = completo;

botonAgregar.disabled = completo;

contenedorIniciarSesion.hidden =
    !completo;

if (numerosIniciales.length === 0) {

    mensajeInicial.textContent =
        "AGREGA EL PRIMER NUMERO";

} else if (!completo) {

    const faltan = 10 - numerosIniciales.length;

    mensajeInicial.textContent =
        `FALTAN ${faltan} NUMEROS`;

} else {

    mensajeInicial.textContent =
        "MESA PREPARADA";

    pulsoElemento(
        contenedorIniciarSesion
    );

    sonidoAcceso();

}
}
function agregarNumeroInicial() {
if (numerosIniciales.length >= 10) {
    return;
}

prepararAudio();

const numero =
    normalizarNumero(
        numeroRuleta.value
    );

if (numero === null) {

    mensajeInicial.textContent =
        "NUMERO NO VALIDO";

    pulsoElemento(
        numeroRuleta
    );

    sonidoError();

    numeroRuleta.select();

    return;

}

numerosIniciales.push(numero);

numeroRuleta.value = "";

sonidoClick();

actualizarHistorialInicial();

if (numerosIniciales.length < 10) {

    numeroRuleta.focus();

}
}
function eliminarNumeroInicial(indice) {
if (
    indice < 0 ||
    indice >= numerosIniciales.length
) {
    return;
}

prepararAudio();

numerosIniciales.splice(
    indice,
    1
);

sonidoClick();

actualizarHistorialInicial();

numeroRuleta.disabled = false;

botonAgregar.disabled = false;

numeroRuleta.focus();
}
/* ========================================================= HISTORIAL SESION ACTIVA ========================================================= */
function actualizarHistorialSesion() {
const ultimos =
    historialCompleto.slice(-5);

const espacios =
    5 - ultimos.length;

girosSesion.forEach(
    (giro, indice) => {

        const indiceNumero =
            indice - espacios;

        if (indiceNumero < 0) {

            giro.textContent = "";

            aplicarEstiloNumero(
                giro,
                null
            );

            return;

        }

        const numero =
            ultimos[indiceNumero];

        giro.textContent =
            String(numero);

        aplicarEstiloNumero(
            giro,
            numero
        );

    }
);
}
/* ========================================================= REINICIO POR VERDE ========================================================= */
function historialDesdeUltimoVerde() {
let ultimoVerde = -1;

for (
    let i = historialCompleto.length - 1;
    i >= 0;
    i--
) {

    if (
        esVerde(
            historialCompleto[i]
        )
    ) {

        ultimoVerde = i;

        break;

    }

}

return historialCompleto.slice(
    ultimoVerde + 1
);
}
/* ========================================================= AUSENCIAS ========================================================= */
function contarAusencia( historial, condicion ) {
let ausencia = 0;

for (
    let i = historial.length - 1;
    i >= 0;
    i--
) {

    if (
        condicion(
            historial[i]
        )
    ) {

        break;

    }

    ausencia++;

}

return ausencia;
}
function calcularSenales() {
const historial =
    historialDesdeUltimoVerde();

if (historial.length === 0) {

    return {
        rojo: 0,
        negro: 0,
        par: 0,
        impar: 0,
        primeraMitad: 0,
        segundaMitad: 0
    };

}

return {

    rojo:
        contarAusencia(
            historial,
            (n) =>
                obtenerColor(n) ===
                "ROJO"
        ),

    negro:
        contarAusencia(
            historial,
            (n) =>
                obtenerColor(n) ===
                "NEGRO"
        ),

    par:
        contarAusencia(
            historial,
            (n) =>
                obtenerParidad(n) ===
                "PAR"
        ),

    impar:
        contarAusencia(
            historial,
            (n) =>
                obtenerParidad(n) ===
                "IMPAR"
        ),

    primeraMitad:
        contarAusencia(
            historial,
            (n) =>
                obtenerMitad(n) ===
                "1-18"
        ),

    segundaMitad:
        contarAusencia(
            historial,
            (n) =>
                obtenerMitad(n) ===
                "19-36"
        )

};
}
/* ========================================================= MEJOR OPCION ========================================================= */
function mejorOpcion( opcionA, valorA, opcionB, valorB ) {
if (valorA >= valorB) {

    return {
        nombre: opcionA,
        ausencia: valorA
    };

}

return {
    nombre: opcionB,
    ausencia: valorB
};
}
function obtenerNivelMaximo(senales) {
const maximo =
    Math.max(
        senales.rojo,
        senales.negro,
        senales.par,
        senales.impar,
        senales.primeraMitad,
        senales.segundaMitad
    );

if (maximo >= 5) {
    return 5;
}

if (maximo >= 3) {
    return 3;
}

return 0;
}
/* ========================================================= APUESTA DETECTADA ========================================================= */
function obtenerApuestaDetectada( senales ) {
const opciones = [

    {
        categoria: "COLOR",
        nombre: "ROJO",
        ausencia: senales.rojo
    },

    {
        categoria: "COLOR",
        nombre: "NEGRO",
        ausencia: senales.negro
    },

    {
        categoria: "MITADES",
        nombre: "1-18",
        ausencia: senales.primeraMitad
    },

    {
        categoria: "MITADES",
        nombre: "19-36",
        ausencia: senales.segundaMitad
    },

    {
        categoria: "PARIDAD",
        nombre: "PAR",
        ausencia: senales.par
    },

    {
        categoria: "PARIDAD",
        nombre: "IMPAR",
        ausencia: senales.impar
    }

];

opciones.sort(
    (a, b) =>
        b.ausencia - a.ausencia
);

return opciones[0];
}
/* ========================================================= COMPROBAR RESULTADO DE APUESTA ========================================================= */
function apuestaGanadora( numero, apuesta ) {
if (
    !apuesta ||
    esVerde(numero)
) {
    return false;
}

if (
    apuesta.categoria === "COLOR"
) {

    return (
        obtenerColor(numero) ===
        apuesta.nombre
    );

}

if (
    apuesta.categoria === "PARIDAD"
) {

    return (
        obtenerParidad(numero) ===
        apuesta.nombre
    );

}

if (
    apuesta.categoria === "MITADES"
) {

    return (
        obtenerMitad(numero) ===
        apuesta.nombre
    );

}

return false;
}
/* ========================================================= PANEL DE ANALISIS ========================================================= */
function limpiarClasesSenal( elemento ) {
elemento.classList.remove(
    "senal-3",
    "senal-5"
);
}
function aplicarNivelOpcion( elemento, ausencia ) {
limpiarClasesSenal(
    elemento
);

if (ausencia >= 5) {

    elemento.classList.add(
        "senal-5"
    );

} else if (ausencia >= 3) {

    elemento.classList.add(
        "senal-3"
    );

}
}
function limpiarResultadosAnalisis() {
resultadoColor.textContent = "-";

resultadoMitades.textContent = "-";

resultadoParidad.textContent = "-";

limpiarClasesSenal(
    opcionColor
);

limpiarClasesSenal(
    opcionMitades
);

limpiarClasesSenal(
    opcionParidad
);
}
function actualizarResultados( senales ) {
const ultimo =
    historialCompleto[
        historialCompleto.length - 1
    ];

if (
    historialCompleto.length === 0 ||
    esVerde(ultimo)
) {

    limpiarResultadosAnalisis();

    return;

}

const color =
    mejorOpcion(
        "ROJO",
        senales.rojo,
        "NEGRO",
        senales.negro
    );

const mitades =
    mejorOpcion(
        "1-18",
        senales.primeraMitad,
        "19-36",
        senales.segundaMitad
    );

const paridad =
    mejorOpcion(
        "PAR",
        senales.par,
        "IMPAR",
        senales.impar
    );

resultadoColor.textContent =
    color.nombre;

resultadoMitades.textContent =
    mitades.nombre;

resultadoParidad.textContent =
    paridad.nombre;

aplicarNivelOpcion(
    opcionColor,
    color.ausencia
);

aplicarNivelOpcion(
    opcionMitades,
    mitades.ausencia
);

aplicarNivelOpcion(
    opcionParidad,
    paridad.ausencia
);
}
/* ========================================================= ESTADOS VISUALES ========================================================= */
const CLASES_ESTADO = [
"estado-esperar",
"estado-condicion",
"estado-entrada",
"estado-intento-1",
"estado-intento-2",
"estado-ultimo",
"estado-ganada",
"estado-cierre"
];
function limpiarEstadosVisuales() {
CLASES_ESTADO.forEach(
    (clase) => {

        panelEstado.classList.remove(
            clase
        );

        contenidoSesionActiva.classList.remove(
            clase
        );

    }
);
}
function establecerEstadoVisual( estado, { titulo = "ESPERAR", descripcion = "ANALIZANDO LA MESA", indicador = "EN ESPERA" } = {} ) {
const estadoAnterior =
    estadoVisualActual;

estadoVisualActual = estado;

limpiarEstadosVisuales();

const mapaClases = {

    ESPERAR:
        "estado-esperar",

    CONDICION:
        "estado-condicion",

    ENTRADA:
        "estado-entrada",

    INTENTO_1:
        "estado-intento-1",

    INTENTO_2:
        "estado-intento-2",

    ULTIMO:
        "estado-ultimo",

    GANADA:
        "estado-ganada",

    CIERRE:
        "estado-cierre"

};

const clase =
    mapaClases[estado] ||
    "estado-esperar";

panelEstado.classList.add(
    clase
);

contenidoSesionActiva.classList.add(
    clase
);

textoEstado.textContent =
    titulo;

descripcionEstado.textContent =
    descripcion;

nivelSenal.textContent =
    indicador;

nivelSenal.classList.remove(
    "nivel-espera",
    "nivel-condicion",
    "nivel-entrada",
    "nivel-intento",
    "nivel-ganada",
    "nivel-cierre"
);

if (estado === "CONDICION") {

    nivelSenal.classList.add(
        "nivel-condicion"
    );

    if (
        estadoAnterior !==
        "CONDICION"
    ) {

        sonidoCondicion();

    }

} else if (
    estado === "ENTRADA"
) {

    nivelSenal.classList.add(
        "nivel-entrada"
    );

    if (
        estadoAnterior !==
        "ENTRADA"
    ) {

        sonidoEntrada();

        crearImpacto();

    }

} else if (
    estado === "INTENTO_1" ||
    estado === "INTENTO_2" ||
    estado === "ULTIMO"
) {

    nivelSenal.classList.add(
        "nivel-intento"
    );

} else if (
    estado === "GANADA"
) {

    nivelSenal.classList.add(
        "nivel-ganada"
    );

} else if (
    estado === "CIERRE"
) {

    nivelSenal.classList.add(
        "nivel-cierre"
    );

} else {

    nivelSenal.classList.add(
        "nivel-espera"
    );

}
}
/* ========================================================= ANALIZAR MESA ========================================================= */
function analizarMesa() {
const ultimo =
    historialCompleto[
        historialCompleto.length - 1
    ];

if (
    historialCompleto.length > 0 &&
    esVerde(ultimo)
) {

    limpiarResultadosAnalisis();

    if (!secuenciaActiva) {

        establecerEstadoVisual(
            "ESPERAR",
            {
                titulo: "ESPERAR",
                descripcion:
                    "VERDE DETECTADO - ANALISIS REINICIADO",
                indicador:
                    "EN ESPERA"
            }
        );

        confirmarAnalisis.disabled =
            true;

    }

    return;

}

const senales =
    calcularSenales();

actualizarResultados(
    senales
);

if (secuenciaActiva) {
    return;
}

const nivel =
    obtenerNivelMaximo(
        senales
    );

if (nivel >= 5) {

    establecerEstadoVisual(
        "ENTRADA",
        {
            titulo:
                "CONSIDERAR ENTRADA",
            descripcion:
                "APUESTA DETECTADA",
            indicador:
                "ENTRADA"
        }
    );

    confirmarAnalisis.disabled =
        false;

    return;

}

if (nivel >= 3) {

    establecerEstadoVisual(
        "CONDICION",
        {
            titulo:
                "CONDICION DETECTADA",
            descripcion:
                "ANALIZANDO CONDICION",
            indicador:
                "ATENCION"
        }
    );

    confirmarAnalisis.disabled =
        true;

    return;

}

establecerEstadoVisual(
    "ESPERAR",
    {
        titulo:
            "ESPERAR",
        descripcion:
            "ANALIZANDO LA MESA",
        indicador:
            "EN ESPERA"
    }
);

confirmarAnalisis.disabled =
    true;
}
  /* ========================================================= INTENTOS ========================================================= */
function actualizarIntentoVisual() {
numeroIntento.textContent =
    `${intentoActual}/3`;

contadorIntentos.classList.remove(
    "intento-0",
    "intento-1",
    "intento-2",
    "intento-3"
);

contadorIntentos.classList.add(
         `intento-${intentoActual}`
);
contenedorConfirmarApuesta.classList.remove(
    "fuego-0",
    "fuego-1",
    "fuego-2",
    "fuego-3"
);
contenedorConfirmarApuesta.classList.add(
    `fuego-${intentoActual}`
)

}
/* ========================================================= EFECTOS ========================================================= */
function pulsoElemento(elemento) {
if (!elemento) {
    return;
}

elemento.classList.remove(
    "pulso-elemento"
);

void elemento.offsetWidth;

elemento.classList.add(
    "pulso-elemento"
);

setTimeout(() => {

    elemento.classList.remove(
        "pulso-elemento"
    );

}, 500);
}
function crearImpacto() {
const impacto =
    document.createElement("span");

impacto.className =
    "impacto-global";

capaEfectos.appendChild(
    impacto
);

setTimeout(() => {

    impacto.remove();

}, 900);
}
function crearParticulasAcceso() {
for (
    let i = 0;
    i < 18;
    i++
) {

    const particula =
        document.createElement("span");

    particula.className =
        "particula-acceso";

    particula.style.setProperty(
        "--x",
        `${Math.random() * 100}%`
    );

    particula.style.setProperty(
        "--delay",
        `${Math.random() * 0.35}s`
    );

    particula.style.setProperty(
        "--duracion",
        `${0.8 + Math.random() * 0.8}s`
    );

    capaEfectos.appendChild(
        particula
    );

    setTimeout(() => {

        particula.remove();

    }, 1900);

}
}
function crearParticulasGanada() {
for (
    let i = 0;
    i < 28;
    i++
) {

    const particula =
        document.createElement("span");

    particula.className =
        "particula-ganada";

    particula.style.setProperty(
        "--x",
       `${Math.random() * 100}%`
    );

    particula.style.setProperty(
        "--desplazamiento",
       `${-90 + Math.random() * 180}px`
    );

    particula.style.setProperty(
        "--delay",
       `${Math.random() * 0.35}s`
    );

    particula.style.setProperty(
        "--duracion",
       `${0.8 + Math.random() * 1.1}s`
    );

    capaEfectos.appendChild(
        particula
    );

    setTimeout(() => {

        particula.remove();

    }, 2300);

}
}
/* ========================================================= CONFIRMAR APUESTA ========================================================= */
function confirmarApuesta() {
prepararAudio();

if (
    cerrandoSecuencia ||
    esperandoResultadoApuesta
) {
    return;
}

if (!secuenciaActiva) {

    const senales =
        calcularSenales();

    const nivel =
        obtenerNivelMaximo(
            senales
        );

    if (nivel < 5) {
        return;
    }

    apuestaCongelada =
        obtenerApuestaDetectada(
            senales
        );

    secuenciaActiva = true;

    intentoActual = 0;

}

if (
    !apuestaCongelada ||
    intentoActual >= 3
) {
    return;
}

intentoActual++;

esperandoResultadoApuesta = true;

confirmarAnalisis.disabled = true;

actualizarIntentoVisual();

pulsoElemento(
    confirmarAnalisis
);

crearImpacto();

sonidoConfirmacion();

if (intentoActual === 1) {

    establecerEstadoVisual(
        "INTENTO_1",
        {
            titulo:
                "INTENTO 1",
            descripcion:
                "ESPERANDO RESULTADO",
            indicador:
                "1/3"
        }
    );

    mensajeSesion.textContent =
        "PRIMER INTENTO CONFIRMADO";

} else if (
    intentoActual === 2
) {

    establecerEstadoVisual(
        "INTENTO_2",
        {
            titulo:
                "INTENTO 2",
            descripcion:
                "AUMENTANDO INTENSIDAD",
            indicador:
                "2/3"
        }
    );

    mensajeSesion.textContent =
        "SEGUNDO INTENTO CONFIRMADO"; 

   sonidoClick();

} else {

    establecerEstadoVisual(
        "ULTIMO",
        {
            titulo:
                "ULTIMO INTENTO",
            descripcion:
                "ESPERANDO RESULTADO FINAL",
            indicador:
                "3/3"
        }
    );

    mensajeSesion.textContent =
        "ULTIMO INTENTO CONFIRMADO";

    sonidoUltimoIntento();

}
}
/* ========================================================= CERRAR SECUENCIA ========================================================= */
async function cerrarSecuencia( motivo ) {
if (cerrandoSecuencia) {
    return;
}

cerrandoSecuencia = true;

esperandoResultadoApuesta = false;

confirmarAnalisis.disabled = true;

numeroSesion.disabled = true;

botonAgregarSesion.disabled = true;

if (motivo === "GANADA") {

    establecerEstadoVisual(
        "GANADA",
        {
            titulo:
                "GANADA",
            descripcion:
                "SECUENCIA COMPLETADA",
            indicador:
                "GANADA"
        }
    );

    mensajeSesion.textContent =
        "APUESTA GANADA";

    sonidoGanada();

    crearParticulasGanada();

    crearImpacto();

    await esperar(1500);

} else {

    establecerEstadoVisual(
        "CIERRE",
        {
            titulo:
                "CERRAR SECUENCIA",
            descripcion:
                "LIMITE DE INTENTOS",
            indicador:
                "FINALIZADA"
        }
    );

    mensajeSesion.textContent =
        "SECUENCIA FINALIZADA";

    sonidoCierre();

    await esperar(1200);

}

secuenciaActiva = false;

apuestaCongelada = null;

intentoActual = 0;

actualizarIntentoVisual();

numeroSesion.disabled = false;

botonAgregarSesion.disabled = false;

cerrandoSecuencia = false;

analizarMesa();

mensajeSesion.textContent =
    "MESA LISTA";

numeroSesion.focus();
}
/* ========================================================= PROCESAR RESULTADO DE APUESTA ========================================================= */
async function procesarResultadoApuesta( numero ) {
if (
    !secuenciaActiva ||
    !esperandoResultadoApuesta ||
    !apuestaCongelada
) {
    return;
}

const gano =
    apuestaGanadora(
        numero,
        apuestaCongelada
    );

esperandoResultadoApuesta = false;

if (gano) {

    await cerrarSecuencia(
        "GANADA"
    );

    return;

}

if (intentoActual >= 3) {

    await cerrarSecuencia(
        "PERDIDA"
    );

    return;

}

confirmarAnalisis.disabled = false;

if (intentoActual === 1) {

    establecerEstadoVisual(
        "INTENTO_1",
        {
            titulo:
                "INTENTO 1",
            descripcion:
                "RESULTADO NO GANADO",
            indicador:
                "LISTO PARA 2/3"
        }
    );

    mensajeSesion.textContent =
        "LISTO PARA EL SEGUNDO INTENTO";

} else {

    establecerEstadoVisual(
        "INTENTO_2",
        {
            titulo:
                "INTENTO 2",
            descripcion:
                "RESULTADO NO GANADO",
            indicador:
                "LISTO PARA 3/3"
        }
    );

    mensajeSesion.textContent =
        "LISTO PARA EL ULTIMO INTENTO";

}
}
/* ========================================================= AGREGAR RESULTADO EN SESION ========================================================= */
async function agregarNumeroSesion() {
if (cerrandoSecuencia) {
    return;
}

prepararAudio();

const numero =
    normalizarNumero(
        numeroSesion.value
    );

if (numero === null) {

    mensajeSesion.textContent =
        "NUMERO NO VALIDO";

    pulsoElemento(
        numeroSesion
    );

    sonidoError();

    numeroSesion.select();

    return;

}

historialCompleto.push(
    numero
);

numeroSesion.value = "";

actualizarHistorialSesion();

sonidoClick();

if (
    secuenciaActiva &&
    esperandoResultadoApuesta
) {

    await procesarResultadoApuesta(
        numero
    );

} else {

    analizarMesa();

}

if (
    secuenciaActiva &&
    !esperandoResultadoApuesta &&
    !cerrandoSecuencia
) {

    const senales =
        calcularSenales();     
    actualizarResultados(
        senales
    );

}

if (!cerrandoSecuencia) {

    numeroSesion.focus();

}
}
/* ========================================================= INICIAR SESION ACTIVA ========================================================= */
async function iniciarSesionActiva() {
if (
    numerosIniciales.length !== 10 ||
    navegacionBloqueada
) {
    return;
}

prepararAudio();

navegacionBloqueada = true;

historialCompleto = [
    ...numerosIniciales
];

intentoActual = 0;

secuenciaActiva = false;

esperandoResultadoApuesta = false;

apuestaCongelada = null;

cerrandoSecuencia = false;

estadoVisualActual =
    "ESPERAR";

actualizarIntentoVisual();

actualizarHistorialSesion();

limpiarResultadosAnalisis();

sonidoInicio();

overlayTransicion.classList.add(
    "overlay-activo"
);

pantallaSesion.classList.add(
    "pantalla-saliendo"
);

await esperar(450);

pantallaSesion.hidden = true;

pantallaSesion.classList.remove(
    "pantalla-saliendo"
);

pantallaSesionActiva.hidden = false;

pantallaSesionActiva.classList.add(
    "pantalla-entrando-profunda"
);

await esperar(250);

overlayTransicion.classList.remove(
    "overlay-activo"
);

await esperar(600);

pantallaSesionActiva.classList.remove(
    "pantalla-entrando-profunda"
);

analizarMesa();

mensajeSesion.textContent =
    "MESA LISTA";

navegacionBloqueada = false;

numeroSesion.focus();
}
/* ========================================================= EVENTOS ========================================================= */
/* PORTADA */
botonIniciar.addEventListener( "click", abrirLoginConRuleta );
/* LOGIN */
botonLogin.addEventListener( "click", intentarLogin );
botonVerClave.addEventListener( "click", alternarClave );
loginUsuario.addEventListener( "keydown", (evento) => {
    if (evento.key === "Enter") {

        loginClave.focus();

    }

}
);
loginClave.addEventListener( "keydown", (evento) => {
    if (evento.key === "Enter") {

        intentarLogin();

    }

}
);
loginUsuario.addEventListener( "input", () => {
    mensajeLogin.textContent =
        "ACCESO REQUERIDO";

}
);
loginClave.addEventListener( "input", () => {
    mensajeLogin.textContent =
        "ACCESO REQUERIDO";

}
);
/* INSTRUCCIONES */
checkInstrucciones.addEventListener( "change", actualizarAceptacion );
botonContinuarInstrucciones.addEventListener( "click", continuarDesdeInstrucciones );
/* 10 NUMEROS */
botonAgregar.addEventListener( "click", agregarNumeroInicial );
numeroRuleta.addEventListener( "keydown", (evento) => {
    if (evento.key === "Enter") {

        agregarNumeroInicial();

    }

}
);
casillasHistorial.forEach( (casilla, indice) => {
    casilla.addEventListener(
        "click",
        () => {

            eliminarNumeroInicial(
                indice
            );

        }
    );

}
);
botonIniciarSesion.addEventListener( "click", iniciarSesionActiva );
/* SESION ACTIVA */
confirmarAnalisis.addEventListener( "click", confirmarApuesta );
botonAgregarSesion.addEventListener( "click", agregarNumeroSesion );
numeroSesion.addEventListener( "keydown", (evento) => {
    if (evento.key === "Enter") {

        agregarNumeroSesion();

    }

}
);
/* ========================================================= MICROINTERACCIONES ========================================================= */
const botonesInteractivos = document.querySelectorAll( "button" );
botonesInteractivos.forEach( (boton) => {
    boton.addEventListener(
        "pointerdown",
        () => {

            prepararAudio();

            boton.classList.add(
                "boton-presionado"
            );

        }
    );


    const liberar = () => {

        boton.classList.remove(
            "boton-presionado"
        );

    };


    boton.addEventListener(
        "pointerup",
        liberar
    );

    boton.addEventListener(
        "pointercancel",
        liberar
    );

    boton.addEventListener(
        "pointerleave",
        liberar
    );

}
);    
/* ========================================================= ESTADO INICIAL ========================================================= */
function prepararEstadoInicial() {
pantallaInicio.hidden = false;

pantallaLogin.hidden = true;

pantallaInstrucciones.hidden = true;

pantallaSesion.hidden = true;

pantallaSesionActiva.hidden = true;

transicionRuleta.hidden = true;

numerosIniciales = [];

historialCompleto = [];

intentoActual = 0;

secuenciaActiva = false;

esperandoResultadoApuesta = false;

apuestaCongelada = null;

cerrandoSecuencia = false;

navegacionBloqueada = false;

estadoVisualActual =
    "ESPERAR";

actualizarHistorialInicial();

actualizarIntentoVisual();

limpiarResultadosAnalisis();
}
prepararEstadoInicial();