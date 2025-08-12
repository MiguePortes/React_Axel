export class GestorSincronizacion {
  constructor() {
    this.estaEnLinea = navigator.onLine;
    this.configurarOyentes();
  }
  configurarOyentes() {
    window.addEventListener('online', this.manejarConexion);
    window.addEventListener('offline', this.manejarDesconexion);
  }
  manejarConexion = () => {
    this.estaEnLinea = true;
    console.log('¡Conexión de red restablecida!');
  };
  manejarDesconexion = () => {
    this.estaEnLinea = false;
    console.warn('Se ha perdido la conexión de red. Trabajando sin conexión.');
  };
  sincronizarConFirestore(idUsuario, idApp) {
    if (this.estaEnLinea) {
      console.log('Sincronización iniciada: Conectado a Firestore.');
    } else {
      console.warn('Sincronización iniciada: Sin conexión. Firestore usará el caché local.');
    }
  }
}
