import { useMemo, useState } from 'react'

interface Node {
  id: string
  label: string
  type: 'router' | 'firewall' | 'switch' | 'server' | 'pc'
  ip: string
  status?: 'up' | 'down' | 'warning'
}

interface Link {
  from: string
  to: string
  label?: string
}

interface Topology {
  nodes: Node[]
  links: Link[]
}

interface TopologyVisualizerProps {
  configJson: string
}

export default function TopologyVisualizer({ configJson }: TopologyVisualizerProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // Parse safety
  const topology = useMemo<Topology>(() => {
    try {
      const parsed = JSON.parse(configJson)
      if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.links)) {
        return parsed as Topology
      }
    } catch {
      // Fallback fallback if invalid JSON
    }
    return {
      nodes: [
        { id: 'r1', label: 'Core Router', type: 'router', ip: '192.168.1.1', status: 'up' },
        { id: 'fw1', label: 'Edge Firewall', type: 'firewall', ip: '192.168.1.254', status: 'up' },
        { id: 'sw1', label: 'Core Switch', type: 'switch', ip: '192.168.1.2', status: 'up' },
        { id: 'srv1', label: 'Target Server', type: 'server', ip: '192.168.1.100', status: 'warning' },
      ],
      links: [
        { from: 'r1', to: 'fw1' },
        { from: 'fw1', to: 'sw1' },
        { from: 'sw1', to: 'srv1' },
      ],
    }
  }, [configJson])

  // Circular layout generator for nodes to place them inside the SVG
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {}
    const count = topology.nodes.length
    const radius = 120
    const centerX = 200
    const centerY = 180

    topology.nodes.forEach((node, index) => {
      const angle = (index * 2 * Math.PI) / count
      positions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      }
    })
    return positions
  }, [topology])

  // Helper icons based on type
  const getIcon = (type: string) => {
    switch (type) {
      case 'router': return '🎛️'
      case 'firewall': return '🧱'
      case 'switch': return '🔌'
      case 'server': return '🗄️'
      case 'pc': return '💻'
      default: return '🖥️'
    }
  }

  return (
    <div className="relative glass-card rounded-2xl p-6 h-full flex flex-col justify-between border border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-3">
        <h3 className="font-semibold text-sm text-[var(--color-neon-cyan)] font-mono tracking-wider uppercase">
          📡 Network Topology Map
        </h3>
        <span className="text-xs text-[var(--color-text-muted)] font-mono">
          Nodes: {topology.nodes.length} | Links: {topology.links.length}
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1 min-h-[300px] bg-slate-950/40 rounded-xl border border-[var(--color-border)]/50 overflow-hidden flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 360">
          {/* Defs for gradients */}
          <defs>
            <linearGradient id="link-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-neon-cyan)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-neon-green)" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Links / Connections */}
          {topology.links.map((link, idx) => {
            const p1 = nodePositions[link.from]
            const p2 = nodePositions[link.to]
            if (!p1 || !p2) return null

            return (
              <g key={`link-${idx}`}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="url(#link-grad)"
                  strokeWidth="2.5"
                  strokeDasharray="5,5"
                  className="animate-[dash_10s_linear_infinite]"
                />
                <circle
                  cx={(p1.x + p2.x) / 2}
                  cy={(p1.y + p2.y) / 2}
                  r="3.5"
                  fill="var(--color-neon-cyan)"
                  className="animate-pulse"
                />
              </g>
            )
          })}

          {/* Nodes */}
          {topology.nodes.map((node) => {
            const pos = nodePositions[node.id]
            if (!pos) return null
            const isSelected = selectedNode?.id === node.id

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
              >
                {/* Glow ring */}
                <circle
                  r="24"
                  fill="rgba(10, 22, 40, 0.8)"
                  stroke={isSelected ? "var(--color-neon-cyan)" : "var(--color-border)"}
                  strokeWidth={isSelected ? "2.5" : "1.5"}
                  className="transition-all duration-300 group-hover:stroke-[var(--color-neon-green)] group-hover:scale-110"
                />
                {/* Node icon */}
                <text
                  textAnchor="middle"
                  dy=".3em"
                  fontSize="18"
                  className="select-none"
                >
                  {getIcon(node.type)}
                </text>
                {/* Mini status indicator */}
                <circle
                  cx="15"
                  cy="-15"
                  r="5"
                  fill={node.status === 'warning' ? '#fbbf24' : node.status === 'down' ? '#f87171' : 'var(--color-neon-green)'}
                  className="animate-pulse"
                />
                {/* Node Name */}
                <text
                  textAnchor="middle"
                  y="38"
                  fontSize="10"
                  fill="var(--color-text-muted)"
                  className="font-mono select-none pointer-events-none group-hover:fill-[var(--color-text-primary)]"
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Node details pane */}
      <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-[var(--color-border)]/50 min-h-[85px] flex flex-col justify-center">
        {selectedNode ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-[var(--color-text-primary)] font-mono">{selectedNode.label}</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono badge-medium uppercase">
                {selectedNode.type}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] font-mono">
              IP Address: <span className="text-[var(--color-neon-cyan)]">{selectedNode.ip}</span>
            </p>
            <p className="text-xs text-[var(--color-text-muted)] font-mono">
              Status:{' '}
              <span className={selectedNode.status === 'warning' ? 'text-amber-400' : 'text-[var(--color-neon-green)]'}>
                {selectedNode.status || 'Active'}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-xs text-[var(--color-text-muted)] text-center italic font-mono">
            💡 Click on any network node to inspect its attributes
          </p>
        )}
      </div>

      {/* CSS dash animation styles */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -40;
          }
        }
      `}</style>
    </div>
  )
}
