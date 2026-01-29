const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
    console.log('\n🔐 CREAR USUARIO ADMINISTRADOR\n');

    try {
        // Conectar a la base de datos
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Conectado a la base de datos\n');

        // Solicitar datos del administrador
        const username = await question('Usuario (username): ');
        const email = await question('Email: ');
        const password = await question('Contraseña: ');
        const nombreCompleto = await question('Nombre completo: ');
        const telefono = await question('Teléfono (opcional): ');

        // Verificar si el usuario ya existe
        const [existingUsers] = await connection.query(
            'SELECT id FROM usuarios WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            console.log('\n❌ Error: El usuario o email ya existe');
            await connection.end();
            rl.close();
            process.exit(1);
        }

        // Encriptar contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear usuario (rol 1 = Super Administrador)
        const [result] = await connection.query(
            'INSERT INTO usuarios (username, email, password_hash, nombre_completo, telefono, rol_id, activo, verificado) VALUES (?, ?, ?, ?, ?, 1, true, true)',
            [username, email, passwordHash, nombreCompleto, telefono || null]
        );

        console.log('\n✅ Usuario administrador creado exitosamente!');
        console.log('\n📋 Detalles:');
        console.log(`   ID: ${result.insertId}`);
        console.log(`   Usuario: ${username}`);
        console.log(`   Email: ${email}`);
        console.log(`   Nombre: ${nombreCompleto}`);
        console.log(`   Rol: Super Administrador`);
        console.log('\n🚀 Ahora puedes iniciar sesión en la plataforma\n');

        await connection.end();
        rl.close();

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        rl.close();
        process.exit(1);
    }
}

createAdmin();
