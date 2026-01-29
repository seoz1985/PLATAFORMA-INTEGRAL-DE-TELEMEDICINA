const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    console.log('🔧 Configurando base de datos...\n');

    try {
        // Conectar sin especificar la base de datos
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('✅ Conexión a MySQL establecida');

        // Leer el archivo SQL
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');

        console.log('📄 Archivo schema.sql cargado');

        // Usar/crear la base de datos
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await connection.query(`USE ${process.env.DB_NAME}`);
        
        console.log(`📊 Base de datos "${process.env.DB_NAME}" seleccionada`);

        // Ejecutar el esquema
        await connection.query(schema);
        
        console.log('✅ Esquema de base de datos creado exitosamente');
        console.log('\n📋 Tablas creadas:');
        console.log('   - roles');
        console.log('   - modulos');
        console.log('   - permisos');
        console.log('   - roles_permisos');
        console.log('   - usuarios');
        console.log('   - sesiones');
        console.log('   - configuraciones');
        console.log('   - logs_actividad');
        console.log('   - integraciones');
        console.log('   - webhooks');
        console.log('   - logs_integraciones');

        console.log('\n👥 Roles creados:');
        console.log('   - Super Administrador (Nivel 5)');
        console.log('   - Administrador (Nivel 4)');
        console.log('   - Moderador (Nivel 3)');
        console.log('   - Usuario Premium (Nivel 2)');
        console.log('   - Usuario Básico (Nivel 1)');

        console.log('\n✅ Base de datos configurada exitosamente');
        console.log('\n⚠️  IMPORTANTE: Crea tu primer usuario administrador con:');
        console.log('   node backend/scripts/createAdmin.js\n');

        await connection.end();

    } catch (error) {
        console.error('❌ Error al configurar la base de datos:', error.message);
        process.exit(1);
    }
}

setupDatabase();
