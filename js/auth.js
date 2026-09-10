// Este archivo contiene la lógica de autenticación del sitio.
// Aquí se valida el registro, el inicio de sesión y los intentos fallidos.
// En resumen: este archivo decide si alguien puede ingresar o crear una cuenta.
const AUTH = {
  // Registra un nuevo usuario en la plataforma.
  // Esta función se activa cuando el usuario envía el formulario de registro.
  // Lo que hace es: evitar que se recargue la página, leer los datos del formulario,
  // validar las reglas del negocio y guardar el nuevo usuario si todo está bien.
  register(event) {
    // event.preventDefault() evita que el navegador recargue la página al enviar el formulario.
    event.preventDefault();

    // FormData toma todos los campos del formulario y los convierte en un objeto fácil de manejar.
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    // Se obtienen los usuarios ya guardados para comprobar si el correo existe antes de crear uno nuevo.
    const users = getUsers();
    const password = data.password;
    const confirmPassword = data.confirmPassword;
    const nombre = String(data.nombre || '').trim();
    const apellido = String(data.apellido || '').trim();
    const direccion = String(data.direccion || '').trim();
    const email = String(data.email || '').trim().toLowerCase();

    // Nombre, apellido y dirección no pueden quedar en blanco.
    if (!nombre || !apellido || !direccion) {
      showNotice('Nombre, apellido y dirección no pueden estar vacíos.', 'error');
      return;
    }

    // validarPrivilegios revisa la edad mínima y si aceptó los términos.
    // Si algo falla, devuelve false y la función termina sin guardar nada.
    if (!this.validarPrivilegios(data)) {
      return;
    }

    // El correo debe terminar exactamente en @duocuc.cl.
    // Si no cumple esa regla, se muestra un error y se aborta el registro.
    if (!/^[^\s@]+@duocuc\.cl$/i.test(email)) {
      showNotice('El correo debe tener dominio @duocuc.cl', 'error');
      return;
    }

    // Las contraseñas deben coincidir exactamente.
    if (password !== confirmPassword) {
      showNotice('Las contraseñas no coinciden.', 'error');
      return;
    }

    // La contraseña debe ser segura: mínimo 8 caracteres, con mayúsculas, minúsculas y números.
    if (!this.passwordSeguro(password)) {
      showNotice('La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.', 'error');
      return;
    }

    // Busca si ya existe un usuario con el mismo correo (sin importar mayúsculas/minúsculas).
    const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      showNotice('Este correo ya está registrado.', 'error');
      return;
    }

    // Si todo está bien, se agrega el nuevo usuario al arreglo.
    users.push({
      nombre,
      apellido,
      fechaNacimiento: data.fechaNacimiento,
      email,
      password,
      direccion,
      region: data.region,
      genero: data.genero,
      terms: Boolean(data.terms)
    });

    // Se guarda la nueva lista de usuarios en localStorage.
    saveUsers(users);

    // Se guarda un mensaje para mostrarlo después de redirigir al login.
    queueNotice('Registro exitoso. Ahora puedes iniciar sesión.', 'success');

    // Redirige al usuario a la página de login.
    window.location.href = 'login.html';
  },

  // Inicia sesión verificando correo y contraseña.
  // Si el usuario falla varias veces, se bloquea temporalmente su cuenta.
  login(event) {
    // Evita que el navegador haga la entrega tradicional del formulario.
    event.preventDefault();

    // Lee los datos del formulario y convierte el email a minúsculas.
    const formData = new FormData(event.target);
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');

    // Forma la clave de bloqueo para esta cuenta específica.
    const blockKey = `ev_blocked_${email}`;

    // Si la cuenta está bloqueada, no permite seguir intentando.
    if (localStorage.getItem(blockKey) === 'locked') {
      alert('Cuenta bloqueada por 3 intentos fallidos.');
      return;
    }

    // Busca en la lista completa de usuarios si existe alguien con ese correo.
    const users = getUsers();
    const user = users.find((item) => item.email.toLowerCase() === email);

    // Si no existe el correo, se registra el intento fallido y se informa al usuario.
    if (!user) {
      this.handleFailedAttempt(email);
      showNotice('Correo o contraseña incorrectos.', 'error');
      return;
    }

    // Si el correo existe pero la contraseña no coincide, también cuenta como intento fallido.
    if (user.password !== password) {
      this.handleFailedAttempt(email);
      showNotice('Correo o contraseña incorrectos.', 'error');
      return;
    }

    // Si las credenciales son correctas, se limpia el bloqueo y se guarda la sesión actual.
    localStorage.removeItem(blockKey);
    localStorage.removeItem(`ev_attempts_${email}`);
    setCurrentUser({ email: user.email, nombre: user.nombre, apellido: user.apellido });

    // Se guarda un mensaje para mostrar después de entrar al sitio.
    queueNotice('Inicio de sesión exitoso.', 'success');

    // Redirige al usuario a la página principal.
    window.location.href = 'index.html';
  },

  // Cuenta los intentos fallidos de inicio de sesión.
  // Si llega a 3, guarda un bloqueo para esa cuenta y muestra un aviso.
  handleFailedAttempt(email) {
    const blockKey = `ev_blocked_${email}`;
    const attemptsKey = `ev_attempts_${email}`;

    // Lee cuántos errores ya hubo para ese correo y suma uno más.
    const attempts = Number(localStorage.getItem(attemptsKey) || 0) + 1;
    localStorage.setItem(attemptsKey, String(attempts));

    // Si ya superó 3 intentos, se bloquea la cuenta directamente.
    if (attempts >= 3) {
      localStorage.setItem(blockKey, 'locked');
      localStorage.setItem(attemptsKey, '0');
      showNotice('Cuenta bloqueada por 3 intentos fallidos.', 'error');
      return;
    }
  },

  // Comprueba que la contraseña tenga una longitud mínima y contenga mayúsculas,
  // minúsculas y números para hacerla más segura.
  passwordSeguro(password) {
    // La expresión regular busca una contraseña con:
    // - al menos una minúscula
    // - al menos una mayúscula
    // - al menos un número
    // - mínimo 8 caracteres
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  },

  // Valida reglas adicionales del registro: edad mínima y aceptación de términos.
  validarPrivilegios(data) {
    // Convierte la fecha de nacimiento recibida en un objeto Date para poder compararla.
    const birthDate = new Date(data.fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Ajusta la edad si aún no ha cumplido años en este mes.
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Si la fecha es inválida o la persona es menor de 14 años, se rechaza el registro.
    if (Number.isNaN(birthDate.getTime()) || age < 14) {
      showNotice('Debes tener al menos 14 años para registrarte.', 'error');
      return false;
    }

    // Si no aceptó los términos, tampoco puede registrarse.
    if (!data.terms) {
      showNotice('Debes aceptar los términos y condiciones.', 'error');
      return false;
    }

    return true;
  }
};
