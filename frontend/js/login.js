// Login Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        // Deshabilitar botón durante la petición
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';

        try {
            const response = await api.login(username, password);
            
            // Guardar datos de usuario
            localStorage.setItem('user', JSON.stringify(response.usuario));
            localStorage.setItem('permisos', JSON.stringify(response.permisos));
            
            if (remember) {
                localStorage.setItem('remember', 'true');
            }

            // Mostrar éxito
            loginError.className = 'alert alert-success';
            loginError.textContent = '¡Inicio de sesión exitoso! Redirigiendo...';
            loginError.style.display = 'block';

            // Redirigir al dashboard
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);

        } catch (error) {
            // Mostrar error
            loginError.className = 'alert alert-error';
            loginError.textContent = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
            loginError.style.display = 'block';

            // Rehabilitar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';

            // Limpiar contraseña
            document.getElementById('password').value = '';
        }
    });

    // Verificar si ya hay sesión activa
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/dashboard.html';
    }
});
