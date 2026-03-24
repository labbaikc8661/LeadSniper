'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Lead } from '@/types';
import LeadDetail from '@/components/dashboard/LeadDetail';

export default function LeadPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLead() {
      const { data } = await supabase
        .from('ms_leads')
        .select('*, search:ms_searches(*)')
        .eq('id', params.id)
        .single();

      if (data) setLead(data as Lead);
      setLoading(false);
    }
    fetchLead();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-8 shimmer rounded-xl w-48" />
        <div className="shimmer h-[600px] rounded-2xl" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>Lead not found</p>
        <button onClick={() => router.push('/dashboard/leads')} className="gradient-btn mt-4">
          Back to Leads
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm mb-4 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="surface-card p-6">
          <LeadDetail lead={lead} onUpdate={() => router.refresh()} />
        </div>
      </motion.div>
    </div>
  );
}
