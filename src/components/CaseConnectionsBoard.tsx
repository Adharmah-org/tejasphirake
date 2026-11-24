import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, FileText, MapPin, Search, ShieldAlert, UserCheck } from 'lucide-react';
import type { CaseNode, StoryCaseBoard } from '../data/caseConnectionsData';

interface CaseConnectionsBoardProps {
  board: StoryCaseBoard;
  bookSlug?: string;
}

export function CaseConnectionsBoard({ board, bookSlug }: CaseConnectionsBoardProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(board.nodes[0]?.id || '');
  const [hideSpoilers, setHideSpoilers] = useState(true);

  const selectedNode = board.nodes.find((n) => n.id === selectedNodeId) || board.nodes[0];

  const getRoleIcon = (role: CaseNode['role']) => {
    switch (role) {
      case 'investigator':
        return <Search className="h-3.5 w-3.5 text-[#C9A45C]" />;
      case 'suspect':
        return <UserCheck className="h-3.5 w-3.5 text-[#DEC07C]" />;
      case 'evidence':
        return <FileText className="h-3.5 w-3.5 text-[#E5A952]" />;
      case 'location':
        return <MapPin className="h-3.5 w-3.5 text-[#9A9285]" />;
      default:
        return <ShieldAlert className="h-3.5 w-3.5 text-[#C9A45C]" />;
    }
  };

  const getRoleBadgeStyle = (role: CaseNode['role']) => {
    switch (role) {
      case 'investigator':
        return 'text-[#DEC07C]';
      case 'suspect':
        return 'text-[#E5A952]';
      case 'evidence':
        return 'text-[#EFEAE0]';
      case 'location':
        return 'text-[#9A9285]';
      default:
        return 'text-[#9A9285]';
    }
  };

  const activeConnections = board.connections.filter(
    (c) => c.fromId === selectedNode?.id || c.toId === selectedNode?.id
  );

  return (
    <section className="mt-8 rounded-lg border border-[#2B2823] bg-[#0E0D0B] p-6 sm:p-8">
      {/* Header Strip */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#2B2823] pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C9A45C]">
            Investigative Dossier
          </span>
          <h3 className="mt-1 font-literary text-2xl text-[#EFEAE0] sm:text-3xl">
            {board.title}
          </h3>
          <p className="mt-1 text-xs text-[#9A9285]">{board.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => setHideSpoilers((v) => !v)}
          className={`inline-flex items-center gap-2 rounded border px-3.5 py-2 text-xs transition-colors whitespace-nowrap ${
            hideSpoilers
              ? 'border-[#2B2823] bg-[#141311] text-[#DEC07C] hover:border-[#C9A45C]'
              : 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#FFF8EA]'
          }`}
        >
          {hideSpoilers ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span>{hideSpoilers ? 'Hide Plot Spoilers' : 'Showing All Spoilers'}</span>
        </button>
      </div>

      {/* Nodes Corkboard Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
          {board.nodes.map((node) => {
            const isSelected = node.id === selectedNode?.id;
            const isBlur = hideSpoilers && node.isSpoiler;

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedNodeId(node.id)}
                className={`relative flex flex-col justify-between rounded-md border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-[#C9A45C] bg-[#1C1A17] shadow-[0_0_15px_rgba(201,164,92,0.12)]'
                    : 'border-[#2B2823] bg-[#141311] hover:border-[#C9A45C]/40 hover:bg-[#181613]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium capitalize ${getRoleBadgeStyle(
                        node.role
                      )}`}
                    >
                      {getRoleIcon(node.role)}
                      <span>{node.role}</span>
                    </span>
                    {node.page && (
                      <span className="text-[10px] tabular-nums text-[#9A9285]">
                        Page {node.page}
                      </span>
                    )}
                  </div>

                  <h4 className="mt-2.5 font-literary text-lg font-medium text-[#EFEAE0]">
                    {node.name}
                  </h4>

                  <p
                    className={`editorial-justify mt-1.5 text-xs leading-relaxed ${
                      isBlur
                        ? 'select-none blur-[4px] text-[#9A9285]'
                        : 'text-[#C4BDB0]'
                    }`}
                  >
                    {node.description}
                  </p>
                </div>

                {isBlur && (
                  <span className="mt-2 inline-block text-[10px] italic text-[#DEC07C]">
                    [Tap 'Showing All Spoilers' to unblur]
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Dossier & Connections Inspector */}
        <div className="rounded-md border border-[#2B2823] bg-[#141311] p-5 lg:col-span-5">
          {selectedNode ? (
            <div>
              <div className="flex items-center justify-between border-b border-[#2B2823] pb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C9A45C]">
                  Case File Focus
                </span>
                {selectedNode.page && bookSlug && (
                  <Link
                    to={`/read/${bookSlug}?page=${selectedNode.page}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#DEC07C] hover:underline"
                  >
                    <span>Open Reader Page {selectedNode.page}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>

              <h4 className="mt-3 font-literary text-2xl text-[#EFEAE0]">
                {selectedNode.name}
              </h4>
              <p className="mt-0.5 text-xs capitalize text-[#C9A45C]">
                Role: {selectedNode.role}
              </p>

              <p
                className={`editorial-justify mt-3 text-xs leading-relaxed ${
                  hideSpoilers && selectedNode.isSpoiler
                    ? 'select-none blur-[4px] text-[#9A9285]'
                    : 'text-[#C4BDB0]'
                }`}
              >
                {selectedNode.description}
              </p>

              {/* Red-String Thread Connections */}
              <div className="mt-6 border-t border-[#2B2823] pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#DEC07C]">
                  Connected Threads ({activeConnections.length})
                </p>

                <div className="mt-3 space-y-2">
                  {activeConnections.length === 0 ? (
                    <p className="text-xs text-[#9A9285]">No recorded direct cross-threads.</p>
                  ) : (
                    activeConnections.map((conn, idx) => {
                      const otherId =
                        conn.fromId === selectedNode.id ? conn.toId : conn.fromId;
                      const otherNode = board.nodes.find((n) => n.id === otherId);
                      const isConnSpoiler = hideSpoilers && conn.isSpoiler;

                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 rounded border border-[#2B2823] bg-[#0E0D0B] p-2.5 text-xs"
                        >
                          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#E55353] shadow-[0_0_8px_rgba(229,83,83,0.7)]" />
                          <div className="min-w-0">
                            <span className="font-literary text-sm text-[#EFEAE0]">
                              {otherNode?.name || otherId}
                            </span>
                            <p
                              className={`mt-0.5 text-[11px] ${
                                isConnSpoiler
                                  ? 'select-none blur-[3px] text-[#9A9285]'
                                  : 'text-[#DEC07C]'
                              }`}
                            >
                              {conn.relation}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#9A9285]">Select an evidence node to inspect details.</p>
          )}
        </div>
      </div>
    </section>
  );
}
