const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const coverageDir = path.resolve(__dirname, '../coverage');
const tempDir = path.join(coverageDir, '.tmp');

// Función para copiar archivos de coverage antes de que se eliminen
function copyCoverageFiles() {
  // Crear directorio temporal si no existe
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  console.log('🔄 Ejecutando todos los tests con coverage...');
  
  try {
    // Ejecutar Vitest con todos los tests
    execSync('npx vitest run --coverage --reporter=basic', { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
  } catch (error) {
    console.log('⚠️  Algunos tests fallaron, pero continuando con el procesamiento de coverage...');
  }

  // Verificar si se generó coverage-final.json
  const coverageFinalPath = path.join(coverageDir, 'coverage-final.json');
  
  if (fs.existsSync(coverageFinalPath)) {
    console.log('📊 Archivo coverage-final.json encontrado, procesando...');
    generateFullCoverageReport();
  } else {
    console.log('❌ No se encontró coverage-final.json');
  }
}

// Función para generar reporte HTML completo
function generateFullCoverageReport() {
  console.log('🎨 Generando reporte HTML completo...');
  
  try {
    // Ejecutar el script de procesamiento de coverage-final.json
    execSync('node scripts/process-coverage-final.js', { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
    
    console.log('✅ Reporte HTML completo generado exitosamente');
    console.log(`🌐 Abre el archivo en tu navegador: file://${path.join(coverageDir, 'index.html').replace(/\\/g, '/')}`);
  } catch (error) {
    console.error('❌ Error generando reporte HTML:', error.message);
  }
}

// Función principal
function main() {
  console.log('🚀 Iniciando generación de coverage completo...');
  console.log('📝 Esto incluirá TODOS los tests, incluso los que fallan');
  
  // Limpiar directorio temporal anterior
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  
  // Generar coverage completo
  copyCoverageFiles();
  
  console.log('✨ Proceso completado');
}

// Ejecutar
main();
