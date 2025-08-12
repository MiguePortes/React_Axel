export const APIdeVoz = {
  reconocimiento: null,
  sintetizador: window.speechSynthesis,
  empezarAEscuchar: ({ alComenzar, alObtenerResultado, alFinalizar, alOcurrirError }) => {
    const ReconocimientoDeVoz = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!ReconocimientoDeVoz) {
      alOcurrirError("La API de reconocimiento de voz no es compatible con este navegador.");
      return;
    }
    if (APIdeVoz.reconocimiento) {
      APIdeVoz.reconocimiento.stop();
    }
    APIdeVoz.reconocimiento = new ReconocimientoDeVoz();
    APIdeVoz.reconocimiento.lang = 'es-ES';
    APIdeVoz.reconocimiento.interimResults = false;
    APIdeVoz.reconocimiento.maxAlternatives = 1;
    APIdeVoz.reconocimiento.onstart = () => {
      alComenzar();
    };
    APIdeVoz.reconocimiento.onresult = (evento) => {
      const transcripcion = evento.results[0][0].transcript;
      alObtenerResultado(transcripcion);
    };
    APIdeVoz.reconocimiento.onend = () => {
      alFinalizar();
    };
    APIdeVoz.reconocimiento.onerror = (evento) => {
      alOcurrirError(evento.error);
    };
    APIdeVoz.reconocimiento.start();
  },
  hablar: (texto, idioma = 'es-ES', velocidad = 1.0) => {
    if (!APIdeVoz.sintetizador) {
      console.error("La API de síntesis de voz no es compatible con este navegador.");
      return;
    }
    APIdeVoz.sintetizador.cancel();
    const expresion = new SpeechSynthesisUtterance(texto);
    expresion.lang = idioma;
    expresion.rate = velocidad;
    APIdeVoz.sintetizador.speak(expresion);
  }
};
