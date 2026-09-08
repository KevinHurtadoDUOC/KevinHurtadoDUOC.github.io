const AUTH = {
  register(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const users = getUsers();
    const password = data.password;
    const confirmPassword = data.confirmPassword;
    const email = data.email.trim();

    if (!this.validarPrivilegios(data)) {
      return;
    }

    if (!email.endsWith('@duoc.cl')) {
      showNotice('El correo debe terminar exclusivamente en @duoc.cl', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showNotice('Las contraseñas no coinciden.', 'error');
      return;
    }

    if (!this.passwordSeguro(password)) {
      showNotice('La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.', 'error');
      return;
    }

    const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      showNotice('Este correo ya está registrado.', 'error');
      return;
    }

    users.push({
      nombre: data.nombre,
      apellido: data.apellido,
      fechaNacimiento: data.fechaNacimiento,
      email,
      password,
      direccion: data.direccion,
      region: data.region,
      genero: data.genero,
      terms: Boolean(data.terms)
    });

    saveUsers(users);
    queueNotice('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
    window.location.href = 'login.html';
  },

  login(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');

    const blockKey = `ev_blocked_${email}`;
    if (localStorage.getItem(blockKey) === 'locked') {
      alert('Cuenta bloqueada por 3 intentos fallidos.');
      return;
    }

    const users = getUsers();
    const user = users.find((item) => item.email.toLowerCase() === email);

    if (!user) {
      this.handleFailedAttempt(email);
      showNotice('Correo o contraseña incorrectos.', 'error');
      return;
    }

    if (user.password !== password) {
      this.handleFailedAttempt(email);
      showNotice('Correo o contraseña incorrectos.', 'error');
      return;
    }

    localStorage.removeItem(blockKey);
    localStorage.removeItem(`ev_attempts_${email}`);
    setCurrentUser({ email: user.email, nombre: user.nombre, apellido: user.apellido });
    queueNotice('Inicio de sesión exitoso.', 'success');
    window.location.href = 'index.html';
  },

  handleFailedAttempt(email) {
    const blockKey = `ev_blocked_${email}`;
    const attemptsKey = `ev_attempts_${email}`;
    const attempts = Number(localStorage.getItem(attemptsKey) || 0) + 1;
    localStorage.setItem(attemptsKey, String(attempts));

    if (attempts >= 3) {
      localStorage.setItem(blockKey, 'locked');
      localStorage.setItem(attemptsKey, '0');
      showNotice('Cuenta bloqueada por 3 intentos fallidos.', 'error');
      return;
    }
  },

  passwordSeguro(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  },

  validarPrivilegios(data) {
    const birthDate = new Date(data.fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (Number.isNaN(birthDate.getTime()) || age < 14) {
      showNotice('Debes tener al menos 14 años para registrarte.', 'error');
      return false;
    }

    if (!data.terms) {
      showNotice('Debes aceptar los términos y condiciones.', 'error');
      return false;
    }

    return true;
  }
};
