# Legal Dashboard

Dashboard de análisis de métricas operativas para consultas legales, construido con Next.js, TypeScript, Tailwind CSS y Framer Motion.

## Características

- **Dashboard de Métricas**: KPIs en tiempo real y visualización de datos con gráficos interactivos
- **Tabla de Emails**: Vista detallada de consultas procesadas con filtros avanzados (fecha, estado, plantilla, confianza)
- **Análisis de Plantillas**: Rendimiento y uso de plantillas con comparativas y distribuciones
- **Resumen de Envíos**: Evolución de consultas enviadas con análisis de confianza
- **Asistente IA**: Asistente inteligente integrado con n8n con contexto del dashboard

## Tecnología

- **Next.js 16** (App Router)
- **TypeScript** para type safety
- **Tailwind CSS v4** para estilos
- **Framer Motion** para animaciones
- **Recharts** para visualización de datos
- **Lucide Icons** para iconografía

## Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

\`\`\`env
# n8n Webhook Integration (requerido para chat)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id

# Google Sheets (para integración futura)
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_SHEETS_RANGE=LOGS!A:Z
\`\`\`

## Instalación y Desarrollo

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir en navegador
# http://localhost:3000
\`\`\`

## Build y Producción

\`\`\`bash
# Build para producción
npm run build

# Iniciar servidor de producción
npm start
\`\`\`

## Estructura del Proyecto

\`\`\`
├── app/
│   ├── api/
│   │   ├── logs/route.ts          # API para obtener logs con filtros
│   │   └── assist/route.ts        # API para chat con n8n webhook
│   ├── chat/page.tsx              # Página de chat con IA
│   ├── emails/page.tsx            # Tabla de emails con filtros avanzados
│   ├── envios/page.tsx            # Resumen de envíos y análisis
│   ├── plantillas/page.tsx        # Análisis de plantillas
│   ├── page.tsx                   # Dashboard principal
│   ├── layout.tsx                 # Layout raíz
│   └── globals.css                # Estilos globales con tema oscuro
├── components/
│   ├── sidebar.tsx                # Navegación lateral
│   ├── topbar.tsx                 # Barra superior con búsqueda
│   ├── kpi-card.tsx               # Componente de KPI
│   └── charts/                    # Componentes de gráficos
│       ├── time-series-chart.tsx
│       ├── stacked-bars-chart.tsx
│       └── pie-templates-chart.tsx
├── lib/
│   ├── types.ts                   # Tipos TypeScript
│   └── utils-metrics.ts           # Utilidades de cálculo de métricas
└── public/                        # Archivos estáticos
\`\`\`

## Características Principales

### Dashboard
- 4 KPIs principales: Total Procesados, Tasa de Respuesta, Tasa de Ambigüedad, Confianza Media
- Gráficos interactivos con Recharts
- Animaciones suaves con Framer Motion

### Emails
- Tabla expandible con detalles de cada consulta
- Filtros avanzados: rango de fechas, estado, plantilla, confianza mínima
- Búsqueda por email, Message ID, Thread ID
- Contador de resultados

### Plantillas
- Estadísticas por plantilla
- Gráficos de distribución de resultados
- Análisis de confianza promedio
- Tasas de éxito y respuesta

### Envíos
- Evolución temporal de envíos
- Distribución por confianza (alta/media/baja)
- Desglose por plantilla
- Métricas de promedio diario

### Asistente IA
- Integración con n8n webhook
- Contexto automático del dashboard
- Acciones rápidas para consultas comunes
- Historial de conversación

## API Endpoints

### GET /api/logs
Obtiene logs con filtros opcionales.

**Query Parameters:**
- `startDate`: Fecha inicio (ISO format)
- `endDate`: Fecha fin (ISO format)
- `resultado`: Estados separados por coma (ENVIADO, PENDIENTE, NO_RESPONDER)
- `template_key`: Plantillas separadas por coma
- `minConfidence`: Confianza mínima (0-1)
- `search`: Búsqueda por email/messageId/threadId

**Ejemplo:**
\`\`\`
GET /api/logs?resultado=ENVIADO&minConfidence=0.8&startDate=2025-10-01T00:00:00Z
\`\`\`

### POST /api/assist
Envía un mensaje al asistente IA.

**Body:**
\`\`\`json
{
  "message": "Tu pregunta aquí",
  "context": {
    "totalLogs": 100,
    "enviados": 80,
    "pendientes": 15,
    "noResponder": 5,
    "avgConfidence": 0.85,
    "templates": ["FAMILIARES_ESPAÑOLES", "NACIONALIDAD_RESIDENCIA"]
  }
}
\`\`\`

## Tipos de Datos

### LogItem
\`\`\`typescript
type LogItem = {
  fecha: string // ISO timestamp
  messageId: string
  threadId: string
  from: string // Email address
  template_key: string
  motivo: string // Reason/subject
  titulo: string | null
  confidence: number // 0..1
  rationale: string
  pdf_url: string | null
  resultado: "ENVIADO" | "PENDIENTE" | "NO_RESPONDER"
}
\`\`\`

## Próximas Mejoras

- [ ] Integración completa con Google Sheets API
- [ ] Persistencia de chat en base de datos
- [ ] Autenticación de usuarios
- [ ] Exportación a CSV/PDF
- [ ] Dashboards personalizables
- [ ] Rate limiting mejorado
- [ ] Notificaciones en tiempo real
- [ ] Análisis predictivo

## Deployment

### Vercel (Recomendado)

1. Push el código a GitHub
2. Conecta el repositorio en [Vercel](https://vercel.com)
3. Configura las variables de entorno en Vercel
4. Deploy automático en cada push

### Otros Proveedores

El proyecto es compatible con cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## Licencia

MIT

## Soporte

Para reportar bugs o sugerir mejoras, abre un issue en el repositorio.
