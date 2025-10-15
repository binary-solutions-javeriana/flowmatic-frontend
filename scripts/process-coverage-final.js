const fs = require('fs');
const path = require('path');

// Función para procesar el archivo coverage-final.json
function processCoverageFinal() {
  const coverageDir = path.join(__dirname, '..', 'coverage');
  const coverageFinalPath = path.join(coverageDir, 'coverage-final.json');
  
  if (!fs.existsSync(coverageFinalPath)) {
    console.log('❌ No se encontró el archivo coverage-final.json');
    return;
  }

  console.log('📊 Procesando coverage-final.json...');
  
  try {
    const coverageData = JSON.parse(fs.readFileSync(coverageFinalPath, 'utf8'));
    
    // Calcular estadísticas generales del formato V8/Istanbul
    let totalStatements = 0;
    let coveredStatements = 0;
    let totalBranches = 0;
    let coveredBranches = 0;
    let totalFunctions = 0;
    let coveredFunctions = 0;
    let totalLines = 0;
    let coveredLines = 0;

    // Calcular porcentajes finales (se calculan después de procesar todos los archivos)

    // Procesar archivos individuales del formato V8/Istanbul
    const files = [];
    
    Object.keys(coverageData).forEach(filePath => {
      const file = coverageData[filePath];
      if (!file || !file.s || !file.f || !file.b) return;
      
      const fileName = filePath.split(/[\\\/]/).pop() || filePath;
      
      // Contar statements (s)
      const statements = Object.keys(file.s);
      const coveredStatementsCount = statements.filter(key => file.s[key] > 0).length;
      
      // Contar functions (f)
      const functions = Object.keys(file.f);
      const coveredFunctionsCount = functions.filter(key => file.f[key] > 0).length;
      
      // Contar branches (b)
      const branches = Object.keys(file.b);
      const coveredBranchesCount = branches.filter(key => file.b[key] > 0).length;
      
      // Calcular líneas (aproximación basada en statements)
      const totalLinesCount = statements.length;
      const coveredLinesCount = coveredStatementsCount;
      
      // Calcular porcentajes
      const statementCoverage = statements.length > 0 ? 
        Math.round((coveredStatementsCount / statements.length) * 100) : 0;
      const branchCoverage = branches.length > 0 ? 
        Math.round((coveredBranchesCount / branches.length) * 100) : 0;
      const functionCoverage = functions.length > 0 ? 
        Math.round((coveredFunctionsCount / functions.length) * 100) : 0;
      const lineCoverage = totalLinesCount > 0 ? 
        Math.round((coveredLinesCount / totalLinesCount) * 100) : 0;

      // Acumular totales
      totalStatements += statements.length;
      coveredStatements += coveredStatementsCount;
      totalBranches += branches.length;
      coveredBranches += coveredBranchesCount;
      totalFunctions += functions.length;
      coveredFunctions += coveredFunctionsCount;
      totalLines += totalLinesCount;
      coveredLines += coveredLinesCount;

      files.push({
        fileName,
        filePath,
        statements: statements.length,
        coveredStatements: coveredStatementsCount,
        statementCoverage,
        branches: branches.length,
        coveredBranches: coveredBranchesCount,
        branchCoverage,
        functions: functions.length,
        coveredFunctions: coveredFunctionsCount,
        functionCoverage,
        lines: totalLinesCount,
        coveredLines: coveredLinesCount,
        lineCoverage,
      });
    });

    // Calcular porcentajes finales
    const statementCoverage = totalStatements > 0 ? Math.round((coveredStatements / totalStatements) * 100) : 0;
    const branchCoverage = totalBranches > 0 ? Math.round((coveredBranches / totalBranches) * 100) : 0;
    const functionCoverage = totalFunctions > 0 ? Math.round((coveredFunctions / totalFunctions) * 100) : 0;
    const lineCoverage = totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 0;

    // Ordenar archivos por cobertura de statements
    files.sort((a, b) => b.statementCoverage - a.statementCoverage);

    // Generar reporte HTML
    generateCoverageReport({
      totalStatements,
      coveredStatements,
      statementCoverage,
      totalBranches,
      coveredBranches,
      branchCoverage,
      totalFunctions,
      coveredFunctions,
      functionCoverage,
      totalLines,
      coveredLines,
      lineCoverage,
      files
    });

  } catch (error) {
    console.error('❌ Error procesando coverage-final.json:', error.message);
  }
}

// Función para generar el reporte HTML
function generateCoverageReport(stats) {
  const coverageDir = path.join(__dirname, '..', 'coverage');
  const htmlPath = path.join(coverageDir, 'index.html');
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Coverage Completo - Flowmatic Frontend</title>
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
        .file-path {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
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
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Reporte de Coverage Completo</h1>
            <p>Flowmatic Frontend - Análisis Completo de Cobertura de Código</p>
            <p><strong>Incluye TODOS los tests (exitosos y fallidos)</strong></p>
        </div>
        <div class="content">
            <div class="coverage-summary">
                <div class="metric-card">
                    <div class="metric-value">${stats.files.length}</div>
                    <div class="metric-label">Archivos Analizados</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${stats.statementCoverage}%</div>
                    <div class="metric-label">Cobertura de Statements</div>
                    <div class="coverage-bar">
                        <div class="coverage-fill" style="width: ${stats.statementCoverage}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${stats.branchCoverage}%</div>
                    <div class="metric-label">Cobertura de Branches</div>
                    <div class="coverage-bar">
                        <div class="coverage-fill" style="width: ${stats.branchCoverage}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${stats.functionCoverage}%</div>
                    <div class="metric-label">Cobertura de Functions</div>
                    <div class="coverage-bar">
                        <div class="coverage-fill" style="width: ${stats.functionCoverage}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${stats.lineCoverage}%</div>
                    <div class="metric-label">Cobertura de Lines</div>
                    <div class="coverage-bar">
                        <div class="coverage-fill" style="width: ${stats.lineCoverage}%"></div>
                    </div>
                </div>
            </div>
            
            <div class="files-section">
                <h3 class="section-title">📁 Archivos y Cobertura Detallada</h3>
                <div class="file-grid">
                    ${stats.files.map(file => {
                      const coverageClass = file.statementCoverage >= 80 ? 'coverage-high' : 
                                          file.statementCoverage >= 50 ? 'coverage-medium' : 'coverage-low';
                      return `
                        <div class="file-item">
                            <div class="file-header">
                                <div>
                                    <div class="file-name">${file.fileName}</div>
                                    <div class="file-path">${file.filePath}</div>
                                </div>
                                <div class="coverage-percentage ${coverageClass}">${file.statementCoverage}%</div>
                            </div>
                            <div class="coverage-bar">
                                <div class="coverage-fill" style="width: ${file.statementCoverage}%"></div>
                            </div>
                            <div class="file-stats">
                                <div class="stat-item">
                                    <div class="stat-value">${file.statements}</div>
                                    <div class="stat-label">Statements</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${file.coveredStatements}</div>
                                    <div class="stat-label">Cubiertos</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${file.branches}</div>
                                    <div class="stat-label">Branches</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${file.functions}</div>
                                    <div class="stat-label">Functions</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${file.lines}</div>
                                    <div class="stat-label">Lines</div>
                                </div>
                            </div>
                        </div>
                      `;
                    }).join('')}
                </div>
            </div>
            
            <div class="note">
                <h4>📝 Información del Reporte</h4>
                <p><strong>Cobertura general:</strong> ${stats.statementCoverage}% statements, ${stats.branchCoverage}% branches, ${stats.functionCoverage}% functions, ${stats.lineCoverage}% lines</p>
                <p><strong>Archivos analizados:</strong> ${stats.files.length} archivos de código fuente</p>
                <p><strong>Total statements:</strong> ${stats.totalStatements} (${stats.coveredStatements} cubiertos)</p>
                <p><strong>Total branches:</strong> ${stats.totalBranches} (${stats.coveredBranches} cubiertos)</p>
                <p><strong>Total functions:</strong> ${stats.totalFunctions} (${stats.coveredFunctions} cubiertas)</p>
                <p><strong>Total lines:</strong> ${stats.totalLines} (${stats.coveredLines} cubiertas)</p>
                <p><strong>Generado:</strong> ${new Date().toLocaleString('es-ES')}</p>
                <p><strong>Nota:</strong> Este reporte incluye coverage de TODOS los tests, incluso los que fallaron.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

  // Escribir el archivo HTML
  fs.writeFileSync(htmlPath, htmlContent);
  
  console.log(`✅ Reporte HTML completo generado en: ${htmlPath}`);
  console.log(`📁 Archivos analizados: ${stats.files.length}`);
  console.log(`📊 Cobertura general: ${stats.statementCoverage}% statements, ${stats.branchCoverage}% branches, ${stats.functionCoverage}% functions, ${stats.lineCoverage}% lines`);
  console.log(`🌐 Abre el archivo en tu navegador: file://${htmlPath.replace(/\\/g, '/')}`);
}

// Ejecutar la función
processCoverageFinal();
