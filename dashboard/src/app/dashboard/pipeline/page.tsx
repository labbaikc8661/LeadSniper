'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useLeads, updateLeadStatus } from '@/lib/hooks';
import { KANBAN_COLUMNS, LEAD_STATUS_CONFIG, Lead, LeadStatus } from '@/types';
import LeadCard from '@/components/dashboard/LeadCard';
import SlideDrawer from '@/components/ui/SlideDrawer';
import LeadDetail from '@/components/dashboard/LeadDetail';

export default function PipelinePage() {
  const { leads, loading, refetch } = useLeads();
  const [localLeads, setLocalLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Sync leads to local state for optimistic updates
  const currentLeads = localLeads.length > 0 ? localLeads : leads;

  // Update local state when leads change
  if (leads.length > 0 && localLeads.length === 0) {
    setLocalLeads(leads);
  }

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      const newStatus = destination.droppableId as LeadStatus;

      // Optimistic update
      setLocalLeads((prev) =>
        prev.map((lead) => (lead.id === draggableId ? { ...lead, status: newStatus } : lead))
      );

      // Database sync
      const success = await updateLeadStatus(draggableId, newStatus);
      if (!success) {
        // Rollback on failure
        setLocalLeads((prev) =>
          prev.map((lead) =>
            lead.id === draggableId
              ? { ...lead, status: source.droppableId as LeadStatus }
              : lead
          )
        );
      }
    },
    []
  );

  const getColumnLeads = (status: LeadStatus) =>
    currentLeads.filter((l) => l.status === status);

  if (loading && leads.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-8 shimmer rounded-xl w-48" />
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shimmer min-w-[280px] h-[400px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Drag leads between columns to update their status
        </p>
      </motion.div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {KANBAN_COLUMNS.map((status, colIndex) => {
            const config = LEAD_STATUS_CONFIG[status];
            const columnLeads = getColumnLeads(status);

            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIndex * 0.05 }}
                className="min-w-[280px] w-[280px] flex-shrink-0 flex flex-col"
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: config.color }}
                  />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {config.label}
                  </span>
                  <span
                    className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: config.bgColor, color: config.color }}
                  >
                    {columnLeads.length}
                  </span>
                </div>

                {/* Droppable area */}
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2 p-2 rounded-2xl transition-colors duration-200 min-h-[400px] flex-1"
                      style={{
                        background: snapshot.isDraggingOver
                          ? 'var(--bg-hover)'
                          : 'var(--bg-secondary)',
                        border: `1px solid ${
                          snapshot.isDraggingOver
                            ? 'var(--border-medium)'
                            : 'var(--border-subtle)'
                        }`,
                      }}
                    >
                      {columnLeads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                            >
                              <LeadCard
                                lead={lead}
                                isDragging={snapshot.isDragging}
                                onClick={() => setSelectedLead(lead)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </motion.div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Lead Detail Drawer */}
      <SlideDrawer
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title={selectedLead?.business_name || ''}
        width="max-w-xl"
      >
        {selectedLead && (
          <LeadDetail
            lead={selectedLead}
            onUpdate={() => {
              setSelectedLead(null);
              setLocalLeads([]);
              refetch();
            }}
          />
        )}
      </SlideDrawer>
    </div>
  );
}
