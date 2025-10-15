const fs = require('fs');
const path = require('path');

// Función para procesar archivos JSON de coverage y generar lcov.info
function generateLcovReport() {
  const coverageDir = path.join(__dirname, '..', 'coverage');
  const tmpDir = path.join(coverageDir, '.tmp');
  
  if (!fs.existsSync(tmpDir)) {
    console.log('No se encontró la carpeta .tmp en coverage');
    return;
  }

  const jsonFiles = fs.readdirSync(tmpDir).filter(file => file.endsWith('.json'));
  
  if (jsonFiles.length === 0) {
    console.log('No se encontraron archivos JSON de coverage');
    return;
  }

  console.log(`Procesando ${jsonFiles.length} archivos JSON de coverage...`);
  
  let lcovContent = '';
  let totalLines = 0;
  let coveredLines = 0;

  jsonFiles.forEach((file, index) => {
    try {
      const filePath = path.join(tmpDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (data.result && Array.isArray(data.result)) {
        data.result.forEach(result => {
          if (result.url && result.functions) {
            const fileName = result.url.replace('file:///', '').replace(/\\/g, '/');
            const functions = result.functions || [];
            
            // Procesar cada función
            functions.forEach(func => {
              if (func.ranges) {
                func.ranges.forEach(range => {
                  const startLine = Math.floor(range.startOffset / 50) + 1; // Aproximación de líneas
                  const endLine = Math.floor(range.endOffset / 50) + 1;
                  const hitCount = range.count || 0;
                  
                  if (hitCount > 0) {
                    coveredLines++;
                  }
                  totalLines++;
                  
                  // Generar entrada LCOV
                  lcovContent += `SF:${fileName}\n`;
                  lcovContent += `DA:${startLine},${hitCount}\n`;
                  
                  if (endLine > startLine) {
                    for (let line = startLine + 1; line <= endLine; line++) {
                      lcovContent += `DA:${line},${hitCount}\n`;
                      totalLines++;
                    }
                  }
                });
              }
            });
            
            // Agregar resumen del archivo
            lcovContent += `end_of_record\n`;
          }
        });
      }
    } catch (error) {
      console.log(`Error procesando ${file}:`, error.message);
    }
  });

  // Escribir archivo lcov.info
  const lcovPath = path.join(coverageDir, 'lcov.info');
  fs.writeFileSync(lcovPath, lcovContent);
  
  console.log(`✅ Archivo lcov.info generado en: ${lcovPath}`);
  console.log(`📊 Líneas totales: ${totalLines}`);
  console.log(`📈 Líneas cubiertas: ${coveredLines}`);
  console.log(`📊 Cobertura: ${totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 0}%`);
}

// Ejecutar la función
generateLcovReport();
