# Guía de Configuración y Uso de SonarQube Local - Flowmatic Frontend

## 1. Iniciar SonarQube

```bash
npm run sonar:start
```

**Nota:** El frontend usa el puerto 9000 y el backend usa el puerto 9001. Si estás ejecutando ambos SonarQube simultáneamente, asegúrate de que no haya conflictos de puertos.

Espera 2-3 minutos para que SonarQube inicie completamente.

## 2. Configuración Inicial (solo primera vez)

1. Abre http://localhost:9000
2. Login inicial: `admin` / `admin`
3. Cambia la contraseña cuando se solicite
4. Crea un nuevo proyecto:
   - Project key: `flowmatic-frontend`
   - Display name: `Flowmatic Frontend`
5. Genera un token de autenticación:
   - My Account → Security → Generate Token
   - Nombre: `flowmatic-frontend-local`
   - Guarda el token generado

## 3. Configurar Token

Crea archivo `.env.local` en la raíz:
```
SONAR_TOKEN=tu_token_aqui
SONAR_HOST_URL=http://localhost:9000
```

O exporta como variable de entorno:
```bash
export SONAR_TOKEN=tu_token_aqui
export SONAR_HOST_URL=http://localhost:9000
```

## 4. Instalación de SonarScanner

Antes de ejecutar `npm run sonar:scan`, necesitas instalar SonarScanner:

**Opción 1: Instalación global (recomendado)**
```bash
npm install -g sonarqube-scanner
```

**Opción 2: Instalación local**
```bash
npm install -D sonarqube-scanner
```

Y actualizar el script en package.json:
```json
{
  "sonar:scan": "npx sonar-scanner"
}
```

## 5. Ejecutar Análisis

```bash
# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar análisis de SonarQube
npm run sonar:scan
```

O ejecutar todo junto:
```bash
npm run quality
```

## 6. Ver Resultados

Abre http://localhost:9000/dashboard?id=flowmatic-frontend

## 7. Detener SonarQube

```bash
npm run sonar:stop
```

## Métricas Objetivo

- **Cobertura de código**: ≥60%
  - Statements: ≥65%
  - Branches: ≥60%
  - Functions: ≥65%
  - Lines: ≥65%
- **Duplicación**: <3%
- **Deuda técnica**: <5 días
- **Code Smells**: <50
- **Bugs**: 0
- **Vulnerabilidades**: 0
- **Security Hotspots**: Revisados
- **Mantenibilidad**: A o B

## Comandos Útiles

```bash
# Solo pruebas unitarias
npm test

# Solo pruebas con cobertura
npm run test:coverage

# Ver reporte de cobertura en navegador
# Abrir: coverage/index.html

# Ver UI de pruebas
npm run test:ui

# Análisis completo de calidad
npm run quality

# Limpiar y reiniciar SonarQube
npm run sonar:stop
docker volume rm flowmatic-frontend-sonarqube_sonarqube_data
npm run sonar:start
```

## Ejecución Simultánea con Backend

Si estás ejecutando SonarQube para frontend y backend simultáneamente:

- **Frontend**: http://localhost:9000
- **Backend**: http://localhost:9001

Ambos pueden correr al mismo tiempo sin conflictos. Para ejecutar análisis de ambos:

```bash
# En el directorio del frontend
npm run quality

# En el directorio del backend
npm run quality
```

Los reportes estarán disponibles en sus respectivos dashboards.

## Estructura de Archivos de SonarQube

```
flowmatic-frontend/
├── docker-compose.sonarqube-frontend.yml  # Configuración Docker
├── sonar-project.properties               # Configuración del proyecto
├── coverage/                              # Reportes de cobertura (generado)
│   ├── lcov.info                         # Formato LCOV para SonarQube
│   └── index.html                        # Reporte HTML
└── .env.local                            # Variables de entorno (crear)
```

## Configuración de Exclusión

El archivo `sonar-project.properties` excluye automáticamente:

- Archivos de pruebas (`**/*.test.{ts,tsx}`)
- Archivos de configuración (`**/*.config.*`)
- Directorios de build (`.next/`, `dist/`, `coverage/`)
- Archivos de utilidades de testing (`test-utils.tsx`)

## Troubleshooting

### Error: "SonarScanner not found"
```bash
# Instalar SonarScanner globalmente
npm install -g sonarqube-scanner

# O usar npx
npm run sonar:scan
```

### Error: "Project key already exists"
- Cambia el project key en `sonar-project.properties`
- O elimina el proyecto existente en SonarQube

### Error: "Token not found"
- Verifica que el archivo `.env.local` existe
- Verifica que la variable `SONAR_TOKEN` está definida
- Regenera el token en SonarQube si es necesario

### Error: "Connection refused"
- Verifica que SonarQube está ejecutándose: `npm run sonar:start`
- Espera 2-3 minutos para que inicie completamente
- Verifica que el puerto 9000 no está ocupado

### Error: "Coverage report not found"
- Ejecuta primero: `npm run test:coverage`
- Verifica que el archivo `coverage/lcov.info` existe

## Integración con CI/CD

Para usar en pipelines de CI/CD, agrega estas variables de entorno:

```yaml
# GitHub Actions example
env:
  SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
  SONAR_HOST_URL: http://localhost:9000

steps:
  - name: Run tests with coverage
    run: npm run test:coverage
  
  - name: Run SonarQube analysis
    run: npm run sonar:scan
```

## Reportes y Dashboards

### Dashboard Principal
- **URL**: http://localhost:9000/dashboard?id=flowmatic-frontend
- **Contenido**: Métricas generales, cobertura, duplicación, deuda técnica

### Reporte de Cobertura
- **URL**: http://localhost:4000/coverage/index.html (después de `npm run test:coverage`)
- **Contenido**: Cobertura detallada por archivo, línea por línea

### Reporte de Pruebas
- **URL**: http://localhost:4000/test-ui (después de `npm run test:ui`)
- **Contenido**: Interfaz visual de pruebas, resultados en tiempo real

## Mejores Prácticas

1. **Ejecutar análisis regularmente**: Después de cada commit importante
2. **Revisar métricas**: Mantener cobertura >60%, deuda técnica <5 días
3. **Corregir issues críticos**: Bugs y vulnerabilidades primero
4. **Documentar decisiones**: Para code smells que no se corrigen
5. **Integrar en CI/CD**: Automatizar análisis en cada PR

## Comandos de Desarrollo Diario

```bash
# Desarrollo normal
npm run dev

# Antes de commit
npm run quality

# Verificar cobertura
npm run test:coverage

# Análisis completo (semanal)
npm run sonar:start
npm run quality
npm run sonar:stop
```

## Conclusión

SonarQube proporciona análisis completo de calidad de código para el frontend de Flowmatic. Con esta configuración, puedes:

- ✅ Monitorear cobertura de código en tiempo real
- ✅ Detectar bugs y vulnerabilidades temprano
- ✅ Mantener deuda técnica bajo control
- ✅ Asegurar estándares de calidad consistentes
- ✅ Integrar análisis en pipelines de CI/CD

La configuración está optimizada para trabajar tanto en desarrollo local como en entornos de CI/CD, proporcionando feedback continuo sobre la calidad del código.
