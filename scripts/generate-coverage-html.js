const fs = require('fs');
const path = require('path');

// Función para procesar archivos JSON de coverage
function processCoverageFiles() {
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

  console.log(`Encontrados ${jsonFiles.length} archivos JSON de coverage`);
  
  // Procesar todos los archivos JSON para extraer datos detallados
  let allFiles = [];
  let totalFunctions = 0;
  let totalCoveredFunctions = 0;
  let totalLines = 0;
  let totalCoveredLines = 0;

  jsonFiles.forEach((file, index) => {
    try {
      const filePath = path.join(tmpDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (data.result && Array.isArray(data.result)) {
        data.result.forEach(result => {
          if (result.url && result.functions) {
            const fileName = result.url.split('/').pop();
            const functions = result.functions || [];
            const coveredFunctions = functions.filter(f => f.ranges && f.ranges.some(r => r.count > 0));
            
            // Calcular líneas cubiertas
            let lines = 0;
            let coveredLines = 0;
            
            functions.forEach(func => {
              if (func.ranges) {
                func.ranges.forEach(range => {
                  const rangeLines = Math.ceil((range.endOffset - range.startOffset) / 50); // Aproximación
                  lines += rangeLines;
                  if (range.count > 0) {
                    coveredLines += rangeLines;
                  }
                });
              }
            });

            allFiles.push({
              fileName,
              url: result.url,
              functions: functions.length,
              coveredFunctions: coveredFunctions.length,
              lines,
              coveredLines,
              coverage: functions.length > 0 ? Math.round((coveredFunctions.length / functions.length) * 100) : 0,
              lineCoverage: lines > 0 ? Math.round((coveredLines / lines) * 100) : 0
            });

            totalFunctions += functions.length;
            totalCoveredFunctions += coveredFunctions.length;
            totalLines += lines;
            totalCoveredLines += coveredLines;
          }
        });
      }
    } catch (error) {
      console.log(`Error procesando ${file}:`, error.message);
    }
  });

  // Calcular estadísticas generales
  const overallCoverage = totalFunctions > 0 ? Math.round((totalCoveredFunctions / totalFunctions) * 100) : 0;
  const overallLineCoverage = totalLines > 0 ? Math.round((totalCoveredLines / totalLines) * 100) : 0;

  // Crear reporte HTML detallado
  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Coverage - Flowmatic Frontend</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f7fa;
            line-height: 1.6;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #14a67e, #9fdbc2);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 0;
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .coverage-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .metric-card {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            border-left: 5px solid #14a67e;
            transition: transform 0.2s ease;
        }
        .metric-card:hover {
            transform: translateY(-2px);
        }
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #14a67e;
            margin-bottom: 5px;
        }
        .metric-label {
            color: #666;
            font-size: 1.1em;
        }
        .coverage-bar {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            margin: 10px 0;
            overflow: hidden;
        }
        .coverage-fill {
            height: 100%;
            background: linear-gradient(90deg, #14a67e, #9fdbc2);
            transition: width 0.3s ease;
        }
        .files-section {
            margin-top: 30px;
        }
        .section-title {
            font-size: 1.8em;
            color: #333;
            margin-bottom: 20px;
            border-bottom: 3px solid #14a67e;
            padding-bottom: 10px;
        }
        .file-grid {
            display: grid;
            gap: 15px;
        }
        .file-item {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.2s ease;
            border-left: 4px solid #14a67e;
        }
        .file-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transform: translateY(-1px);
        }
        .file-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .file-name {
            font-weight: bold;
            color: #333;
            font-size: 1.1em;
        }
        .coverage-percentage {
            font-size: 1.2em;
            font-weight: bold;
            padding: 5px 12px;
            border-radius: 20px;
            color: white;
        }
        .coverage-high { background: #28a745; }
        .coverage-medium { background: #ffc107; color: #333; }
        .coverage-low { background: #dc3545; }
        .file-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .stat-item {
            text-align: center;
            padding: 10px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e9ecef;
        }
        .stat-value {
            font-size: 1.3em;
            font-weight: bold;
            color: #14a67e;
        }
        .stat-label {
            font-size: 0.9em;
            color: #666;
            margin-top: 3px;
        }
        .note {
            background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
            border: 1px solid #2196f3;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
        }
        .note h4 {
            margin: 0 0 10px 0;
            color: #1976d2;
        }
        .note p {
            margin: 5px 0;
            color: #555;
        }
        .test-results {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        .test-summary {
            display: flex;
            justify-content: space-around;
            text-align: center;
            margin-bottom: 20px;
        }
        .test-stat {
            padding: 15px;
        }
        .test-stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #14a67e;
        }
        .test-stat-label {
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Reporte de Coverage Detallado</h1>
            <p>Flowmatic Frontend - Análisis Completo de Cobertura de Código</p>
        </div>
        <div class="content">
            <div class="coverage-summary">
                <div class="metric-card">
                    <div class="metric-value">${allFiles.length}</div>
                    <div class="metric-label">Archivos Analizados</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${overallCoverage}%</div>
                    <div class="metric-label">Cobertura de Funciones</div>
                    <div class="coverage-bar">
                        <div class="coverage-fill" style="width: ${overallCoverage}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${overallLineCoverage}%</div>
                    <div class="metric-label">Cobertura de Líneas</div>
                    <div class="coverage-bar">
                        <div class="coverage-fill" style="width: ${overallLineCoverage}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${totalFunctions}</div>
                    <div class="metric-label">Total Funciones</div>
                </div>
            </div>

            <div class="test-results">
                <h3>📈 Resumen de Tests</h3>
                <div class="test-summary">
                    <div class="test-stat">
                        <div class="test-stat-value">${totalCoveredFunctions}</div>
                        <div class="test-stat-label">Funciones Cubiertas</div>
                    </div>
                    <div class="test-stat">
                        <div class="test-stat-value">${totalFunctions - totalCoveredFunctions}</div>
                        <div class="test-stat-label">Funciones Sin Cubrir</div>
                    </div>
                    <div class="test-stat">
                        <div class="test-stat-value">${totalLines}</div>
                        <div class="test-stat-label">Total Líneas</div>
                    </div>
                    <div class="test-stat">
                        <div class="test-stat-value">${totalCoveredLines}</div>
                        <div class="test-stat-label">Líneas Cubiertas</div>
                    </div>
                </div>
            </div>
            
            <div class="files-section">
                <h3 class="section-title">📁 Archivos y Cobertura Detallada</h3>
                <div class="file-grid">
                    ${allFiles.map(file => {
                      const coverageClass = file.coverage >= 80 ? 'coverage-high' : 
                                          file.coverage >= 50 ? 'coverage-medium' : 'coverage-low';
                      return `
                        <div class="file-item">
                            <div class="file-header">
                                <div class="file-name">${file.fileName}</div>
                                <div class="coverage-percentage ${coverageClass}">${file.coverage}%</div>
                            </div>
                            <div class="coverage-bar">
                                <div class="coverage-fill" style="width: ${file.coverage}%"></div>
                            </div>
                            <div class="file-stats">
                                <div class="stat-item">
                                    <div class="stat-value">${file.functions}</div>
                                    <div class="stat-label">Funciones</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${file.coveredFunctions}</div>
                                    <div class="stat-label">Cubiertas</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${file.lines}</div>
                                    <div class="stat-label">Líneas</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${file.lineCoverage}%</div>
                                    <div class="stat-label">Cobertura</div>
                                </div>
                            </div>
                        </div>
                      `;
                    }).join('')}
                </div>
            </div>
            
            <div class="note">
                <h4>📝 Información del Reporte</h4>
                <p><strong>Archivos procesados:</strong> ${jsonFiles.length} archivos JSON de coverage</p>
                <p><strong>Cobertura general:</strong> ${overallCoverage}% de funciones, ${overallLineCoverage}% de líneas</p>
                <p><strong>Archivos analizados:</strong> ${allFiles.length} archivos de código fuente</p>
                <p><strong>Generado:</strong> ${new Date().toLocaleString('es-ES')}</p>
            </div>
        </div>
    </div>
</body>
</html>`;

  // Escribir el archivo HTML
  const htmlPath = path.join(coverageDir, 'index.html');
  fs.writeFileSync(htmlPath, htmlContent);
  
  console.log(`✅ Reporte HTML detallado generado en: ${htmlPath}`);
  console.log(`📁 Archivos JSON procesados: ${jsonFiles.length}`);
  console.log(`📊 Archivos de código analizados: ${allFiles.length}`);
  console.log(`📈 Cobertura general: ${overallCoverage}% funciones, ${overallLineCoverage}% líneas`);
  console.log(`🌐 Abre el archivo en tu navegador: file://${htmlPath.replace(/\\/g, '/')}`);
}

// Ejecutar la función
processCoverageFiles();
