import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Sparkles,
  Database,
  HardDrive,
  Brain,
  Wifi,
  Globe,
  Monitor,
  Server,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import api from '@/services/api'
import type { ApiResponse, HealthResponse, NetworkTrust } from '@/types/health'

const SERVICE_META: Record<string, { label: string; icon: typeof Database }> = {
  postgres: { label: 'PostgreSQL', icon: Database },
  redis: { label: 'Redis', icon: HardDrive },
  minio: { label: 'MinIO', icon: Server },
  ollama: { label: 'Ollama', icon: Brain },
}

const TRUST_META: Record<NetworkTrust, { label: string; icon: typeof Wifi; color: string; glow: string }> = {
  LOCALHOST: {
    label: 'Localhost',
    icon: Monitor,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    glow: 'shadow-violet-500/20',
  },
  HOME: {
    label: 'Home Network',
    icon: Wifi,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    glow: 'shadow-emerald-500/20',
  },
  REMOTE: {
    label: 'Remote',
    icon: Globe,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    glow: 'shadow-amber-500/20',
  },
}

export function Home() {
  const {
    data: health,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<HealthResponse>>({
    queryKey: ['health'],
    queryFn: () => api.get('/public/health'),
    refetchInterval: 30_000,
  })

  const response = health?.data

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25"
          >
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>

          <h1 className="font-heading mb-2 text-4xl font-bold tracking-tight text-white">
            Hello, Nexus
          </h1>
          <p className="text-slate-400">
            Your family operating system
          </p>
        </div>

        {/* Network Trust Badge */}
        {response && <TrustBadge trust={response.networkTrust} />}

        {/* Service Health Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Services
            </h2>
            <button
              onClick={() => refetch()}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          )}

          {isError && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-center text-sm text-rose-400">
              Backend unreachable
            </div>
          )}

          {response && (
            <div className="space-y-3">
              {Object.entries(response.services).map(([key, status], i) => {
                const meta = SERVICE_META[key]
                if (!meta) return null
                const Icon = meta.icon
                const isUp = status === 'UP'

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-300">{meta.label}</span>
                    </div>
                    {isUp ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-400" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Overall Status */}
          {response && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-4 flex items-center justify-center gap-2 pt-3 border-t border-white/[0.06]"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  response.status === 'UP'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span className="text-xs text-slate-500">
                {response.status === 'UP' ? 'all systems operational' : 'degraded'}
              </span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

function TrustBadge({ trust }: { trust: NetworkTrust }) {
  const meta = TRUST_META[trust]
  const Icon = meta.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="mb-6 flex justify-center"
    >
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-md ${meta.color} ${meta.glow}`}
      >
        <Icon className="h-4 w-4" />
        {meta.label}
      </div>
    </motion.div>
  )
}
