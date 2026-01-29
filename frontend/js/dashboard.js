// Dashboard JavaScript
let activityChart, rolesChart;

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (!api.token) {
        window.location.href = '/';
        return;
    }

    // Inicializar componentes
    initSidebar();
    initTopbar();
    await loadUserInfo();
    await loadModulos();
    await loadEstadisticas();
    initCharts();
});

function initSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}

function initTopbar() {
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                try {
                    await api.logout();
                    localStorage.clear();
                    window.location.href = '/';
                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                    // Cerrar sesión localmente de todos modos
                    localStorage.clear();
                    window.location.href = '/';
                }
            }
        });
    }
}

async function loadUserInfo() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (user) {
            const userInfo = document.getElementById('userInfo');
            if (userInfo) {
                userInfo.querySelector('.user-name').textContent = user.nombreCompleto;
                userInfo.querySelector('.user-role').textContent = user.rol;
            }
        }
    } catch (error) {
        console.error('Error al cargar información de usuario:', error);
    }
}

async function loadModulos() {
    try {
        const modulos = await api.getModulos();
        const modulosNav = document.getElementById('modulosNav');
        
        if (modulosNav && modulos.length > 0) {
            modulosNav.innerHTML = `
                <h3 class="nav-title">Módulos</h3>
                ${modulos.map(modulo => `
                    <a href="${modulo.ruta}" class="nav-item">
                        <i class="fas fa-${modulo.icono}"></i>
                        <span>${modulo.nombre}</span>
                    </a>
                `).join('')}
            `;
        }
    } catch (error) {
        console.error('Error al cargar módulos:', error);
    }
}

async function loadEstadisticas() {
    try {
        const stats = await api.getEstadisticas();
        
        // Actualizar cards de estadísticas
        document.getElementById('totalUsuarios').textContent = stats.totalUsuarios || 0;
        document.getElementById('sesionesActivas').textContent = stats.sesionesActivas || 0;
        document.getElementById('integracionesActivas').textContent = stats.integracionesActivas || 0;
        
        // Calcular actividad de hoy
        if (stats.actividadReciente && stats.actividadReciente.length > 0) {
            const hoy = new Date().toISOString().split('T')[0];
            const actividadHoy = stats.actividadReciente.find(a => a.fecha === hoy);
            document.getElementById('actividadHoy').textContent = actividadHoy ? actividadHoy.cantidad : 0;
        }

        // Tabla de últimos logins
        if (stats.ultimosLogins) {
            const tbody = document.querySelector('#ultimosLoginsTable tbody');
            tbody.innerHTML = stats.ultimosLogins.map(login => `
                <tr>
                    <td>
                        <strong>${login.nombre_completo}</strong><br>
                        <small style="color: var(--secondary);">@${login.username}</small>
                    </td>
                    <td><span class="badge">${login.rol}</span></td>
                    <td>${formatDateTime(login.ultimo_login)}</td>
                </tr>
            `).join('');
        }

        // Módulos más usados
        if (stats.modulosMasUsados) {
            const modulosUsados = document.getElementById('modulosUsados');
            const maxUso = Math.max(...stats.modulosMasUsados.map(m => m.total));
            
            modulosUsados.innerHTML = stats.modulosMasUsados.map(modulo => `
                <div class="usage-item">
                    <div class="usage-icon">
                        <i class="fas fa-cube"></i>
                    </div>
                    <div class="usage-details">
                        <div class="usage-name">${modulo.modulo}</div>
                        <div class="usage-bar">
                            <div class="usage-fill" style="width: ${(modulo.total / maxUso) * 100}%"></div>
                        </div>
                    </div>
                    <div class="usage-count">${modulo.total}</div>
                </div>
            `).join('');
        }

        // Actualizar gráficos
        updateActivityChart(stats.actividadReciente || []);
        updateRolesChart(stats.usuariosPorRol || []);

    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

function initCharts() {
    // Activity Chart
    const activityCtx = document.getElementById('activityChart');
    if (activityCtx) {
        activityChart = new Chart(activityCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Actividad',
                    data: [],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Roles Chart
    const rolesCtx = document.getElementById('rolesChart');
    if (rolesCtx) {
        rolesChart = new Chart(rolesCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#2563eb',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#3b82f6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

function updateActivityChart(data) {
    if (!activityChart) return;

    const labels = data.map(d => formatDate(d.fecha)).reverse();
    const values = data.map(d => d.cantidad).reverse();

    activityChart.data.labels = labels;
    activityChart.data.datasets[0].data = values;
    activityChart.update();
}

function updateRolesChart(data) {
    if (!rolesChart) return;

    const labels = data.map(d => d.rol);
    const values = data.map(d => d.total);

    rolesChart.data.labels = labels;
    rolesChart.data.datasets[0].data = values;
    rolesChart.update();
}

// Utilidades
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
}

function formatDateTime(dateString) {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { 
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
