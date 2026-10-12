import type { SupabaseClient } from '@supabase/supabase-js'
import type { BusinessProfile } from '@/lib/engine/diagnostic'

export async function getOrCreateWorkspace(supabase:SupabaseClient, userId:string, profile?:BusinessProfile){
  const existing=(await supabase.from('workspaces').select('*').eq('user_id',userId).maybeSingle()).data
  if(existing){
    if(profile){
      const payload={name:profile.businessName||existing.name,offer:profile.offer,ideal_customer:profile.idealCustomer,avg_customer_value:profile.avgValue,monthly_leads:profile.monthlyLeads,lead_source:profile.leadSource,crm:profile.crm,booking_tool:profile.bookingTool,profile,updated_at:new Date().toISOString()}
      const {data,error}=await supabase.from('workspaces').update(payload).eq('id',existing.id).select().single(); if(error)throw error; return data
    }
    return existing
  }
  const payload={user_id:userId,name:profile?.businessName||'My Revenue Engine',offer:profile?.offer||null,ideal_customer:profile?.idealCustomer||null,avg_customer_value:profile?.avgValue||0,monthly_leads:profile?.monthlyLeads||0,lead_source:profile?.leadSource||null,crm:profile?.crm||null,booking_tool:profile?.bookingTool||null,profile:profile||{}}
  const {data,error}=await supabase.from('workspaces').insert(payload).select().single(); if(error)throw error; return data
}
